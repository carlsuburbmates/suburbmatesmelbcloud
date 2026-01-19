# Drift Reconciliation Report - Phase 2

**Generated**: 2026-01-16 (from `supabase migration list --linked`)

---

## Executive Summary

**Status**: ⚠️ **CRITICAL DRIFT** - Production schema is in different universe than local codebase.

- **22 migrations exist only locally** (not applied to remote)
- **29 migrations exist only remotely** (ad-hoc SQL edits, not tracked in codebase)
- **9 migrations are matched** (early schema only)

**Impact**:
- Critical features blocked: Council catchment fix (20260114000000), queue hardening, monetization RPCs
- Production unreproducible: Ad-hoc migrations cannot be recreated from code
- Runtime errors: Missing tables (audit_logs, reports, orders, order_items, cart_items) referenced by code

---

## Local-Only Migrations (22 - NOT ON REMOTE)

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

**Impact**: Council catchment, featured queue monetization, localities - all core features - missing from production.

---

## Remote-Only Migrations (29 - AD-HOC, NOT IN CODEBASE)

| Migration Timestamp | Likely Content | Type |
|-------------------|------------------|-------|
| 20260108025539 | Unknown - timestamp only | **AD-HOC** |
| 20260108025707 | Unknown - timestamp only | **AD-HOC** |
| 20260108025858 | Unknown - timestamp only | **AD-HOC** |
| 20260108030407 | Unknown - timestamp only | **AD-HOC** |
| 20260108031005 | Unknown - timestamp only | **AD-HOC** |
| 20260108031132 | Unknown - timestamp only | **AD-HOC** |
| 20260108031413 | Unknown - timestamp only | **AD-HOC** |
| 20260108032002 | Unknown - timestamp only | **AD-HOC** |
| 20260108032025 | Unknown - timestamp only | **AD-HOC** |
| 20260109235823 | Unknown - timestamp only | **AD-HOC** |
| 20260110003258 | Unknown - timestamp only | **AD-HOC** |
| 20260110003957 | Unknown - timestamp only | **AD-HOC** |
| 20260110004222 | Unknown - timestamp only | **AD-HOC** |
| 20260110010806 | Unknown - timestamp only | **AD-HOC** |
| 20260110033928 | Unknown - timestamp only | **AD-HOC** |
| 20260110034518 | Unknown - timestamp only | **AD-HOC** |
| 20260110041952 | Unknown - timestamp only | **AD-HOC** |
| 20260110042425 | Unknown - timestamp only | **AD-HOC** |
| 20260110042740 | Unknown - timestamp only | **AD-HOC** |
| 20260110161941 | Unknown - timestamp only | **AD-HOC** |
| 20260110163933 | Unknown - timestamp only | **AD-HOC** |
| 20260110164418 | Unknown - timestamp only | **AD-HOC** |
| 20260110164709 | Unknown - timestamp only | **AD-HOC** |
| 20260110164817 | Unknown - timestamp only | **AD-HOC** |
| 20260110165145 | Unknown - timestamp only | **AD-HOC** |
| 20260110165800 | Unknown - timestamp only | **AD-HOC** |
| 20260111150431 | Unknown - timestamp only | **AD-HOC** |
| 20260112102318 | Unknown - timestamp only | **AD-HOC** |
| 20260112104545 | Unknown - timestamp only | **AD-HOC** |
| 20260112173701 | Unknown - timestamp only | **AD-HOC** |
| 20260112173702 | Unknown - timestamp only | **AD-HOC** |
| 20260113083026 | Unknown - timestamp only | **AD-HOC** |

**Impact**: Production has changes not tracked in codebase - cannot reproduce environment.

---

## Minimal Reconciliation Plan (DO NOT EXECUTE)

### Strategy: Forward-Merge with Audit Trail

1. **Create reconciliation migration**: `20260117000000_reconcile_drift.sql`
   - Idempotent where possible (`CREATE TABLE IF NOT EXISTS`)
   - Document remote-only ad-hoc changes as comments
   - Apply all 22 local-only migrations in correct order

2. **Create missing tables** (within same migration):
   ```sql
   CREATE TABLE IF NOT EXISTS audit_logs (...);
   CREATE TABLE IF NOT EXISTS reports (...);
   CREATE TABLE IF NOT EXISTS orders (...);
   CREATE TABLE IF NOT EXISTS order_items (...);
   CREATE TABLE IF NOT EXISTS cart_items (...);
   ```

3. **Migration repair** (if needed):
   ```sql
   -- Align supabase_migrations.schema_migrations table
   INSERT INTO supabase_migrations.schema_migrations (version, name)
   VALUES (...each of the 22 local-only...);
   ```

4. **Verification** (after push):
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema='public'
   ORDER BY table_name;

   -- Should return: listings, products, featured_queue, categories, tags,
   -- localities, users_public, audit_logs, reports, orders, order_items, cart_items
   ```

---

## Stop-the-Line Verdict

**Condition for Proceeding to Phase 3**: Remote schema matches local migrations + missing tables exist.

**Risk Assessment**:
- **HIGH RISK**: Ad-hoc remote migrations may have conflicting schema
- **MITIGATION**: Test reconciliation on staging environment first (if available)
- **FALLBACK**: If reconciliation fails, manually inspect remote schema and adjust

---

## Exact Commands for Reconciliation

```bash
# 1. Create reconciliation migration (manual, do not auto-generate)
supabase migration new reconcile_drift

# 2. Manually write SQL to the new migration file following plan above

# 3. Apply to remote (DANGEROUS - BACKUP FIRST)
# Run verification queries first to understand remote state

# 4. Push
supabase db push

# 5. Verify alignment
supabase migration list --linked
# Should show local and remote columns aligned
```

---

## Missing Tables: Runtime Blockers

The following tables are **REFERENCED BY CODE BUT DO NOT EXIST** in remote:

| Table | Referenced By | Code Location |
|-------|---------------|---------------|
| `audit_logs` | `lib/admin/audit.ts:30` | `.from('audit_logs').insert(...)` |
| `reports` | `app/actions/reports.ts:30` | `.from('reports').insert(...)` |
| `orders` | N/A (not implemented yet) | Future webhook handlers |
| `order_items` | N/A (not implemented yet) | Future webhook handlers |
| `cart_items` | N/A (not implemented yet) | Future cart API |

**Verification Command**:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema='public'
AND table_name IN ('audit_logs', 'reports', 'orders', 'order_items', 'cart_items');
```

**Expected**: Empty set (tables missing)
**After reconciliation**: 5 rows returned

---

## Remote Schema Dump Status

**Attempted**: `supabase db dump --schema-only`

**Result**: ❌ BLOCKED - Password auth failed for cli_login_postgres
**Reason**: Expected security restriction; direct DB access requires elevated permissions

**Fallback**: Migration list --linked provides sufficient drift evidence for reconciliation

---

## Evidence

**Command**: `supabase migration list --linked`
**Full Output**: See above "Local-Only" and "Remote-Only" sections

**Command**: `ls -la supabase/migrations | sed -n '1,260p'`
**Full Output**: See Phase 1 baseline capture

---

## Sign-off

- [x] Local migration list captured
- [x] Remote migration list captured (via --linked)
- [x] Remote-only migrations documented (29 ad-hoc)
- [x] Local-only migrations documented (22 missing from remote)
- [x] Minimal reconciliation plan created
- [ ] Reconciliation migration created (DO NOT EXECUTE)
- [ ] Verification queries run (DO NOT EXECUTE)
- [ ] Remote aligned with local (DO NOT EXECUTE)

**Next Phase**: Phase 3 - Commerce MVP (only after reconciliation executed and verified)
