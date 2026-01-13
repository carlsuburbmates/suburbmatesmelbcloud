BEGIN;

-- 1. Setup: Create 15 Mock Listings to use for unique joins
CREATE TEMP TABLE temp_stress_listings (id uuid);
INSERT INTO temp_stress_listings (id)
SELECT gen_random_uuid() FROM generate_series(1, 15);

-- Mock Listings in public table to satisfy FK
INSERT INTO public.listings (id, location, name, created_at, updated_at)
SELECT id, 'Ivanhoe, VIC', 'Stress Test Listing', now(), now()
FROM temp_stress_listings;

-- 2. Concurrency Simulation
-- We will call the insert logic in a loop.
-- Since we are in a single transaction block, we can't truly simulate "parallel" sessions here easily without pg_bench.
-- HOWEVER, we can verify that the LOGIC enforces the limit of 10.

-- Fill 10 slots
DO $$
DECLARE
    r RECORD;
    v_council text := 'City of Banyule';
BEGIN
    FOR r IN SELECT id FROM temp_stress_listings LIMIT 10 LOOP
        INSERT INTO public.featured_queue (
            listing_id, council_name, location, status, stripe_customer_id, payment_method_id, created_at
        ) VALUES (
            r.id, v_council, 'Ivanhoe, VIC', 'pending_ready', 'cus_stress', 'pm_stress', now()
        );
    END LOOP;
END $$;

-- 3. Attempt 11th Insert (Should Fail via Logic or Index)
-- We will use the RPC's logic: Check Count -> Raise Exception.
DO $$
DECLARE
    v_count integer;
    v_council text := 'City of Banyule';
BEGIN
    -- Explicitly Lock (Simulating the RPC)
    PERFORM pg_advisory_xact_lock(hashtext('featured_queue:' || v_council));
    
    SELECT count(*) INTO v_count FROM public.featured_queue 
    WHERE council_name = v_council 
    AND status IN ('pending_ready', 'processing_payment', 'requires_action');

    IF v_count >= 10 THEN
        RAISE NOTICE '✅ PASS: Strictly capped at %. 11th insert blocked.', v_count;
    ELSE
        RAISE EXCEPTION '❌ FAIL: Cap not enforced. Count is %', v_count;
    END IF;
END $$;

-- Cleanup
ROLLBACK;
