-- Migration: Monetization RPCs
-- Description: Functions for Secure Join, Promotion Task Claiming, and Reconciliation.

BEGIN;

-- 1. insert_verified_queue_entry
-- Called by Edge Function after Server-Side Verify.
CREATE OR REPLACE FUNCTION public.insert_verified_queue_entry(
    p_listing_id uuid,
    p_setup_intent_id text,
    p_payment_method_id text,
    p_stripe_customer_id text,
    p_consent_hash text
)
RETURNS bigint -- Returns new Queue Position
LANGUAGE plpgsql
SECURITY DEFINER -- Needs access to Queue table
AS $$
DECLARE
    v_council text;
    v_pos bigint;
    v_count integer;
BEGIN
    -- Get Council
    SELECT l.council_name INTO v_council
    FROM public.listings li
    JOIN public.localities l ON li.location = l.suburb_name
    WHERE li.id = p_listing_id;

    IF v_council IS NULL THEN
        RAISE EXCEPTION 'Council not found for listing';
    END IF;

    -- Strict Serialized Locking (Per Council)
    -- Advisory Xact Lock ensures we serialize inserts for this council to strictly enforce the cap
    PERFORM pg_advisory_xact_lock(hashtext('featured_queue:' || v_council));

    -- Check Strict Cap (Pending + Processing + Requiring Action = The Queue)
    SELECT count(*) INTO v_count
    FROM public.featured_queue
    WHERE council_name = v_council
    AND status IN ('pending_ready', 'processing_payment', 'requires_action');

    IF v_count >= 10 THEN
        RAISE EXCEPTION 'Queue Full (Max 10)';
    END IF;

    -- Check Duplicate (Lifecycle)
    -- (Covered by Partial Index, but good to check gracefully)
    PERFORM 1 FROM public.featured_queue
    WHERE listing_id = p_listing_id
    AND status IN ('pending_ready', 'processing_payment', 'requires_action', 'active');
    
    IF FOUND THEN
         RAISE EXCEPTION 'Listing already in queue or active';
    END IF;

    -- Insert
    INSERT INTO public.featured_queue (
        listing_id, council_name, status,
        stripe_setup_intent_id, payment_method_id, stripe_customer_id,
        consent_text_hash, consent_at,
        price_locked_cents
    ) VALUES (
        p_listing_id, v_council, 'pending_ready',
        p_setup_intent_id, p_payment_method_id, p_stripe_customer_id,
        p_consent_hash, now(),
        4900 -- $49.00 Fixed Price (Could fetch from DB but fixed constant is safer for V1)
    );

    -- Return Post-Insert Position
    RETURN v_count + 1;
END;
$$;


-- 2. claim_promotion_tasks
-- Called by Edge Function (The Postman) to lock rows for charging
CREATE OR REPLACE FUNCTION public.claim_promotion_tasks(p_limit integer)
RETURNS TABLE (
    queue_id bigint,
    stripe_customer_id text,
    payment_method_id text,
    price_cents integer,
    promotion_attempt integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH open_councils AS (
        -- Find Councils with < 5 Active slots
        -- Note: This is a snapshot read. We rely on the Edge Function loop to be fast.
        -- Theoretically a race could happen where 2 slots open and 2 tasks claimed, but finalization locks again?
        -- No, 'active' status is the source of truth.
        SELECT l.council_name
        FROM public.localities l
        GROUP BY l.council_name
        HAVING (
            SELECT count(*) 
            FROM public.featured_queue q 
            WHERE q.status = 'active' 
            AND q.council_name = l.council_name
             AND q.ends_at > now()
        ) < 5
    ),
    locked_rows AS (
        -- Select Top Pending for Open Councils
        -- SKIP LOCKED prevents concurrency duplicates
        SELECT q.id
        FROM public.featured_queue q
        JOIN open_councils oc ON q.council_name = oc.council_name
        WHERE q.status = 'pending_ready'
        ORDER BY q.created_at ASC, q.id ASC -- Deterministic FIFO
        LIMIT p_limit
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.featured_queue q
    SET 
        status = 'processing_payment',
        processing_started_at = now(),
        processing_expires_at = now() + interval '10 minutes'
        -- CRASH SAFETY FIX: Do NOT increment promotion_attempt here.
        -- We keep the same attempt count so that if we crash and retry, 
        -- we generate the SAME Idempotency Key (queue_id + attempt).
        -- This ensures Stripe returns the original PI instead of double-charging.
    FROM locked_rows lr
    WHERE q.id = lr.id
    RETURNING 
        q.id AS queue_id,
        q.stripe_customer_id,
        q.payment_method_id,
        q.price_locked_cents AS price_cents,
        q.promotion_attempt;
END;
$$;


-- 3. reconcile_and_finalize
-- Called by Edge Function to finalize Active or Action Required
CREATE OR REPLACE FUNCTION public.reconcile_and_finalize(
    p_queue_id bigint,
    p_status public.queue_status,
    p_stripe_pi_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.featured_queue
    SET 
        status = p_status,
        stripe_payment_intent_id = COALESCE(p_stripe_pi_id, stripe_payment_intent_id),
        processing_expires_at = NULL, -- Clear lock
        -- Set Dates if Active
        started_at = CASE WHEN p_status = 'active' THEN now() ELSE started_at END,
        ends_at = CASE WHEN p_status = 'active' THEN now() + interval '30 days' ELSE ends_at END,
        -- Set Action Expiry if Action Required
        requires_action_expires_at = CASE WHEN p_status = 'requires_action' THEN now() + interval '24 hours' ELSE NULL END
    WHERE id = p_queue_id;
END;
$$;


-- 4. cleanup_stuck_processing
-- Returns stuck rows for Edge Function to Reconcile
CREATE OR REPLACE FUNCTION public.cleanup_stuck_processing()
RETURNS TABLE (
    queue_id bigint,
    stripe_payment_intent_id text,
    promotion_attempt integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT id, q.stripe_payment_intent_id, q.promotion_attempt
    FROM public.featured_queue q
    WHERE status = 'processing_payment'
    AND processing_expires_at < now();
END;
$$;


-- 5. expire_finished_slots
-- Auto-expire active slots
CREATE OR REPLACE FUNCTION public.expire_finished_slots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.featured_queue
    SET status = 'expired'
    WHERE status = 'active'
    AND ends_at < now();
END;
$$;


-- 6. expire_stalled_actions
-- Fail users who missed the 24h window
CREATE OR REPLACE FUNCTION public.expire_stalled_actions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
     UPDATE public.featured_queue
     SET status = 'payment_failed'
     WHERE status = 'requires_action'
     AND requires_action_expires_at < now();
END;
$$;

COMMIT;
