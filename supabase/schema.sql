--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema `public` since it already exists; skipping command

--
-- Name: app_role; Type: ENUM; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'visitor',
    'creator',
    'operator'
);

--
-- Name: listing_status; Type: ENUM; Schema: public; Owner: -
--

CREATE TYPE public.listing_status AS ENUM (
    'unclaimed',
    'claimed'
);

--
-- Name: listing_tier; Type: ENUM; Schema: public; Owner: -
--

CREATE TYPE public.listing_tier AS ENUM (
    'Basic',
    'Pro'
);

--
-- Categories table
--
CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    CONSTRAINT categories_type_check CHECK (((type = 'business'::text) OR (type = 'product'::text))),
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_type_name_key UNIQUE (type, name)
);

--
-- Tags table
--
CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    CONSTRAINT tags_pkey PRIMARY KEY (id),
    CONSTRAINT tags_slug_key UNIQUE (slug)
);

--
-- Users Public table
--
CREATE TABLE public.users_public (
    id uuid NOT NULL,
    role public.app_role DEFAULT 'visitor'::public.app_role NOT NULL,
    email text,
    full_name text,
    avatar_url text,
    warning_count integer DEFAULT 0 NOT NULL,
    is_delisted boolean DEFAULT false NOT NULL,
    is_suspended boolean DEFAULT false NOT NULL,
    suspended_until timestamp with time zone,
    is_evicted boolean DEFAULT false NOT NULL,
    evicted_at timestamp with time zone,
    violation_log jsonb DEFAULT '[]'::jsonb NOT NULL,
    -- Stripe / Monetisation Fields
    stripe_account_id text,
    stripe_customer_id text,
    stripe_subscription_status text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT users_public_pkey PRIMARY KEY (id)
);

--
-- Listings table
--
CREATE TABLE public.listings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid,
    name text NOT NULL,
    description text,
    location text NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    tier public.listing_tier DEFAULT 'Basic'::public.listing_tier NOT NULL,
    featured_until timestamp with time zone,
    status public.listing_status DEFAULT 'unclaimed'::public.listing_status NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    category_id uuid NOT NULL,
    CONSTRAINT listings_pkey PRIMARY KEY (id)
);

--
-- Products table
--
CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    business_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    category_id uuid NOT NULL,
    CONSTRAINT products_pkey PRIMARY KEY (id)
);

--
-- Listing Tags Join table
--
CREATE TABLE public.listing_tags (
    listing_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    CONSTRAINT listing_tags_pkey PRIMARY KEY (listing_id, tag_id)
);

--
-- Product Tags Join table
--
CREATE TABLE public.product_tags (
    product_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    CONSTRAINT product_tags_pkey PRIMARY KEY (product_id, tag_id)
);

--
-- Featured Queue Table (FIFO Logic)
--
CREATE TABLE public.featured_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid NOT NULL,
    council_area text NOT NULL,
    requested_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    scheduled_start timestamp with time zone,
    status text DEFAULT 'pending'::text, -- pending, active, completed, expired
    CONSTRAINT featured_queue_pkey PRIMARY KEY (id)
);

--
-- Foreign Keys
--

ALTER TABLE ONLY public.users_public
    ADD CONSTRAINT users_public_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.listings(id);

ALTER TABLE ONLY public.listing_tags
    ADD CONSTRAINT listing_tags_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.listing_tags
    ADD CONSTRAINT listing_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.featured_queue
    ADD CONSTRAINT featured_queue_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;

--
-- Row Level Security
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_public ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_queue ENABLE ROW LEVEL SECURITY;

--
-- Policies
--

-- Categories & Tags: Public Read, Service/Admin Write
CREATE POLICY "Public read access for categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read access for tags" ON public.tags FOR SELECT USING (true);

-- Users Public: Public Read Basic Info, Owner Write
CREATE POLICY "Public read access for users" ON public.users_public FOR SELECT USING (true);
CREATE POLICY "Users can update own record" ON public.users_public FOR UPDATE USING (auth.uid() = id);

-- Listings: Public Read, Owner Write
CREATE POLICY "Public read access for listings" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Users can insert own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own listings" ON public.listings FOR DELETE USING (auth.uid() = owner_id);

-- Products: Public Read, Owner (via Business) Write
CREATE POLICY "Public read access for products" ON public.products FOR SELECT USING (true);
-- Note: Product write policies require join verification or simplified checks. 
-- For simplicity in this patch, we allow if user owns the business (logic handled in app layer usually, but enforced here ideally).
-- Skipping complex RLS join for now to minimize SQL complexity, relying on API layer checks for product owners.

-- Featured Queue: Service Role Only (managed by payment webhooks/admin)
-- No public policies means default deny.