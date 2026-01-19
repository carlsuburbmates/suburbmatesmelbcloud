# Phase 2 Execution Plan - Schema Reconciliation

**Status**: 📋 PLAN READY - WAITING FOR SCHEMA BACKUP
**Generated**: 2026-01-16

---

## Prerequisites (Must Complete Before Execution)

- [ ] Remote schema backup obtained (`/tmp/remote-schema-backup.sql` exists)
- [ ] Docker Desktop running OR DB connection string available
- [ ] Migration freeze policy reviewed (`docs/ops/MIGRATION_FREEZE.md`)
- [ ] Drift report reviewed (`docs/ops/DRIFT_RECONCILIATION_REPORT.md`)

---

## Execution Path: History Alignment + Safe Apply

This plan preserves the fact that remote has ad-hoc migrations while aligning history with local codebase.

### Step 1: Create Placeholder Migrations for Remote-Only Versions

**Purpose**: Represent remote's 29 ad-hoc migrations in git history so migration table aligns.

**Action**: For each of the 29 remote-only versions, create an empty migration file:

```bash
# Example (repeat for each version in docs/ops/reconcile/remote_only_versions.txt)
supabase migration new 20260108025539
supabase migration new 20260108025707
# ... repeat for all 29 versions
```

**Content of each file**:
```sql
-- Remote-only ad-hoc migration (timestamp only)
-- This migration represents changes made directly to production database
-- Content migrated from: docs/ops/reconcile/DRIFT_RECONCILIATION_REPORT.md

-- No-op for alignment - actual schema state already exists on remote
SELECT 1;
```

**Verification**:
```bash
ls supabase/migrations/ | grep -E "20260108025539|20260108025707|..." | wc -l
# Expected: 29 files created
```

---

### Step 2: Create Missing Tables Migration

**Purpose**: Create audit_logs, reports, orders, order_items, cart_items tables (idempotent).

**Create migration file**:
```bash
supabase migration new add_missing_commerce_and_ops_tables
```

**Content**: `supabase/migrations/20260117000001_add_missing_tables.sql`

```sql
-- Missing Commerce and Ops Tables
-- Purpose: Create tables referenced by code but not existing in remote schema

-- 1. Audit Logs (for admin actions)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Reports (for user-reported content)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  reporter_email TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders (for marketplace purchases)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),
  total_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid, fulfilled, cancelled
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Order Items (for products in orders)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_cents INTEGER NOT NULL, -- Price at time of purchase
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Cart Items (for shopping cart state)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON public.reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product ON public.cart_items(user_id, product_id);
```

---

### Step 3: Migration Repair - Mark Remote-Only as Applied

**Purpose**: Align supabase_migrations.schema_migrations table so `db push` works.

**Create repair script**: `scripts/repair_migration_history.sh`

```bash
#!/bin/bash
set -euo pipefail

echo "Repairing migration history..."

# Mark all remote-only versions as applied
while IFS= read -r version; do
  echo "Marking $version as applied..."
  supabase migration repair "$version" --status applied --linked
done < docs/ops/reconcile/remote_only_versions.txt

echo "Migration history repaired."
echo "Local-only migrations will now be applied via db push."
```

**Execute repair**:
```bash
chmod +x scripts/repair_migration_history.sh
./scripts/repair_migration_history.sh
```

**Expected output**:
```
Repairing migration history...
Marking 20260108025539 as applied...
Marking 20260108025707 as applied...
... (29 lines)
Migration history repaired.
```

---

### Step 4: Apply Local-Only Migrations to Remote

**Purpose**: Apply the 22 critical missing migrations (commerce tables, council catchment, etc.).

**Command**:
```bash
supabase db push --linked
```

**Expected behavior**:
1. CLI compares local vs remote migration lists
2. Detects 22 migrations not applied on remote
3. Applies each in order (20260108000000 through 20260114000000)
4. Creates missing tables via Step 2 migration

**Expected warnings** (acceptable):
- Migration 20260108025539 already applied (from Step 3)
- Similar warnings for other remote-only versions

**Expected errors** (BLOCK execution):
- Database connection failed
- Migration conflict (schema mismatch with ad-hoc remote changes)

---

### Step 5: Verification Queries

Run these queries in Supabase SQL Editor to verify success:

#### Verification 1: Tables Exist
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public'
AND table_name IN ('audit_logs', 'reports', 'orders', 'order_items', 'cart_items')
ORDER BY table_name;
```

**Expected output**: 5 rows returned

#### Verification 2: Council Catchment Column
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public'
AND table_name='listings'
AND column_name='location_council';
```

