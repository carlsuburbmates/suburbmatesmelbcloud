-- Add search_vector column for full-text search
-- This column was added ad-hoc on production, now adding to migrations

BEGIN;

-- Add tsvector column for full-text search
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(location, '')), 'C')
) STORED;

-- Create GIN index for fast search
CREATE INDEX IF NOT EXISTS listings_search_vector_idx ON public.listings USING GIN (search_vector);

-- Add comment
COMMENT ON COLUMN public.listings.search_vector IS 'Full-text search vector (auto-generated from name, description, location)';

COMMIT;
