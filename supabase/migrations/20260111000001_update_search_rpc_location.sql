-- Migration: Add location_filter to search_listings RPC
-- Purpose: Enable "Browse by Area/Council" functionality

DROP FUNCTION IF EXISTS public.search_listings(text, uuid, integer, integer);

CREATE OR REPLACE FUNCTION public.search_listings(
    search_query text, 
    category_filter uuid DEFAULT NULL::uuid,
    location_filter text DEFAULT NULL, -- NEW: Council Name filter
    limit_val integer DEFAULT 20, 
    offset_val integer DEFAULT 0
)
RETURNS SETOF listings
LANGUAGE plpgsql
STABLE
AS $function$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.listings
  WHERE
    (search_query IS NULL OR search_vector @@ plainto_tsquery('english', search_query))
    AND (category_filter IS NULL OR category_id = category_filter)
    -- NEW: Location Filter (Exact text match for now, assuming standardized storage)
    AND (location_filter IS NULL OR location = location_filter)
    -- Allow Claimed AND Unclaimed (Discovery Layer)
    AND status IN ('claimed', 'unclaimed')
  ORDER BY
    is_verified DESC,                       -- 1. Trust Signals
    (case when status = 'claimed' then 1 else 0 end) DESC, -- 2. Participation
    tier DESC,                              -- 3. Commercial Tiers
    featured_until DESC NULLS LAST,         -- 4. Paid Boosts
    ts_rank(search_vector, plainto_tsquery('english', search_query)) DESC -- 5. Relevance
  LIMIT limit_val OFFSET offset_val;
END;
$function$;
