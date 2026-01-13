-- Create localities table for Suburb -> Council mapping
create table if not exists public.localities (
  id uuid default gen_random_uuid() primary key,
  suburb_name text not null,
  council_name text not null,
  postcode text,
  state text default 'VIC',
  region text, -- e.g. "Inner City", "Northern"
  
  -- Constraint: Unique suburb name (simplification for Melb context, though strictly suburbs can span postcodes, usually name is unique enough for UX)
  constraint localities_suburb_name_key unique (suburb_name)
);

-- Enable RLS
alter table public.localities enable row level security;

-- Policy: Public read access
create policy "Allow public read access"
  on public.localities
  for select
  to public
  using (true);

-- Indexes for performance
create index if not exists idx_localities_suburb_name on public.localities(suburb_name);
create index if not exists idx_localities_council_name on public.localities(council_name);
