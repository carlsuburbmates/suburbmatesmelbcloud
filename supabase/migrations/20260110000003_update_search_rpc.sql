-- Create or Replace search_listings to allow Unclaimed listings
-- Previous version filtered 'AND status = ''claimed''' violating SSOT.

CREATE OR REPLACE FUNCTION public.search_listings(
    search_query text, 
    category_filter uuid DEFAULT NULL::uuid, 
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
    -- Allow Claimed AND Unclaimed (Discovery Layer)
    AND status IN ('claimed', 'unclaimed')
  ORDER BY
    is_verified DESC,                       -- 1. Trust Signals
    (case when status = 'claimed' then 1 else 0 end) DESC, -- 2. Participation (Claimed > Unclaimed)
    tier DESC,                              -- 3. Commercial Tiers
    featured_until DESC NULLS LAST,         -- 4. Paid Boosts
    ts_rank(search_vector, plainto_tsquery('english', search_query)) DESC -- 5. Relevance
  LIMIT limit_val OFFSET offset_val;
END;
$function$;
