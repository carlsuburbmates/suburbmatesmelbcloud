-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access for tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read access for listing_tags" ON listing_tags FOR SELECT USING (true);
CREATE POLICY "Public read access for product_tags" ON product_tags FOR SELECT USING (true);

-- Policies for owner-only writes on join tables
CREATE POLICY "Allow insert for listing owners" ON listing_tags FOR INSERT
WITH CHECK (
  (SELECT auth.uid() IN (SELECT owner_id FROM listings WHERE id = listing_id))
);;

CREATE POLICY "Allow delete for listing owners" ON listing_tags FOR DELETE
USING (
  (SELECT auth.uid() IN (SELECT owner_id FROM listings WHERE id = listing_id))
);;

CREATE POLICY "Allow insert for product owners" ON product_tags FOR INSERT
WITH CHECK (
  (SELECT auth.uid() IN (SELECT l.owner_id FROM listings l JOIN products p ON l.id = p.listing_id WHERE p.id = product_id))
);

CREATE POLICY "Allow delete for product owners" ON product_tags FOR DELETE
USING (
  (SELECT auth.uid() IN (SELECT l.owner_id FROM listings l JOIN products p ON l.id = p.listing_id WHERE p.id = product_id))
);

-- Deny all client-side writes to the tags table
CREATE POLICY "Deny all client-side writes to tags" ON tags
FOR ALL USING (false);
