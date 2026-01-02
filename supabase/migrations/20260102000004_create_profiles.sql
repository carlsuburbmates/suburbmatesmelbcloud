-- Create Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role app_role DEFAULT 'visitor' NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Enforcement Ladder
  warning_count INTEGER DEFAULT 0 NOT NULL,
  is_delisted BOOLEAN DEFAULT FALSE NOT NULL,
  is_suspended BOOLEAN DEFAULT FALSE NOT NULL,
  suspended_until TIMESTAMP WITH TIME ZONE,
  is_evicted BOOLEAN DEFAULT FALSE NOT NULL,
  evicted_at TIMESTAMP WITH TIME ZONE,
  violation_log JSONB DEFAULT '[]'::jsonb NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Initial Policies
CREATE POLICY "Public read access for profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Self update access" ON profiles
  FOR UPDATE USING (auth.uid() = id);
