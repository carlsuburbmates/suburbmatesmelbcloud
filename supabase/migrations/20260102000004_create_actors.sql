-- Create Actors Table
CREATE TABLE actors (
  -- Supabase Auth user ID
  id UUID NOT NULL PRIMARY KEY,
  -- The user's email address
  email TEXT,
  -- The user's full name
  full_name TEXT,
  -- A URL for the user's avatar image
  avatar_url TEXT,
  -- The user's application role
  role app_role DEFAULT 'visitor' NOT NULL,
  -- Log of violations or moderation actions
  violation_log JSONB DEFAULT '[]'::jsonb NOT NULL,
  -- Count of warnings received
  warning_count INT DEFAULT 0 NOT NULL,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  -- Moderation status fields
  is_suspended BOOLEAN DEFAULT FALSE NOT NULL,
  suspended_until TIMESTAMPTZ,
  is_delisted BOOLEAN DEFAULT FALSE NOT NULL,
  is_evicted BOOLEAN DEFAULT FALSE NOT NULL,
  evicted_at TIMESTAMPTZ
);
-- RLS
ALTER TABLE actors ENABLE ROW LEVEL SECURITY;
-- Policies
CREATE POLICY "Public read access for actors" ON actors
  FOR SELECT USING (true);
CREATE POLICY "Self update access" ON actors
  FOR UPDATE USING (auth.uid() = id);
