# Production Schema Verification Queries

**Purpose**: Verify which tables exist on production using Supabase SQL Editor

**Generated**: 2026-01-16 (after MCP audit confirmation)

---

## Query 1: Check All Critical Tables

Run this in Supabase Dashboard → SQL Editor:

```sql
-- Check if all commerce and ops tables exist
SELECT table_name, 
       CASE WHEN table_name IS NOT NULL THEN 'MISSING' ELSE 'EXISTS' END as status
FROM (VALUES 
  ('audit_logs'),
  ('reports'),
  ('orders'),
  ('order_items'),
  ('cart_items'),
  ('listings'),
  ('products'),
  ('featured_queue'),
  ('users_public'),
  ('service_definitions'),
  ('localities'),
  ('categories'),
  ('tags'),
  ('articles')
) AS check(table_name)
LEFT JOIN information_schema.tables 
  ON check.table_name = tables.table_name 
  AND tables.table_schema = 'public'
ORDER BY check.table_name;
```

**Expected Output**:
- audit_logs: EXISTS
- reports: UNKNOWN (need to check)
- orders: UNKNOWN (need to check)
- order_items: UNKNOWN (need to check)
- cart_items: UNKNOWN (need to check)
- listings: EXISTS
- products: EXISTS
- featured_queue: EXISTS
- users_public: EXISTS
- service_definitions: EXISTS
- localities: UNKNOWN (need to check)
- categories: EXISTS
- tags: EXISTS
- articles: EXISTS

---

## Query 2: Check Columns on Listings Table

```sql
-- Verify if council catchment columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name='listings'
  AND column_name IN (
    'location_council',
    'location_suburb',
    'tier',
    'triage_status',
    'is_verified'
  )
ORDER BY ordinal_position;
```

**Expected Output**: All 5 columns should return

---

## Query 3: Check Featured Queue Columns

```sql
-- Verify if monetization columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name='featured_queue'
  AND column_name IN (
    'council_name',
    'status',
    'listing_id',
    'featured_until'
  )
ORDER BY ordinal_position;
```

**Expected Output**: All 4 columns should return

---

## Query 4: Check RPC Functions

```sql
-- Verify if key RPCs exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema='public'
  AND routine_name IN (
    'search_listings',
    'search_products',
    'check_featured_availability',
    'join_featured_queue',
    'activate_queued_item',
    'process_featured_queue'
  )
ORDER BY routine_name;
```

**Expected Output**: All 6 functions should return

---

## Query 5: Check Migration History

```sql
-- View migration history
SELECT version, 
       COALESCE(name, 'UNKNOWN') as migration_name,
       applied_at
FROM supabase_migrations.schema_migrations
ORDER BY applied_at DESC
LIMIT 50;
```

**Expected Output**:
- Should show both early migrations (01, 02, 20260102000000-20260103000003)
- Should show local-only versions (20260108000000, etc.) - OR NOT (if not applied)
- Should show remote-only ad-hoc timestamps (20260108025539, etc.)

---

## Instructions

1. **Copy each query** above
2. **Run in Supabase Dashboard** → SQL Editor
3. **Paste results** into `docs/ops/reconcile/production_verification_results.txt`
4. **Send results back** to update drift analysis

---

## Notes

**MCP Audit Confirmed**:
- audit_logs table EXISTS (0 records)
- listings table EXISTS (498 records)
- users_public table EXISTS
- products table EXISTS
- featured_queue table EXISTS (2 records)
- service_definitions table EXISTS (2 records)
- Postgres version: 17.6
- Extensions: postgis, pgcrypto, pg_cron all present

**This means**:
1. ✅ audit_logs is NOT missing (earlier finding was INCORRECT)
2. ⚠️ reports, orders, order_items, cart_items status UNKNOWN
3. ⚠️ localities table status UNKNOWN
4. ⚠️ Migration history still needs verification

---

## Next Steps After Verification

1. Update `docs/ops/DRIFT_RECONCILIATION_REPORT.md` with actual table states
2. Create reconciliation migration based on VERIFIED missing tables only
3. Execute Phase 2 plan with correct expectations
