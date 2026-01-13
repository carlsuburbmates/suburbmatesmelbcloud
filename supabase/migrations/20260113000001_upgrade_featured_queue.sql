-- Migration: Upgrade Featured Queue for Council Scarcity
-- URL: /supabase/migrations/20260113000001_upgrade_featured_queue.sql

BEGIN;

-- 1. Add council_name to featured_queue
ALTER TABLE public.featured_queue 
ADD COLUMN IF NOT EXISTS council_name text;

-- 2. Backfill council_name from listings -> localities
UPDATE public.featured_queue fq
SET council_name = loc.council_name
FROM public.listings l
JOIN public.localities loc ON l.location = loc.suburb_name
WHERE fq.listing_id = l.id
AND fq.council_name IS NULL;

-- 3. Create/Update Availability RPC
CREATE OR REPLACE FUNCTION public.check_queue_availability(target_council text)
RETURNS TABLE (
    active_count bigint,
    queue_position bigint
)
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
    v_active bigint;
    v_pending bigint;
BEGIN
    -- Count Active Slots (Limit 5)
    SELECT COUNT(*) INTO v_active
    FROM public.featured_queue
    WHERE council_name = target_council
    AND status = 'active'
    AND ends_at > now();

    -- Count Pending Queue
    SELECT COUNT(*) INTO v_pending
    FROM public.featured_queue
    WHERE council_name = target_council
    AND status = 'pending';

    RETURN QUERY SELECT v_active, (v_pending + 1);
END;
$function$;

COMMIT;
