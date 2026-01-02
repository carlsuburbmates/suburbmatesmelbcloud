-- Drop initial permissive policy
DROP POLICY IF EXISTS "Public read access for products" ON products;

-- 1. SELECT: Public/Visitors
-- Can see products where the parent listing is visible (filtered by enforcement states)
CREATE POLICY "Public select non-restricted products" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings
      JOIN public.profiles ON profiles.id = listings.owner_id
      WHERE listings.id = products.listing_id
      AND profiles.is_delisted = FALSE
      AND profiles.is_suspended = FALSE
      AND profiles.is_evicted = FALSE
    )
  );

-- 2. ALL: Owners (Creators)
-- Can manage products for listings they own.
CREATE POLICY "Owners can manage own products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = products.listing_id
      AND listings.owner_id = auth.uid()
    )
  );

-- 3. ALL: Operators
-- Full access for management.
CREATE POLICY "Operators have full access to products" ON products
  FOR ALL USING (public.get_my_role() = 'operator');
