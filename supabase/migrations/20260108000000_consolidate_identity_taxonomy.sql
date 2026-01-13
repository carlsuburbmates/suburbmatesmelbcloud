-- Migration: Consolidate Identity & Enforce Taxonomy
-- 1. Drop Legacy 'actors' table (Split Brain resolution)
DROP TABLE IF EXISTS public.actors;

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
