-- Rename 'profiles' to 'users_public' to comply with SSOT (No 'profile' term)
-- Renaming table
ALTER TABLE IF EXISTS public.profiles RENAME TO users_public;

-- Update the Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_public (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'visitor'::app_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger to ensure it uses the updated function (logic)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Transfer RLS Policies (or recreate them if they don't auto-transfer appropriately)
-- Assuming Policies exist on 'profiles', standard rename handles them, but good to verify.
-- Policy: Public Read
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users_public;
CREATE POLICY "Public users are viewable by everyone" 
ON public.users_public FOR SELECT USING (true);

-- Policy: Users can insert their own
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users_public;
CREATE POLICY "Users can insert their own record" 
ON public.users_public FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own
DROP POLICY IF EXISTS "Users can update own profile" ON public.users_public;
CREATE POLICY "Users can update own record" 
ON public.users_public FOR UPDATE USING (auth.uid() = id);
