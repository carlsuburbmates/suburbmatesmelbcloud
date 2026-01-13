-- dedicated table for programmatic SEO content
CREATE TABLE IF NOT EXISTS articles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    content text NOT NULL, -- Markdown content
    suburb text NOT NULL,
    category_id uuid REFERENCES categories(id),
    published_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for fast lookup by suburb (for future 'nearby articles' features)
CREATE INDEX IF NOT EXISTS articles_suburb_idx ON articles (suburb);
CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles (slug);

-- RLS: Public can read, Service Role/Admins can write
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Articles" ON articles
    FOR SELECT
    USING (true);

-- No public write policy needed. Assuming generation happens via Service Role (Cron).
