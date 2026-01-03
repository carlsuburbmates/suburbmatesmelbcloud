-- First, insert the canonical categories. This should be idempotent due to the unique constraint.
-- It's necessary here so we can get the UUIDs for the backfill.
INSERT INTO categories (type, name) VALUES
('business', 'Design & Creative'),
('business', 'Media Creation'),
('business', 'Marketing & Content'),
('business', 'Technology & Automation'),
('business', 'Education & Consulting'),
('product', 'Templates & Systems'),
('product', 'Design & Creative Assets'),
('product', 'Media Assets'),
('product', 'Education & Guides'),
('product', 'Software & Tools'),
('product', 'Other Digital Products')
ON CONFLICT (type, name) DO NOTHING;

-- Create a temporary mapping table
CREATE TEMPORARY TABLE legacy_category_mapping (
  legacy_name TEXT PRIMARY KEY,
  new_category_name TEXT NOT NULL
);

-- Populate the mapping table
INSERT INTO legacy_category_mapping (legacy_name, new_category_name) VALUES
('photography', 'Media Creation'),
('graphic design', 'Design & Creative'),
('web development', 'Technology & Automation'),
('copywriting', 'Marketing & Content'),
('marketing', 'Marketing & Content'),
('seo', 'Marketing & Content'),
('videography', 'Media Creation'),
('illustration', 'Design & Creative'),
('branding', 'Design & Creative'),
('animation', 'Media Creation'),
('social media', 'Marketing & Content'),
('uxui design', 'Design & Creative'),
('music audio', 'Media Creation'),
('3d design', 'Design & Creative'),
('software development', 'Technology & Automation'),
('virtual assistant', 'Education & Consulting'),
('web designer', 'Technology & Automation'),
('graphic designer', 'Design & Creative'),
('photographer', 'Media Creation'),
('videographer', 'Media Creation'),
('illustrator', 'Design & Creative'),
('animator', 'Media Creation'),
('marketing consultant', 'Marketing & Content'),
('social media manager', 'Marketing & Content'),
('seo specialist', 'Marketing & Content'),
('accountant', 'Education & Consulting'),
('lawyer', 'Education & Consulting'),
('business coach', 'Education & Consulting'),
('life coach', 'Education & Consulting'),
('tutor', 'Education & Consulting');

-- Make category_id NOT NULL
DO $$
BEGIN
  IF (SELECT is_nullable FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'category_id') = 'YES' THEN
    ALTER TABLE listings
      ALTER COLUMN category_id SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF (SELECT is_nullable FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') = 'YES' THEN
    ALTER TABLE products
      ALTER COLUMN category_id SET NOT NULL;
  END IF;
END $$;

-- Drop the temporary table
DROP TABLE legacy_category_mapping;
