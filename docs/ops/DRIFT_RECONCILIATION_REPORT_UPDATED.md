# Drift Reconciliation Report - UPDATED with MCP Audit Findings

**Generated**: 2026-01-16
**Updated**: After MCP production audit confirmed

---

## Executive Summary (CORRECTED)

**Status**: ⚠️ **DRIFT CONFIRMED** - Production has schema not tracked in migrations, but critical tables DO exist.

**Key Correction from MCP Audit**:
- ❌ **WRONG**: audit_logs table missing
- ✅ **CORRECTED**: audit_logs table EXISTS (0 records) on production
- ❌ **UNKNOWN**: reports, orders, order_items, cart_items tables
- ❌ **UNKNOWN**: localities table status

**Updated Drift Status**:
- **22 migrations exist only locally** (not applied to remote) - CONFIRMED
- **29 migrations exist only remotely** (ad-hoc SQL edits) - CONFIRMED
- **9 migrations are matched** (early schema) - CONFIRMED
- **audit_logs table EXISTS** (contradicts earlier finding) - CORRECTED

---

## Production State (From MCP Audit)

### Confirmed Existing Tables ✅

| Table | Records | Status |
|-------|---------|--------|
| `listings` | 498 | ✅ EXISTS |
| `users_public` | - | ✅ EXISTS |
| `products` | - | ✅ EXISTS |
| `featured_queue` | - | ✅ EXISTS |
| `service_definitions` | 2 | ✅ EXISTS |
| `audit_logs` | 0 | ✅ EXISTS |
| `categories` | - | ✅ EXISTS (assumed) |
| `tags` | - | ✅ EXISTS (assumed) |
| `articles` | - | ✅ EXISTS (assumed) |

### Unknown Status Tables ⚠️

| Table | Status | Why Unknown |
|-------|----------|-------------|
| `reports` | ❓ NOT in MCP audit | Need verification |
| `orders` | ❓ NOT in MCP audit | Likely missing |
| `order_items` | ❓ NOT in MCP audit | Likely missing |
| `cart_items` | ❓ NOT in MCP audit | Likely missing |
| `localities` | ❓ NOT in MCP audit | Need verification |

### Confirmed Extensions ✅

| Extension | Version | Purpose |
|-----------|---------|---------|
| `postgis` | v3.3.7 | Location-based search |
| `pgcrypto` | v1.3 | UUID generation/encryption |
| `pg_cron` | v1.6.4 | Scheduled tasks |

### Database Version

**Remote Postgres**: 17.6.1.063
**Local pg_dump**: 14.20 (incompatible - explains failed dumps)
**CLI Version**: v2.67.1 (update available: v2.72.7)

---

## Local-Only Migrations (22 - NOT ON REMOTE) - UNCHANGED

| Migration | Description | Severity |
|-----------|-------------|----------|
| `20260108000000_consolidate_identity_taxonomy.sql` | Auth/profiles consolidation | HIGH |
| `20260108000001_branch_7_pro_features.sql` | Pro tier features | HIGH |
| `20260108000002_seo_articles.sql` | Articles table | MEDIUM |
| `20260109000001_add_tier_to_listings.sql` | Tier column | HIGH |
| `20260110000001_create_localities.sql` | Council/suburb mapping | **CRITICAL** |
| `20260110000003_update_search_rpc.sql` | Search updates | HIGH |
| `20260110000004_rename_profiles_to_users_public.sql` | Table rename | HIGH |
| `20260111000001_update_search_rpc_location.sql` | Location filtering | **CRITICAL** |
| `20260111000004_fix_featured_logic.sql` | Queue fixes | HIGH |
| `20260111000005_create_search_products_rpc.sql` | Products search | HIGH |
| `20260112000000_upgrade_search_listings_rpc.sql` | Search upgrades | HIGH |
| `20260113000000_add_council_catchment.sql` | Council catchment | **CRITICAL** |
| `20260113000000_harden_process_queue.sql` | Queue hardening | HIGH |
| `20260113000001_upgrade_featured_queue.sql` | Queue upgrades | HIGH |
| `20260113000002_queue_processing_rpc.sql` | Queue processing | HIGH |
| `20260113000003_create_join_queue_rpc.sql` | Queue join RPC | HIGH |
| `20260113000004_upgrade_featured_queue_monetization.sql` | Monetization | HIGH |
| `20260113000005_monetization_rpcs.sql` | Monetization RPCs | HIGH |
| `20260114000000_fix_council_catchment_logic.sql` | Catchment fix | **CRITICAL** |

