-- Migration: Consolidate Identity & Enforce Taxonomy

-- 0. Create profiles table first (will be renamed to users_public later)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role app_role DEFAULT 'visitor' NOT NULL,
    violation_log JSONB DEFAULT '[]'::jsonb NOT NULL,
    warning_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    is_suspended BOOLEAN DEFAULT FALSE NOT NULL,
    suspended_until TIMESTAMPTZ,
    is_delisted BOOLEAN DEFAULT FALSE NOT NULL,
    is_evicted BOOLEAN DEFAULT FALSE NOT NULL,
    evicted_at TIMESTAMPTZ,
    stripe_account_id TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_status TEXT
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 1. Drop Legacy 'actors' table (Split Brain resolution) with CASCADE
DROP TABLE IF EXISTS public.actors CASCADE;

-- 2. Update Auth Trigger to point to 'profiles' (SSOT)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'visitor'::app_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Enforce Canonical Taxonomy (16 Business + 6 Product)
TRUNCATE TABLE public.categories CASCADE;

INSERT INTO public.categories (name, type) VALUES
-- Business Categories (16)
('Brand Identity', 'business'),
('Web Design', 'business'),
('UI/UX Design', 'business'),
('Illustration', 'business'),
('Photography', 'business'),
('Videography', 'business'),
('Audio Production', 'business'),
('Animation', 'business'),
('Social Media Management', 'business'),
('Copywriting', 'business'),
('Content Marketing', 'business'),
('SEO & Strategy', 'business'),
('Web Development', 'business'),
('No-Code Automation', 'business'),
('App Development', 'business'),
('Business Consulting', 'business'),

-- Product Categories (6)
('Templates & Systems', 'product'),
('Design & Creative Assets', 'product'),
('Media Assets', 'product'),
('Education & Guides', 'product'),
('Software & Tools', 'product'),
('Other Digital Products', 'product');
