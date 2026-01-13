-- Migration: Platform Service Definitions
-- Purpose: Formalize "Pro" and "Featured" prices in the database to match SSOT.

-- 1. Create the Definitions Table
CREATE TABLE IF NOT EXISTS public.service_definitions (
    slug text PRIMARY KEY,
    name text NOT NULL,
    price_aud integer NOT NULL, -- In Cents
    stripe_price_id text NOT NULL,
    is_active boolean DEFAULT true
);

-- 2. Enable RLS (Public Read, Admin Write)
ALTER TABLE public.service_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for service_definitions" ON public.service_definitions;
CREATE POLICY "Public read access for service_definitions" ON public.service_definitions FOR SELECT USING (true);

-- 3. Seed Canonical Data
INSERT INTO public.service_definitions (slug, name, price_aud, stripe_price_id)
VALUES 
    ('pro_tier_monthly', 'Pro Tier (Monthly)', 2000, 'price_1SoikRClBfLESB1n5bYWi4AD'),
    ('featured_placement_30d', 'Featured Placement (30 Days)', 1500, 'price_1SoikSClBfLESB1nEj4aBQKu')
ON CONFLICT (slug) DO UPDATE SET
    price_aud = EXCLUDED.price_aud,
    stripe_price_id = EXCLUDED.stripe_price_id;
