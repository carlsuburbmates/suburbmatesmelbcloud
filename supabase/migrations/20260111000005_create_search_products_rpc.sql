-- Create search_products function for Marketplace
CREATE OR REPLACE FUNCTION public.search_products(
    search_query text DEFAULT NULL::text,
    category_filter uuid DEFAULT NULL::uuid,
    min_price numeric DEFAULT NULL::numeric,
    max_price numeric DEFAULT NULL::numeric,
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
BEGIN
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
    -- Text search matches product name or description
    (search_query IS NULL OR 
     p.name ILIKE '%' || search_query || '%' OR 
     p.description ILIKE '%' || search_query || '%')
    AND
    -- Filter by category
    (category_filter IS NULL OR p.category_id = category_filter)
    AND
    -- Filter by price range
    (min_price IS NULL OR p.price >= min_price)
    AND
    (max_price IS NULL OR p.price <= max_price)
    AND
    -- Only active listings
    (l.status = 'claimed') 
  ORDER BY
    p.updated_at DESC
  LIMIT limit_val OFFSET offset_val;
END;
$function$;
