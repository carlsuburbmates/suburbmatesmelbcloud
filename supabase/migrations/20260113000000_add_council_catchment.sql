-- Migration: Add Council Catchment Logic to Search RPCs
-- URL: /supabase/migrations/20260113000000_add_council_catchment.sql

BEGIN;

-- 1. Upgrade search_listings (Directory)
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
BEGIN
    -- 1. Try to resolve the 'Catchment' (Council) from the input location (Suburb)
    IF location_filter IS NOT NULL THEN
        SELECT council_name INTO v_target_council
        FROM localities
        WHERE suburb_name ILIKE location_filter
        LIMIT 1;
    END IF;

    RETURN QUERY
    SELECT *
    FROM public.listings
    WHERE
        -- search_query match
        (search_query IS NULL OR 
         name ILIKE '%' || search_query || '%' OR 
         description ILIKE '%' || search_query || '%')
        AND
        -- category match
        (category_filter IS NULL OR category_id = category_filter)
        AND
        -- LOCATION CATCHMENT LOGIC
        (
            location_filter IS NULL OR
            (
                -- Case A: We found a Council -> Match ANY suburb in that Council
                (v_target_council IS NOT NULL AND location IN (
                    SELECT suburb_name FROM localities WHERE council_name = v_target_council
                ))
                OR
                -- Case B: No Council found (e.g. invalid suburb) -> Fallback to simple text match
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
        name ASC
    LIMIT limit_val OFFSET offset_val;
END;
$function$;

-- 2. Upgrade search_products (Marketplace)
CREATE OR REPLACE FUNCTION public.search_products(
    search_query text DEFAULT NULL::text,
    category_filter uuid DEFAULT NULL::uuid,
    min_price numeric DEFAULT NULL::numeric,
    max_price numeric DEFAULT NULL::numeric,
    location_filter text DEFAULT NULL::text, -- Added Location Filter
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
BEGIN
    -- Resolve Catchment from input
    IF location_filter IS NOT NULL THEN
        SELECT council_name INTO v_target_council
        FROM localities
        WHERE suburb_name ILIKE location_filter
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
        -- LOCATION CATCHMENT LOGIC (Expanded)
        (
            location_filter IS NULL OR
            (
                (v_target_council IS NOT NULL AND l.location IN (
                    SELECT suburb_name FROM localities WHERE council_name = v_target_council
                ))
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

COMMIT;
