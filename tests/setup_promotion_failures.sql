-- Setup Promotion Failure Tests
-- Usage: Execute this, then run process-featured-queue EACH TIME to see effect.

-- 0. Cleanup Specific Test Listings
DELETE FROM public.featured_queue WHERE listing_id IN (
    'failure-test-01-decline', 'failure-test-02-sca', 'failure-test-03-expiry'
);
DELETE FROM public.listings WHERE id IN (
    'failure-test-01-decline', 'failure-test-02-sca', 'failure-test-03-expiry'
);

-- 1. Create Listings (Using Valid UUIDs generated on fly or explicit)
-- We need explicit UUIDs for tracking.
INSERT INTO public.listings (id, location, name, owner_id) VALUES
('11111111-1111-1111-1111-111111111111', 'Richmond, VIC', 'Decline Test', 'a0000000-0000-0000-0000-000000000001'),
('22222222-2222-2222-2222-222222222222', 'Richmond, VIC', 'SCA Test', 'a0000000-0000-0000-0000-000000000001'),
('33333333-3333-3333-3333-333333333333', 'Richmond, VIC', 'Expiry Test', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Queue Entries

-- A. Decline Path
INSERT INTO public.featured_queue (
    listing_id, council_name, location, status, stripe_customer_id, payment_method_id, price_locked_cents, created_at
) VALUES (
    '11111111-1111-1111-1111-111111111111', 'City of Yarra', 'Richmond, VIC', 
    'pending_ready', 'cus_TmO153562ozKrB', 'pm_card_visa_chargeDeclined', 4900, now()
);

-- B. SCA Path
INSERT INTO public.featured_queue (
    listing_id, council_name, location, status, stripe_customer_id, payment_method_id, price_locked_cents, created_at
) VALUES (
    '22222222-2222-2222-2222-222222222222', 'City of Yarra', 'Richmond, VIC', 
    'pending_ready', 'cus_TmO153562ozKrB', 'pm_card_authenticationRequired', 4900, now()
);

-- C. Expiry Path (Pre-staged as requires_action expired)
INSERT INTO public.featured_queue (
    listing_id, council_name, location, status, stripe_customer_id, payment_method_id, price_locked_cents, 
    created_at, requires_action_expires_at
) VALUES (
    '33333333-3333-3333-3333-333333333333', 'City of Yarra', 'Richmond, VIC', 
    'requires_action', 'cus_TmO153562ozKrB', 'pm_card_visa', 4900, 
    now() - interval '25 hours', -- EXPIRED (Window is 24h)
    now() - interval '1 hour'
);
