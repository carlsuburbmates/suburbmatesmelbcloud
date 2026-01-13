-- Setup for Join Queue Curl Tests
-- We need a known user and listing to generate a valid JWT and test ownership.

-- 1. Create Test User (if not exists)
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
    'a0000000-0000-0000-0000-000000000001', 
    'tester@example.com', 
    '{"stripe_customer_id": "cus_TmO153562ozKrB"}' -- Use the valid customer we created
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Listing Owned by Template User
INSERT INTO public.listings (id, owner_id, name, location, created_at, updated_at)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Curl Test Listing',
    'Ivanhoe, VIC',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- 3. Clean Queue
DELETE FROM public.featured_queue WHERE listing_id = 'b0000000-0000-0000-0000-000000000001';