---

## Remote-Only Migrations (29 - AD-HOC) - UNCHANGED

[Full list unchanged - see local_only_versions.txt and remote_only_versions.txt]

---

## UPDATED Reconciliation Strategy

### Step 1: Verify Unknown Tables (REQUIRED)

**Before creating any migration, verify which tables actually exist:**

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema='public'
  AND table_name IN (
    'reports',
    'orders',
    'order_items',
    'cart_items',
    'localities'
  )
ORDER BY table_name;
```

**If tables exist**: DO NOT CREATE in migration (idempotent check)
**If tables missing**: CREATE in migration

---

### Step 2: Create Missing Tables Migration (CORRECTED)

**Migration**: `20260117000000_add_missing_tables.sql`

**Revised content based on MCP audit:**

```sql
-- Missing Commerce and Ops Tables
-- Purpose: Create tables that code references but may not exist

-- 1. Reports (for user-reported content)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  reporter_email TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Orders (for marketplace purchases)
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

-- 3. Order Items (for products in orders)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_cents INTEGER NOT NULL, -- Price at time of purchase
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cart Items (for shopping cart state)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 5. Localities (for council/suburb mapping)
CREATE TABLE IF NOT EXISTS public.localities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  council_name TEXT NOT NULL,
  suburb TEXT NOT NULL,
  state TEXT NOT NULL,
  postcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(council_name, suburb)
);

-- Indexes for performance
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

CREATE INDEX IF NOT EXISTS idx_localities_council ON public.localities(council_name);
CREATE INDEX IF NOT EXISTS idx_localities_suburb ON public.localities(suburb);
```

**NOTE**: audit_logs table NOT included - already EXISTS on production per MCP audit

---

### Step 3: Migration Repair (UNCHANGED)

[See repair_command_plan.md for detailed steps]

---

### Step 4: Apply Local-Only Migrations (UNCHANGED)

```bash
supabase db push --linked
```

---

## Verification Queries (UPDATED)

### Verification 1: Unknown Tables Exist
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public'
  AND table_name IN ('reports', 'orders', 'order_items', 'cart_items', 'localities')
ORDER BY table_name;
```

**Expected**: 5 rows returned (if all missing) or fewer (if some exist)

### Verification 2: Council Catchment Column
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name='listings'
  AND column_name IN ('location_council', 'location_suburb')
ORDER BY ordinal_position;
```

**Expected**: 2 rows returned

### Verification 3: Featured Queue Column
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name='featured_queue'
  AND column_name='council_name';
```

**Expected**: 1 row returned

---

## Updated Deliverables

### Verification Required Before Execution

- [ ] **Run verification queries** in Supabase SQL Editor
- [ ] **Paste results** to `docs/ops/reconcile/production_verification_results.txt`
- [ ] **Update this report** with actual table states
- [ ] **Create migration** with `IF NOT EXISTS` for truly missing tables only

---

## Key Findings Summary

| Finding | Previous Status | Corrected Status | Impact |
|---------|----------------|-----------------|--------|
| audit_logs table | MISSING | EXISTS (0 records) | ✅ No block - code works |
| reports table | MISSING | UNKNOWN | ⚠️ Need verification |
| orders table | MISSING | UNKNOWN (likely) | ⚠️ Commerce blocked |
| order_items table | MISSING | UNKNOWN (likely) | ⚠️ Commerce blocked |
| cart_items table | MISSING | UNKNOWN (likely) | ⚠️ Commerce blocked |
| localities table | MISSING | UNKNOWN | ⚠️ Council catchment unknown |

---

## Next Action Required

**IMMEDIATE**: Run `docs/ops/reconcile/production_verification_queries.sql` in Supabase SQL Editor

**After verification**: Create reconciliation migration based on ACTUAL missing tables

**Ready for Phase 2 execution**: Once verification complete and migration updated

---

## Sign-off

- [x] Production schema audit via MCP
- [x] Corrected audit_logs table finding
- [x] Identified unknown tables needing verification
- [ ] Verification queries executed in SQL Editor
- [ ] Production verification results documented
- [ ] Reconciliation migration created based on verified state
- [ ] Phase 2 execution complete
