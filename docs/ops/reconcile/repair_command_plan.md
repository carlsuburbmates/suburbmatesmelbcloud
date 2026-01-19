# Migration Repair Command Plan

## Context
Supabase CLI has `supabase migration repair` command but syntax needs exact verification.
This plan documents the exact commands needed for history alignment.

## Command Syntax (from --help)

```bash
supabase migration repair [version] ... [flags]
```

### Flags Available
- `--db-url string` - Repairs migrations of database specified by connection string (must be percent-encoded)
- `--linked` - Repairs migrations history of linked project (default true)
- `--local` - Repairs migrations history of local database
- `--status [applied | reverted]` - Version status to update
- `--password string` - Password to your remote Postgres database

## Proposed Repair Strategy

### Option A: Mark Remote-Only as Applied (Recommended)
After creating empty local migration files to represent remote-only timestamps:

```bash
# For each of the 29 remote-only versions, mark as applied
supabase migration repair 20260108025539 --status applied
supabase migration repair 20260108025707 --status applied
supabase migration repair 20260108025858 --status applied
# ... repeat for all 29 versions
```

Then apply local-only migrations:
```bash
supabase db push
```

### Option B: Force Reset (DANGEROUS)
If Option A fails and we need clean slate:

```bash
# WARNING: This resets entire migration history
supabase db reset --linked
```

### Option C: Manual SQL Insert (Fallback)
Insert directly into supabase_migrations.schema_migrations table:

```sql
-- Mark each remote-only version as applied
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES
  ('20260108025539', 'remote-only-ad-hoc'),
  ('20260108025707', 'remote-only-ad-hoc'),
  -- ... all 29 versions
ON CONFLICT (version) DO NOTHING;
```

## Verification After Repair

```bash
# Check alignment
supabase migration list --linked

# Expected: Local and Remote columns show identical lists
```

## Missing: Exact DB Connection String

The repair command needs either:
1. `--db-url` flag with percent-encoded connection string, OR
2. Implicit authentication via --linked (preferred, but requires Docker)

**Current Blocker**: Docker daemon not running
**Status**: UNVERIFIED - commands documented but not tested until Docker running

---

## Notes

- DO NOT manually edit supabase_migrations schema tables directly unless absolutely necessary
- The `--linked` flag is safer than `--db-url` if available
- After repair, `supabase db push` should work cleanly

## Reference

- Help output captured in: docs/ops/reconcile/repair_help_output.txt
- Drift report: docs/ops/DRIFT_RECONCILIATION_REPORT.md
