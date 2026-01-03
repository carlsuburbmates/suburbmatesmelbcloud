-- Function to validate category type
CREATE OR REPLACE FUNCTION check_category_type()
RETURNS TRIGGER AS $$
DECLARE
  category_type TEXT;
BEGIN
  SELECT type INTO category_type FROM categories WHERE id = NEW.category_id;

  IF TG_TABLE_NAME = 'listings' AND category_type <> 'business' THEN
    RAISE EXCEPTION 'Listings can only be assigned to "business" categories.';
  END IF;

  IF TG_TABLE_NAME = 'products' AND category_type <> 'product' THEN
    RAISE EXCEPTION 'Products can only be assigned to "product" categories.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for category type validation
CREATE TRIGGER listings_check_category_type
BEFORE INSERT OR UPDATE ON listings
FOR EACH ROW EXECUTE FUNCTION check_category_type();

CREATE TRIGGER products_check_category_type
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION check_category_type();

-- Function to check tag limit
CREATE OR REPLACE FUNCTION check_tag_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_limit INTEGER := 5;
BEGIN
  IF TG_TABLE_NAME = 'listing_tags' THEN
    SELECT COUNT(*) INTO current_count FROM listing_tags WHERE listing_id = NEW.listing_id;
  ELSIF TG_TABLE_NAME = 'product_tags' THEN
    SELECT COUNT(*) INTO current_count FROM product_tags WHERE product_id = NEW.product_id;
  END IF;

  IF current_count >= max_limit THEN
    RAISE EXCEPTION 'Tag limit of % reached for this entity.', max_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for tag limit
CREATE TRIGGER listing_tags_check_limit
BEFORE INSERT ON listing_tags
FOR EACH ROW EXECUTE FUNCTION check_tag_limit();

CREATE TRIGGER product_tags_check_limit
BEFORE INSERT ON product_tags
FOR EACH ROW EXECUTE FUNCTION check_tag_limit();

-- RPC function to upsert a tag
CREATE OR REPLACE FUNCTION upsert_tag(tag_name TEXT)
RETURNS UUID AS $$
DECLARE
  tag_slug TEXT;
  tag_id UUID;
BEGIN
  tag_slug := lower(regexp_replace(tag_name, '[^a-zA-Z0-9]+', '-', 'g'));

  INSERT INTO tags (name, slug)
  VALUES (tag_name, tag_slug)
  ON CONFLICT (slug) DO UPDATE SET name = tag_name
  RETURNING id INTO tag_id;

  RETURN tag_id;
END;
$$ LANGUAGE plpgsql;
