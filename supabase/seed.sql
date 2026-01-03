-- This file is now primarily for seeding sample data that depends on the canonical taxonomy.
-- The canonical categories are now seeded from the `taxonomy_contract.json` file.
-- To seed the categories, run the following command from the project root:
-- npm run db:seed:categories

-- Seed Sample Listings
-- Note: This assumes you have already run the category seeding script.
INSERT INTO listings (name, slug, category_id, location, is_featured, is_verified)
SELECT
  'Creative Design Studio',
  'creative-design-studio',
  c.id,
  'Fitzroy',
  TRUE,
  TRUE
FROM categories c WHERE c.name = 'Design & Creative' AND c.type = 'business'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO listings (name, slug, category_id, location, is_featured, is_verified)
SELECT
  'Pixel Perfect Photography',
  'pixel-perfect-photography',
  c.id,
  'St Kilda',
  FALSE,
  TRUE
FROM categories c WHERE c.name = 'Media Creation' AND c.type = 'business'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO listings (name, slug, category_id, location, is_featured, is_verified)
SELECT
  'Melbourne Web Solutions',
  'melbourne-web-solutions',
  c.id,
  'Richmond',
  TRUE,
  FALSE
FROM categories c WHERE c.name = 'Technology & Automation' AND c.type = 'business'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO listings (name, slug, category_id, location, is_featured, is_verified)
SELECT
  'Content Craft Copywriting',
  'content-craft-copywriting',
  c.id,
  'Collingwood',
  FALSE,
  FALSE
FROM categories c WHERE c.name = 'Marketing & Content' AND c.type = 'business'
ON CONFLICT (slug) DO NOTHING;
