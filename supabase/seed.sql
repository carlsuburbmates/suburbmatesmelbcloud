-- ============================================================================
-- SEED DATA FOR LOCAL DEVELOPMENT
-- ============================================================================
-- Runs after `supabase db reset`. Keep it simple and idempotent.
-- ============================================================================

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
INSERT INTO localities (suburb_name, council_name, state, postcode) VALUES
  ('Fitzroy', 'City of Yarra', 'VIC', '3065'),
  ('St Kilda', 'City of Port Phillip', 'VIC', '3182'),
  ('Richmond', 'City of Yarra', 'VIC', '3121'),
  ('Collingwood', 'City of Yarra', 'VIC', '3066'),
  ('South Melbourne', 'City of Port Phillip', 'VIC', '3205'),
  ('Carlton', 'City of Melbourne', 'VIC', '3053'),
  ('Brunswick', 'City of Moreland', 'VIC', '3056'),
  ('Prahran', 'City of Stonnington', 'VIC', '3181')
ON CONFLICT DO NOTHING;
