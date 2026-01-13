-- Migration: Fix Council Catchment & Queue RPC Logic
-- Purpose: Fix location-based filtering and featured queue council resolution
-- Issue: Remote RPCs using wrong joins (li.location vs li.location_suburb/location_council)
-- 
-- This migration safely updates RPCs without modifying old migrations
-- Uses pre-computed location_council field on listings table

BEGIN;

-- 1. Fix search_listings - Add Council Catchment Logic
CREATE OR REPLACE FUNCTION public.search_listings(
    search_query text DEFAULT NULL::text,
    category_filter uuid DEFAULT NULL::uuid,
    location_filter text DEFAULT NULL::text,
    filter_verified boolean DEFAULT false,
    sort_by text DEFAULT 'relevance'::text,
    limit_val integer DEFAULT 20,
    offset_val integer DEFAULT 0
)
RETURNS SETOF listings
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
    v_target_council text;
    v_normalized_suburb text;
BEGIN
    -- 1. Normalize location_filter (strip ', VIC', ', NSW', etc.)
    IF location_filter IS NOT NULL THEN
        v_normalized_suburb := regexp_replace(location_filter, ',\s*[A-Z]{2,3}\s*$', '', 'i');
        
        -- Try to resolve council from normalized suburb
        SELECT council_name INTO v_target_council
        FROM localities
        WHERE suburb_name ILIKE v_normalized_suburb
        LIMIT 1;
    END IF;

    RETURN QUERY
    SELECT *
    FROM public.listings
    WHERE
        -- search_query match
        (search_query IS NULL OR 
         search_vector @@ plainto_tsquery('english', search_query))
        AND
        -- category match
        (category_filter IS NULL OR category_id = category_filter)
        AND
        -- LOCATION CATCHMENT LOGIC (FIXED: Use location_council)
        (
            location_filter IS NULL
            OR
            (
                -- Case A: We found a Council -> Match ANY suburb in that Council
                (v_target_council IS NOT NULL AND location_council = v_target_council)
                OR
                -- Case B: No Council found (invalid suburb) -> Fallback to simple text match
                (v_target_council IS NULL AND location ILIKE '%' || location_filter || '%')
            )
        )
        AND
        -- verified filter
        (filter_verified IS FALSE OR is_verified = TRUE)
        AND
        -- status check
        status IN ('claimed', 'unclaimed')
    ORDER BY
        (featured_until IS NOT NULL AND featured_until > now()) DESC, -- Feature Pinned
        CASE WHEN sort_by = 'alphabetical' THEN name END ASC,
        CASE WHEN sort_by = 'newest' THEN created_at END DESC,
        CASE WHEN sort_by = 'relevance' THEN is_verified END DESC,
        CASE WHEN sort_by = 'relevance' THEN (status = 'claimed') END DESC,
        CASE WHEN sort_by = 'relevance' THEN tier END DESC,
        CASE WHEN sort_by = 'relevance' THEN 
            ts_rank(search_vector, plainto_tsquery('english', search_query)) 
        END DESC,
        name ASC
    LIMIT limit_val OFFSET offset_val;
END;
$function$;

-- 2. Fix search_products - Add Council Catchment Logic
CREATE OR REPLACE FUNCTION public.search_products(
    search_query text DEFAULT NULL::text,
    category_filter uuid DEFAULT NULL::uuid,
    min_price numeric DEFAULT NULL::numeric,
    max_price numeric DEFAULT NULL::numeric,
    location_filter text DEFAULT NULL::text,
    limit_val integer DEFAULT 20,
    offset_val integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    price numeric,
    image_url text,
    updated_at timestamptz,
    category_name text,
    listing_id uuid,
    listing_name text,
    listing_slug text,
    listing_is_verified boolean
)
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
    v_target_council text;
    v_normalized_suburb text;
BEGIN
    -- Normalize location_filter and resolve council
    IF location_filter IS NOT NULL THEN
        v_normalized_suburb := regexp_replace(location_filter, ',\s*[A-Z]{2,3}\s*$', '', 'i');
        
        SELECT council_name INTO v_target_council
        FROM localities
        WHERE suburb_name ILIKE v_normalized_suburb
        LIMIT 1;
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.updated_at,
        c.name as category_name,
        l.id as listing_id,
        l.name as listing_name,
        l.slug as listing_slug,
        l.is_verified as listing_is_verified
    FROM public.products p
    JOIN public.listings l ON p.listing_id = l.id
    LEFT JOIN public.categories c ON p.category_id = c.id
    WHERE
        (search_query IS NULL OR 
         p.name ILIKE '%' || search_query || '%' OR 
         p.description ILIKE '%' || search_query || '%')
        AND
        (category_filter IS NULL OR p.category_id = category_filter)
        AND
        (min_price IS NULL OR p.price >= min_price)
        AND
        (max_price IS NULL OR p.price <= max_price)
        AND
        -- LOCATION CATCHMENT LOGIC (FIXED: Use location_council)
        (
            location_filter IS NULL
            OR
            (
                (v_target_council IS NOT NULL AND l.location_council = v_target_council)
                OR
                (v_target_council IS NULL AND l.location ILIKE '%' || location_filter || '%')
            )
        )
        AND
        (l.status = 'claimed')
    ORDER BY
        p.updated_at DESC
    LIMIT limit_val OFFSET offset_val;
END;
$function$;

-- 3. Fix insert_verified_queue_entry - Use location_council directly
CREATE OR REPLACE FUNCTION public.insert_verified_queue_entry(
    p_listing_id uuid,
    p_setup_intent_id text,
    p_payment_method_id text,
    p_stripe_customer_id text,
    p_consent_hash text
)
RETURNS bigint -- Returns new Queue Position
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_council text;
    v_pos bigint;
    v_count integer;
BEGIN
    -- FIX: Get Council from location_council field directly (no join needed!)
    SELECT location_council INTO v_council
    FROM public.listings
    WHERE id = p_listing_id;

    IF v_council IS NULL THEN
        RAISE EXCEPTION 'Council not found for listing';
    END IF;

    -- Strict Serialized Locking (Per Council)
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
        4900 -- $49.00 Fixed Price
    );

    -- Return Post-Insert Position
    RETURN v_count + 1;
END;
$$;

COMMIT;
