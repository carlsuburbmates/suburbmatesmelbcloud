-- Migration: Upgrade search_listings RPC with Ranking & Filtering
-- URL: /supabase/migrations/20260112000000_upgrade_search_listings_rpc.sql

DROP FUNCTION IF EXISTS public.search_listings(text, uuid, integer, integer);
DROP FUNCTION IF EXISTS public.search_listings(text, uuid, text, integer, integer);

CREATE OR REPLACE FUNCTION public.search_listings(
    search_query text DEFAULT NULL::text,
    category_filter uuid DEFAULT NULL::uuid,
    location_filter text DEFAULT NULL::text,
    filter_verified boolean DEFAULT false,
    sort_by text DEFAULT 'relevance'::text, -- Options: 'relevance', 'alphabetical', 'newest'
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
    -- 1. Search Query (Name or Description)
    (search_query IS NULL OR 
     name ILIKE '%' || search_query || '%' OR 
     description ILIKE '%' || search_query || '%')
    AND
    -- 2. Category Filter
    (category_filter IS NULL OR category_id = category_filter)
    AND
    -- 3. Location Filter (Simple text match)
    (location_filter IS NULL OR location ILIKE '%' || location_filter || '%')
    AND
    -- 4. Verified Only Filter
    (filter_verified IS FALSE OR is_verified = TRUE)
    AND
    -- 5. Status Check (Discovery Layer Rule: Claimed or Unclaimed only)
    status IN ('claimed', 'unclaimed')
  ORDER BY
    -- RANKING LOGIC
    
    -- 1. Paid/Featured Placement (Always Pinned to Top)
    (featured_until IS NOT NULL AND featured_until > now()) DESC,

    -- 2. Selected Sort Order
    CASE WHEN sort_by = 'alphabetical' THEN name END ASC,
    CASE WHEN sort_by = 'newest' THEN created_at END DESC,

    -- 3. Default Trust/Relevance Ranking (Only correctly applied when sort_by is 'relevance', ensuring stable fallbacks)
    -- We use a trick here: if sort_by != 'relevance', these return NULL and don't affect order (beyond the primary sort).
    -- If sort_by == 'relevance', we apply the detailed ranking components.
    
    CASE WHEN sort_by = 'relevance' THEN is_verified END DESC,         -- Verified
    CASE WHEN sort_by = 'relevance' THEN (status = 'claimed') END DESC, -- Claimed
    CASE WHEN sort_by = 'relevance' THEN tier END DESC,                 -- Pro Tier (Enum sort)
    
    -- 4. Tie-breakers / Fallbacks
    name ASC
  LIMIT limit_val OFFSET offset_val;
END;
$function$;
