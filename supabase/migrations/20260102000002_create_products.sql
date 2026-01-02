-- Create Products Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category_id BIGINT REFERENCES product_categories(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for filtering
CREATE INDEX idx_products_listing ON products(listing_id);
CREATE INDEX idx_products_category ON products(category_id);

-- Trigger Function to check product limits based on tier
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  current_tier listing_tier;
  max_limit INTEGER;
BEGIN
  -- Get the tier of the listing
  SELECT tier INTO current_tier FROM listings WHERE id = NEW.listing_id;
  
  -- Determine limit
  IF current_tier = 'Basic' THEN
    max_limit := 3;
  ELSIF current_tier = 'Pro' THEN
    max_limit := 10;
  ELSE
    max_limit := 3; -- Default safety
  END IF;

  -- Count existing products
  SELECT COUNT(*) INTO current_count FROM products WHERE listing_id = NEW.listing_id;

  IF current_count >= max_limit THEN
    RAISE EXCEPTION 'Product limit reached for % tier. Limit is %.', current_tier, max_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER check_product_limit_trigger
BEFORE INSERT ON products
FOR EACH ROW EXECUTE FUNCTION check_product_limit();

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Initial Policies
CREATE POLICY "Public read access for products" ON products
  FOR SELECT USING (true);
