-- Migration: Monetisation & Security Fixes
-- Run this in the Supabase SQL Editor

-- 1. Add Monetisation Fields to Profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_status text;

-- 2. Create Featured Queue Table
CREATE TABLE IF NOT EXISTS public.featured_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid NOT NULL,
    council_area text NOT NULL,
    requested_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    scheduled_start timestamp with time zone,
    status text DEFAULT 'pending'::text, -- pending, active, completed, expired
    CONSTRAINT featured_queue_pkey PRIMARY KEY (id)
);

-- 3. Add Foreign Key for Featured Queue
ALTER TABLE public.featured_queue
DROP CONSTRAINT IF EXISTS featured_queue_listing_id_fkey;

ALTER TABLE public.featured_queue
ADD CONSTRAINT featured_queue_listing_id_fkey 
FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;

-- 4. Enable RLS on Queue
ALTER TABLE public.featured_queue ENABLE ROW LEVEL SECURITY;

-- 5. Security Hardening (RLS Policies)
-- Remove the insecure "Public Read All" policies if they exist (to be safe, we drop and recreate strict ones)
DROP POLICY IF EXISTS "Public read access for listings" ON public.listings;
DROP POLICY IF EXISTS "Users can insert own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;

-- Recreate Strict Policies
CREATE POLICY "Public read access for listings" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Users can insert own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own listings" ON public.listings FOR DELETE USING (auth.uid() = owner_id);

-- Profiles Policies
DROP POLICY IF EXISTS "Public read access for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public read access for profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories & Tags (Read Only for Public)
DROP POLICY IF EXISTS "Public read access for categories" ON public.categories;
CREATE POLICY "Public read access for categories" ON public.categories FOR SELECT USING (true);

-- Featured Queue (Service Role Only - No Public Policies = Default Deny)

