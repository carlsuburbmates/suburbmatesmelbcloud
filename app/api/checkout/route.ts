import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Zod schema for request validation
const CheckoutRequestSchema = z.object({
  cartItems: z.array(z.object({
    productId: z.string().uuid('Product ID is required'),
    quantity: z.number().int().min(1).default(1),
  })).min(1, 'Cart must have at least one item'),
});

export interface CheckoutRequest {
  cartItems: Array<{
    productId: string;
    quantity: number;
  }>;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'You must be logged in to checkout' },
      { status: 401 }
    );
  }

  const body = await req.json();
  const validation = CheckoutRequestSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { cartItems } = validation.data;

  // Calculate totals and build line items
  let totalCents = 0;
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  const sellerIds = new Set<string>();

  for (const item of cartItems) {
    const product = await getProduct(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Product not found: ${item.productId}` },
        { status: 400 }
      );
    }

    const itemTotal = product.price * item.quantity;
    totalCents += itemTotal;

    lineItems.push({
      price_data: {
        currency: 'aud',
        product_data: {
          name: product.name || 'Product',
          metadata: {
            product_id: item.productId,
          },
        },
        unit_amount: product.price,
      },
      quantity: item.quantity,
    });

    const sellerId = await getSellerId(item.productId);
    if (!sellerId) {
      return NextResponse.json(
        { error: `Product ${item.productId} has no associated seller` },
        { status: 400 }
      );
    }
    sellerIds.add(sellerId);
  }

  if (sellerIds.size > 1) {
    return NextResponse.json(
      { error: 'Multi-seller carts are not supported yet. Please checkout with items from a single seller.' },
      { status: 400 }
    );
  }

  const sellerId = Array.from(sellerIds)[0];
  const platformFeeCents = Math.round(totalCents * 0.06);
  const sellerEarningsCents = totalCents - platformFeeCents;

  const { data: sellerProfile } = await supabase
    .from('users_public')
    .select('stripe_account_id')
    .eq('id', sellerId)
    .single();

  const sellerStripeAccountId = sellerProfile?.stripe_account_id;

  if (!sellerStripeAccountId) {
    return NextResponse.json(
      { error: 'Seller has not connected a Stripe account. Cannot process checkout.' },
      { status: 400 }
    );
  }

  // Create order as pending BEFORE redirect
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: user.id,
      seller_id: sellerId,
      total_cents: totalCents,
      status: 'pending',
      platform_fee_cents: platformFeeCents,
      seller_earnings_cents: sellerEarningsCents,
      seller_stripe_account_id: sellerStripeAccountId,
      payout_status: 'pending',
      metadata: {
        cart_item_ids: cartItems.map(item => item.productId),
        total_cents: totalCents,
        platform_fee_cents: platformFeeCents,
        seller_earnings_cents: sellerEarningsCents,
        purchase_type: 'product_sale',
      },
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Failed to create order:', orderError);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }

  console.log('Order created before redirect:', order.id);

  // Create order items with price at time of purchase
  const orderItems = await Promise.all(cartItems.map(async (item) => {
    const product = await getProduct(item.productId);
    return {
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_cents: product?.price || 0,
    };
  }));

  await supabase.from('order_items').insert(orderItems);

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
    customer_email: user.email,
    payment_intent_data: {
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
    },
    metadata: {
      order_id: order.id,
      customer_id: user.id,
      seller_id: sellerId,
      platform_fee_cents: platformFeeCents.toString(),
      seller_earnings_cents: sellerEarningsCents.toString(),
      purchase_type: 'product_sale',
    },
  });

  // Store session ID on order
  await supabase
    .from('orders')
    .update({ stripe_checkout_session_id: session.id })
    .eq('id', order.id);

  console.log('Stripe checkout session created:', session.id, 'Order ID:', order.id);

  return NextResponse.json({
    orderId: order.id,
    sessionUrl: session.url,
  });
}

async function getProduct(productId: string) {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('id, name, price, listing_id')
    .eq('id', productId)
    .single();

  return product;
}

async function getSellerId(productId: string): Promise<string> {
  const product = await getProduct(productId);

  if (!product || !product.listing_id) {
    return '';
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from('listings')
    .select('user_id')
    .eq('id', product.listing_id)
    .single();

  return listing?.user_id || '';
}
