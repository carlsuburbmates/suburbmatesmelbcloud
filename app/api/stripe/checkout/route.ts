import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { priceId } = await req.json();
        const PRO_PRICE_ID = process.env.STRIPE_PRICE_ID_PRO;
        const FEATURED_PRICE_ID = process.env.STRIPE_PRICE_ID_FEATURED;

        if (!PRO_PRICE_ID) {
            return new NextResponse('Server Config Error: Missing Price ID', { status: 500 });
        }

        // 1. Get or Create Stripe Customer
        const { data: profile } = await supabase
            .from('users_public')
            .select('stripe_customer_id, email, full_name')
            .eq('id', user.id)
            .single();

        let customerId = profile?.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: profile?.email || user.email,
                name: profile?.full_name || undefined,
                metadata: {
                    supabase_user_id: user.id
                }
            });
            customerId = customer.id;

            await supabase
                .from('users_public')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id);
        }

        // 2. Create Checkout Session
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // Detect Mode (Subscription vs One-time)
        const isFeatured = priceId === FEATURED_PRICE_ID;
        const mode = isFeatured ? 'payment' : 'subscription';

        // Success URL based on type
        // If featured, go back to promote page? Or dashboard?
        // Let's settle on:
        // Pro -> /studio/billing
        // Featured -> /studio/promote
        const successUrl = isFeatured
            ? `${origin}/studio/promote?success=true`
            : `${origin}/studio/billing?success=pro_upgrade`;

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: mode,
            success_url: successUrl,
            cancel_url: `${origin}/pricing`, // simplified
            metadata: {
                supabase_user_id: user.id,
                purchase_type: isFeatured ? 'featured_placement' : 'pro_subscription'
            },
            subscription_data: mode === 'subscription' ? {
                metadata: {
                    supabase_user_id: user.id
                }
            } : undefined
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
