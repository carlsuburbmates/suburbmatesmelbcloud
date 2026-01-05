-- Seed script to promote a user to Operator role
-- Usage: Replace 'admin@suburbmates.au' with your actual account email.
-- Run this in the Supabase SQL Editor after you have signed up for the first time.

DO $$
DECLARE
  target_email TEXT := 'admin@suburbmates.au'; -- REPLACE THIS
BEGIN
  UPDATE public.actors
  SET role = 'operator'
  WHERE email = target_email;

  IF FOUND THEN
    RAISE NOTICE 'User % has been promoted to operator.', target_email;
  ELSE
    RAISE WARNING 'User % not found in public.actors. Ensure you have signed up first.', target_email;
  END IF;
END $$;
