-- Verification Script: Featured Queue Logic Constraint
-- Description: Tests Locking, Caps, and Duplicates via SQL (Mocking the RPC logic)

-- Setup: Pick a test council
-- We need a listing in 'Melbourne'. Let's find one or create a mock one.
DO $$ 
DECLARE
    v_user_id uuid;
    v_listing_id uuid;
    v_council text := 'Melbourne'; -- Assuming this exists in localities
    v_pos bigint;
BEGIN
    -- 1. Create Mock User & Listing for Test
    -- (We assume we can just pick an existing one or create temp)
    -- Actually, safer to rely on existing data if possible, or create temp fixtures.
    -- Let's create a dummy user/listing in a transaction that we ROLLBACK at the end?
    -- No, 'insert_verified_queue_entry' commits? No, it's called inside the transaction if we wrap it?
    -- RPC is atomic but if we wrap in BEGIN/ROLLBACK it should revert.
    
    -- BUT, 'pg_advisory_xact_lock' is transaction level.
    
    RAISE NOTICE 'Starting Logic Verification...';
END $$;

-- Validation Block (We will run this as a transaction that rolls back to keep DB clean)
BEGIN;

-- 1. Clean Queue for 'City of Melbourne' (for test isolation)
DELETE FROM public.featured_queue WHERE council_name = 'City of Melbourne';

-- 2. Mock Data Setup
-- (We'll assume we have a user and listing that maps to 'City of Melbourne')
-- Let's insert a fake listing override for testing purposes if allowed?
-- Or better, insert 10 fake rows directly into 'featured_queue' to simulate full capacity.

    -- 1a. Fetch Real Listings (Need 11)
    CREATE TEMP TABLE temp_listings AS
    SELECT id FROM public.listings LIMIT 11;
    
    IF (SELECT count(*) FROM temp_listings) < 11 THEN
       RAISE NOTICE 'Skipping Test: Not enough mock listings in DB (Need 11)';
       RETURN;
    END IF;

    -- 1b. Insert Target (Row 1)
    INSERT INTO public.featured_queue (
        listing_id, council_name, location, status, stripe_customer_id, payment_method_id, stripe_setup_intent_id, created_at
    )
    SELECT 
        id,
        'Test Council A',
        'Test Suburb',
        'pending_ready',
        'cus_target', 'pm_target', 'seti_target',
        now()
    FROM temp_listings LIMIT 1 OFFSET 0;

    -- 1c. Insert Fillers (Rows 2-10 -> Total 10)
    INSERT INTO public.featured_queue (
        listing_id, council_name, location, status, stripe_customer_id, payment_method_id, stripe_setup_intent_id, created_at
    )
    SELECT 
        id,
        'Test Council A',
        'Test Suburb',
        'pending_ready',
        'cus_test', 'pm_test', 'seti_test',
        now()
    FROM temp_listings LIMIT 9 OFFSET 1; 

    -- 2. Test Partial Unique Constraint (Duplicate of Target #1)
    DO $$
    DECLARE
       v_listing_id uuid;
    BEGIN
        SELECT id INTO v_listing_id FROM temp_listings LIMIT 1 OFFSET 0;
        
        BEGIN
            INSERT INTO public.featured_queue (
                listing_id, council_name, location, status, stripe_customer_id
            ) VALUES (
                v_listing_id, -- Duplicate ID
                'Test Council A',
                'Test Suburb',
                'pending_ready',
                'cus_fail'
            );
            RAISE EXCEPTION 'Constraint Failed: Duplicate insert should have failed!';
        EXCEPTION WHEN unique_violation THEN
            RAISE NOTICE 'CHECK 2: PASS - Duplicate Constraint Prevented Insert';
        END;
    END $$;

ROLLBACK; -- Clean up
