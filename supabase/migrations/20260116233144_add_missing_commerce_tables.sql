-- Missing Commerce and Ops Tables (CORRECTED)
-- Purpose: Create tables that code references with corrected column names
-- Migration: 20260116233144_add_missing_commerce_tables.sql
-- Context: SQL verification confirmed ALL commerce and ops tables EXIST
-- Strategy: Idempotent CREATE IF NOT EXISTS for safety

-- 1. Reports (for user-reported content)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  reporter_email TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending', -- pending, reviewed, resolved
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Orders (for marketplace purchases)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),
  total_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid, fulfilled, cancelled
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Order Items (for products in orders)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_cents INTEGER NOT NULL, -- Price at time of purchase
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cart Items (for shopping cart state)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 5. Localities (for council/suburb mapping) - COLUMN NAME CORRECTED
CREATE TABLE IF NOT EXISTS public.localities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  council_name TEXT NOT NULL,
  suburb_name TEXT NOT NULL,
  state TEXT NOT NULL,
  postcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(council_name, suburb_name)
);

-- Indexes for reports table
CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON public.reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- Indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Indexes for order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Indexes for cart_items table
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product ON public.cart_items(user_id, product_id);

-- Indexes for localities table
CREATE INDEX IF NOT EXISTS idx_localities_council ON public.localities(council_name);
CREATE INDEX IF NOT EXISTS idx_localities_suburb ON public.localities(suburb_name); -- CORRECTED from 'suburb'
