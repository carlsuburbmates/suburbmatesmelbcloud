'use server';

import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// ============================================================================
// DELIVERABLE D1: CART SERVER ACTIONS
// File: app/actions/cart.ts
// Purpose: Server actions for shopping cart state management
// Evidence: Creates idempotent cart operations using cart_items table
// ============================================================================

// Zod schemas for input validation
const AddToCartSchema = z.object({
  productId: z.string().uuid('Product ID is required'),
  quantity: z.number().int().min(1).default(1),
});

const UpdateQuantitySchema = z.object({
  cartItemId: z.string().uuid('Cart item ID is required'),
  quantity: z.number().int().min(1).default(1),
});

const RemoveFromCartSchema = z.object({
  cartItemId: z.string().uuid('Cart item ID is required'),
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CartItem {
  id: string;
  product_id: string;
  listing_id: string | null;
  product_name: string | null;
  product_price_cents: number;
  quantity: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartWithListings extends CartItem {
  product_name: string | null;
  product_price_cents: number;
  listing_id: string | null;
  image_url: string | null;
}

// ============================================================================
// ACTION: ADD TO CART
// ============================================================================

export async function addToCart(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to add items to your cart' };
  }

  // Parse form data
  const productId = formData.get('productId');
  const quantity = formData.get('quantity');

  const validation = AddToCartSchema.safeParse({ productId, quantity });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  // Check if product exists
  const { data: product } = await supabase
    .from('products')
    .select('id, listing_id, name, price, image_url')
    .eq('id', productId)
    .single();

  if (!product) {
    return { error: 'Product not found' };
  }

  // Check if already in cart
  const { data: existing } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  // Upsert: update quantity if exists, otherwise insert
  const { error } = await supabase
    .from('cart_items')
    .upsert({
      user_id: user.id,
      product_id: productId,
      quantity: quantity,
    }, {
      onConflict: 'user_id,product_id',
      ignoreDuplicates: false,
    });

  if (error) {
    return { error: 'Failed to add item to cart' };
  }

  // Revalidate cart page
  revalidatePath('/cart');

  return { success: true, cartId: existing?.id || null };
}

// ============================================================================
// ACTION: UPDATE QUANTITY
// ============================================================================

export async function updateQuantity(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to manage your cart' };
  }

  const cartItemId = formData.get('cartItemId');
  const quantity = formData.get('quantity');

  const validation = UpdateQuantitySchema.safeParse({ cartItemId, quantity });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  // Update quantity
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .eq('user_id', user.id);

  if (error) {
    return { error: 'Failed to update cart item' };
  }

  return { success: true };
}

// ============================================================================
// ACTION: REMOVE FROM CART
// ============================================================================

export async function removeFromCart(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to manage your cart' };
  }

  const cartItemId = formData.get('cartItemId');

  const validation = RemoveFromCartSchema.safeParse({ cartItemId });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  // Remove from cart
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', user.id);

  if (error) {
    return { error: 'Failed to remove item from cart' };
  }

  // Revalidate cart page
  revalidatePath('/cart');

  return { success: true };
}

// ============================================================================
// ACTION: GET CART
// ============================================================================

export async function getCart() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { cart: [] };
  }

  // Fetch cart items with product details
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select(`
      cart_items.id,
      cart_items.quantity,
      cart_items.created_at,
      cart_items.updated_at,
      products.id as product_id,
      products.name as product_name,
      products.price as product_price_cents,
      products.image_url,
      listings.id as listing_id
    `)
    .eq('user_id', user.id)
    .order('cart_items.updated_at', { ascending: false });

  return { cart: cartItems };
}

// ============================================================================
// ACTION: CLEAR CART
// ============================================================================

export async function clearCart() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to manage your cart' };
  }

  // Clear all cart items for user
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    return { error: 'Failed to clear cart' };
  }

  // Revalidate cart page
  revalidatePath('/cart');

  return { success: true };
}
