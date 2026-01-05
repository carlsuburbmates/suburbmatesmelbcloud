-- Function to get the role of the current user
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS app_role AS $$
BEGIN
  RETURN (SELECT role FROM public.actors WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Drop initial permissive policy
DROP POLICY IF EXISTS "Public read access for listings" ON listings;

-- 1. SELECT: Public/Visitors
-- Can see listings where the owner is NOT delisted, NOT suspended, and NOT evicted.
-- Also can see unclaimed listings.
CREATE POLICY "Public select non-restricted listings" ON listings
  FOR SELECT USING (
    owner_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.actors
      WHERE actors.id = listings.owner_id
      AND actors.is_delisted = FALSE
      AND actors.is_suspended = FALSE
      AND actors.is_evicted = FALSE
    )
  );

-- 2. ALL: Owners (Creators)
-- Can manage their own listing, regardless of enforcement state (as they need to see warnings/etc in Studio).
CREATE POLICY "Owners can manage own listing" ON listings
  FOR ALL USING (auth.uid() = owner_id);

-- 3. ALL: Operators
-- Full access for management and enforcement.
CREATE POLICY "Operators have full access to listings" ON listings
  FOR ALL USING (public.get_my_role() = 'operator');
