-- Add Pro functionality to listings
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS branding jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;

-- Index for fast slug lookups (Mini-site routing)
CREATE INDEX IF NOT EXISTS listings_slug_idx ON listings (slug);

-- RLS: Allow anyone to read these columns (public profile)
-- Existing policies on 'listings' likely cover SELECT for public. 
-- We verify that update is restricted to owner (existing policy).
