-- Migration: Create join_queue RPC
-- URL: /supabase/migrations/20260113000003_create_join_queue_rpc.sql

BEGIN;

CREATE OR REPLACE FUNCTION public.join_queue(p_listing_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_council text;
    v_owner_id uuid;
    v_current_status text;
BEGIN
    -- 1. Get Listing Details & Council
    SELECT l.owner_id, loc.council_name
    INTO v_owner_id, v_council
    FROM public.listings l
    JOIN public.localities loc ON l.location = loc.suburb_name
    WHERE l.id = p_listing_id;

    IF v_council IS NULL THEN
        RAISE EXCEPTION 'Listing location does not map to a known Council.';
    END IF;

    -- 2. Check Authorization (Must be owner)
    IF v_owner_id != auth.uid() THEN
        RAISE EXCEPTION 'You do not own this listing.';
    END IF;

    -- 3. Check Duplicate Entry (Already Active or Pending)
    SELECT status INTO v_current_status
    FROM public.featured_queue
    WHERE listing_id = p_listing_id
    AND status IN ('active', 'pending');

    IF v_current_status IS NOT NULL THEN
        RAISE EXCEPTION 'Listing is already % in the queue.', v_current_status;
    END IF;

    -- 4. Join Queue
    INSERT INTO public.featured_queue (
        listing_id,
        council_name,
        status,
        requested_at
    ) VALUES (
        p_listing_id,
        v_council,
        'pending',
        now()
    );

    RETURN json_build_object(
        'success', true,
        'message', 'Joined queue for ' || v_council,
        'council', v_council
    );
END;
$function$;

COMMIT;
