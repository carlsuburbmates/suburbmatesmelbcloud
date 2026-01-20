# Local Supabase Development Setup

## Quick Start

```bash
# Start local Supabase (first time will download Docker images)
supabase start

# Run Next.js app
npm run dev

# App now uses local Supabase at http://127.0.0.1:54321
```

## What You Get

| Service | URL | Purpose |
|---------|-----|---------|
| **Supabase Studio** | http://127.0.0.1:54323 | Database GUI |
| **REST API** | http://127.0.0.1:54321/rest/v1 | API endpoint |
| **Database** | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | Direct DB access |
| **Mailpit** | http://127.0.0.1:54324 | Email testing |

## Environment Files

| File | Purpose | Used When |
|------|---------|-----------|
| `.env.local` | **Production** credentials | `supabase stop` |
| `.env.development.local` | **Local** credentials | `supabase start` |

## Common Tasks

### Reset Database (Fresh Start)
```bash
supabase db reset
# Runs all migrations + seed.sql
```

### Add Test Data
Edit `supabase/seed.sql`, then:
```bash
supabase db reset
```

### Create Migration
```bash
supabase migration new my_feature
# Edit supabase/migrations/YYYYMMDDHHMMSS_my_feature.sql
supabase db reset  # Test locally
supabase db push --linked  # Push to production (ask user first!)
```

### Check Migration Status
```bash
supabase migration list --linked
```

### Stop Local Supabase
```bash
supabase stop
```

## Current State

- **68 migrations** synced (local = remote)
- **16 tables** created
- **22 categories** seeded
- **8 tags** seeded
- **8 localities** seeded
- **17 RPC functions** available

## Known Differences from Production

### Missing on Local:
- `listings.search_vector` - Full-text search column (tsvector)
  - This is why `search_listings` RPC may fail locally
  - Column was added directly on production, not in migrations

### To Fix:
1. Create migration: `supabase migration new add_search_vector`
2. Add SQL to create the column
3. Test: `supabase db reset`
4. Push: `supabase db push --linked`

## Troubleshooting

### "Docker not running"
Open Docker Desktop and wait for it to start.

### "Port already in use"
```bash
supabase stop
# Wait 10 seconds
supabase start
```

### "Migration failed"
```bash
supabase db reset --debug
# Check error output
```

### Need to start fresh?
```bash
supabase stop --no-backup
docker system prune -f
supabase start
```

## For AI Agents

**See `AGENTS.md`** for comprehensive rules on:
- Safe vs unsafe operations
- Migration creation
- Production safeguards
- Drift reconciliation
