-- Create Enums for Listings
CREATE TYPE listing_tier AS ENUM ('Basic', 'Pro');
CREATE TYPE listing_status AS ENUM ('unclaimed', 'claimed');

-- Create Listings Table
CREATE TABLE listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id), -- Can be NULL if unclaimed
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL, -- Council Area
  category_id BIGINT REFERENCES business_categories(id) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  tier listing_tier DEFAULT 'Basic' NOT NULL,
  featured_until TIMESTAMP WITH TIME ZONE,
  status listing_status DEFAULT 'unclaimed' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for high-speed filtering
CREATE INDEX idx_listings_location ON listings(location);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_owner ON listings(owner_id);

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Initial Policies (Placeholder - Refined in Phase 3)
CREATE POLICY "Public read access for listings" ON listings
  FOR SELECT USING (true);
