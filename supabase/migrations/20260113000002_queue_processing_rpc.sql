-- Migration: Daily Queue Processing Logic (The Engine)
-- URL: /supabase/migrations/20260113000002_queue_processing_rpc.sql

BEGIN;

-- Drop existing function if signature changed
DROP FUNCTION IF EXISTS public.process_daily_queue();

CREATE OR REPLACE FUNCTION public.process_daily_queue()
RETURNS TABLE (
    action_type text,         -- 'expired' or 'promoted'
    listing_id uuid,
    listing_name text,
    owner_email text,
    council_name text,
    new_end_date timestamptz
)
LANGUAGE plpgsql
AS $function$
DECLARE
    r_expired RECORD;
    r_next RECORD;
BEGIN
    -- 1. Find and Expire Active items past their due date
    FOR r_expired IN
        SELECT fq.id, fq.listing_id, fq.council_name, l.name as listing_name, u.email as owner_email
        FROM public.featured_queue fq
        JOIN public.listings l ON fq.listing_id = l.id
        JOIN public.users_public up ON l.owner_id = up.id -- Ensure we get the owner
        JOIN auth.users u ON up.id = u.id                 -- Get the email (requires permission)
        WHERE fq.status = 'active'
        AND fq.ends_at < now()
    LOOP
        -- A. Mark as Expired
        UPDATE public.featured_queue
        SET status = 'expired'
        WHERE id = r_expired.id;

        -- B. Return "Expired" Event
        action_type := 'expired';
        listing_id := r_expired.listing_id;
        listing_name := r_expired.listing_name;
        owner_email := r_expired.owner_email;
        council_name := r_expired.council_name;
        new_end_date := NULL;
        RETURN NEXT;

        -- C. Promote Next in Line (FIFO) for this Council
        SELECT fq.id, fq.listing_id, l.name as listing_name, u.email as owner_email
        INTO r_next
        FROM public.featured_queue fq
        JOIN public.listings l ON fq.listing_id = l.id
        JOIN public.users_public up ON l.owner_id = up.id
        JOIN auth.users u ON up.id = u.id
        WHERE fq.council_name = r_expired.council_name
        AND fq.status = 'pending'
        ORDER BY fq.requested_at ASC -- FIFO
        LIMIT 1;

        IF FOUND THEN
            -- Activate
            UPDATE public.featured_queue
            SET 
                status = 'active',
                started_at = now(),
                ends_at = now() + interval '30 days'
            WHERE id = r_next.id;

            -- Update Listing "Featured Until" flag (Denormalization for fast read)
            UPDATE public.listings
            SET featured_until = now() + interval '30 days'
            WHERE id = r_next.listing_id;

            -- Return "Promoted" Event
            action_type := 'promoted';
            listing_id := r_next.listing_id;
            listing_name := r_next.listing_name;
            owner_email := r_next.owner_email;
            council_name := r_expired.council_name;
            new_end_date := now() + interval '30 days';
            RETURN NEXT;
        END IF;

    END LOOP;

    RETURN;
END;
$function$;

COMMIT;