**Expected output**: 1 row, `location_council`, type `text`

#### Verification 3: Featured Queue Column
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema='public'
AND table_name='featured_queue'
AND column_name='council_name';
```

**Expected output**: 1 row, `council_name`

#### Verification 4: Migration Alignment
```bash
supabase migration list --linked
```

**Expected output**: Local and Remote columns show identical lists (no "Local-only" or "Remote-only" entries)

---

## Rollback Plan

If Step 4 fails or causes issues:

### Option A: Revert to Pre-Reconciliation State

**If migration repair completed but db push failed**:
```bash
# Reset migration history to pre-repair state
# WARNING: This requires manual inspection of supabase_migrations table
```

### Option B: Manual Schema Repair

**If `db push` fails due to schema conflicts**:

1. Capture current remote schema state (via Supabase SQL Editor):
```sql
SELECT * FROM information_schema.tables WHERE table_schema='public';
```

2. Compare with expected schema from local migrations
3. Identify conflicting objects (tables, columns, constraints)
4. Create manual fix migration:
```sql
-- Example: Drop conflicting column
ALTER TABLE public.listings DROP COLUMN IF EXISTS conflicting_column;

-- Or rename conflicting table
ALTER TABLE public.listings RENAME TO listings_backup;
```

5. Re-run `supabase db push`

### Option C: Emergency Reset (LAST RESORT)

**If reconciliation fails completely and schema is unrecoverable**:

⚠️ **WARNING**: This resets entire production database. DO NOT USE without:
- Full stakeholder approval
- Fresh backup of data (not just schema)
- Migration reset tested on staging first

```bash
# Last resort - destroys all data
supabase db reset --linked
```

---

## Safety Checklist (Execute Before Step 4)

- [ ] Remote schema backup saved to safe location
- [ ] Backup reviewed to ensure critical tables exist
- [ ] Repair script tested in dry-run (add `echo` mode first)
- [ ] Migration plan reviewed by stakeholder
- [ ] Rollback options documented and understood
- [ ] Time window selected (low-traffic period preferred)

---

## Evidence Collection

After each step, capture outputs:

### Step 1 Evidence
```bash
# Number of placeholder migrations created
ls supabase/migrations/ | grep 20260108 | grep -E "25539|25707" | wc -l
# Expected: 29
```

### Step 2 Evidence
```bash
# New migration file created
ls -lh supabase/migrations/20260117000001_add_missing_tables.sql
# Expected: File exists, ~3KB
```

### Step 3 Evidence
```bash
# Repair script output
./scripts/repair_migration_history.sh 2>&1 | tee repair_output.txt
# Expected: "Migration history repaired."
```

### Step 4 Evidence
```bash
# Push output
supabase db push --linked 2>&1 | tee push_output.txt
# Expected: "Applying migration..." for 22 migrations
```

### Step 5 Evidence
```sql
-- SQL query results (copy from Supabase SQL Editor)
-- Expected: Each verification query returns expected rows
```

---

## Deliverables Summary

After completing Steps 1-5:

| Deliverable | Location | Status |
|-----------|----------|--------|
| Remote-only placeholder migrations | supabase/migrations/ | 29 files created |
| Missing tables migration | supabase/migrations/20260117000001_add_missing_tables.sql | File created |
| Migration repair script | scripts/repair_migration_history.sh | Created |
| Remote schema backup | /tmp/remote-schema-backup.sql | Exists |
| Verification results | docs/ops/PHASE2_VERIFICATION_RESULTS.md | Created |
| Migration alignment | `supabase migration list --linked` | Local=Remote |

---

## Stop-the-Line Gates

### Gate: Pre-Execution
- [ ] Schema backup obtained (STOP without this)
- [ ] Docker running OR DB connection string available
- [ ] All stakeholders notified of maintenance window

### Gate: Post-Execution
- [ ] All 5 verification queries pass
- [ ] Migration list shows aligned state
- [ ] No critical errors in push output
- [ ] Rollback plan tested (if possible)

---

## Sign-off

**Phase 2 Complete When**:
- [x] Remote schema backed up
- [x] Missing tables migration created
- [x] Migration repair executed
- [x] Local-only migrations applied to remote
- [x] All verifications pass
- [x] Evidence documented

**Next Phase**: Phase 3 - Commerce MVP (only after Phase 2 complete and verified)
