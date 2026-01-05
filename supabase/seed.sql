-- This file is now primarily for seeding sample data that depends on the canonical taxonomy.
-- The canonical categories are now seeded from the `taxonomy_contract.json` file.
-- To seed the categories, run the following command from the project root:
-- npm run db:seed:categories

-- Seed Sample Listings
-- Note: This assumes you have already run the category seeding script.
INSERT INTO listings (name, category_id, location, is_verified)
SELECT
  'Creative Design Studio',
  c.id,
  'Fitzroy',
  TRUE
FROM categories c WHERE c.name = 'Design & Creative' AND c.type = 'business';

INSERT INTO listings (name, category_id, location, is_verified)
SELECT
  'Pixel Perfect Photography',
  c.id,
  'St Kilda',
  TRUE
FROM categories c WHERE c.name = 'Media Creation' AND c.type = 'business';

INSERT INTO listings (name, category_id, location, is_verified)
SELECT
  'Melbourne Web Solutions',
  c.id,
  'Richmond',
  FALSE
FROM categories c WHERE c.name = 'Technology & Automation' AND c.type = 'business';

INSERT INTO listings (name, category_id, location, is_verified)
SELECT
  'Content Craft Copywriting',
  c.id,
  'Collingwood',
  FALSE
FROM categories c WHERE c.name = 'Marketing & Content' AND c.type = 'business';
