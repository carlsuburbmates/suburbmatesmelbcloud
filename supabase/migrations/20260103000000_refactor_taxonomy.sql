-- Drop old category tables
DROP TABLE IF EXISTS business_categories CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;

-- Create canonical categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('business', 'product')),
  UNIQUE (type, name)
);

-- Create tags table
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

-- Create join table for listings and tags
CREATE TABLE listing_tags (
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, tag_id)
);

-- Create join table for products and tags
CREATE TABLE product_tags (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- Update listings table
ALTER TABLE listings
  DROP COLUMN IF EXISTS category_id,
  ADD COLUMN category_id UUID REFERENCES categories(id);

-- Update products table
ALTER TABLE products
  DROP COLUMN IF EXISTS category_id,
  ADD COLUMN category_id UUID REFERENCES categories(id);
