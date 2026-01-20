-- ============================================================================
-- SEED DATA FOR LOCAL DEVELOPMENT
-- ============================================================================
-- This file runs automatically after `supabase db reset`
-- Add test data here for local development
-- 
-- Current categories (from migrations):
--   Business: Brand Identity, Web Design, UI/UX Design, Illustration,
--             Photography, Videography, Audio Production, Animation,
--             Social Media Management, Copywriting, Content Marketing,
--             SEO & Strategy, Web Development, No-Code Automation,
--             App Development, Business Consulting
--   Product:  Templates & Systems, Design & Creative Assets, Media Assets,
--             Education & Guides, Software & Tools, Other Digital Products
-- ============================================================================

-- Seed Sample Listings (linked to actual categories)
INSERT INTO listings (name, category_id, location, is_verified, tier)
SELECT
  'Creative Design Studio',
  c.id,
  'Fitzroy',
  TRUE,
  'pro'
FROM categories c WHERE c.name = 'Brand Identity' AND c.type = 'business'
ON CONFLICT DO NOTHING;

INSERT INTO listings (name, category_id, location, is_verified, tier)
SELECT
  'Pixel Perfect Photography',
  c.id,
  'St Kilda',
  TRUE,
  'pro'
FROM categories c WHERE c.name = 'Photography' AND c.type = 'business'
ON CONFLICT DO NOTHING;

INSERT INTO listings (name, category_id, location, is_verified, tier)
SELECT
  'Melbourne Web Solutions',
  c.id,
  'Richmond',
  FALSE,
  'free'
FROM categories c WHERE c.name = 'Web Development' AND c.type = 'business'
ON CONFLICT DO NOTHING;

INSERT INTO listings (name, category_id, location, is_verified, tier)
SELECT
  'Content Craft Copywriting',
  c.id,
  'Collingwood',
  FALSE,
  'free'
FROM categories c WHERE c.name = 'Copywriting' AND c.type = 'business'
ON CONFLICT DO NOTHING;

INSERT INTO listings (name, category_id, location, is_verified, tier)
SELECT
  'Video Magic Productions',
  c.id,
  'South Melbourne',
  TRUE,
  'pro'
FROM categories c WHERE c.name = 'Videography' AND c.type = 'business'
ON CONFLICT DO NOTHING;

-- Seed Sample Products
INSERT INTO products (name, category_id, price, description)
SELECT
  'Website Template Pack',
  c.id,
  49.99,
  'Professional website templates for small businesses'
FROM categories c WHERE c.name = 'Templates & Systems' AND c.type = 'product'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, category_id, price, description)
SELECT
  'Icon Set Collection',
  c.id,
  29.99,
  '500+ hand-crafted icons for UI design'
FROM categories c WHERE c.name = 'Design & Creative Assets' AND c.type = 'product'
ON CONFLICT DO NOTHING;

-- Seed Sample Tags
INSERT INTO tags (name, slug) VALUES
  ('Logo Design', 'logo-design'),
  ('Branding', 'branding'),
  ('Portrait', 'portrait'),
  ('Wedding', 'wedding'),
  ('E-commerce', 'e-commerce'),
  ('WordPress', 'wordpress'),
  ('SEO', 'seo'),
  ('Social Media', 'social-media')
ON CONFLICT (slug) DO NOTHING;

-- Seed Sample Localities (Melbourne councils)
INSERT INTO localities (name, council_name, state, postcode) VALUES
  ('Fitzroy', 'City of Yarra', 'VIC', '3065'),
  ('St Kilda', 'City of Port Phillip', 'VIC', '3182'),
  ('Richmond', 'City of Yarra', 'VIC', '3121'),
  ('Collingwood', 'City of Yarra', 'VIC', '3066'),
  ('South Melbourne', 'City of Port Phillip', 'VIC', '3205'),
  ('Carlton', 'City of Melbourne', 'VIC', '3053'),
  ('Brunswick', 'City of Moreland', 'VIC', '3056'),
  ('Prahran', 'City of Stonnington', 'VIC', '3181')
ON CONFLICT DO NOTHING;
