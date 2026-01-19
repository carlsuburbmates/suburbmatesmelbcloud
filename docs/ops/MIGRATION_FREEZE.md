# Migration Freeze - Phase 1

**Status**: ACTIVE as of $(date '+%Y-%m-%d %H:%M:%S %Z')

**Context**: Immediate unblocking of deploy + stopping production drift before reconciliation.

## What This Means

1. **No Direct SQL on Production**: All schema changes must go through migrations ONLY.

2. **Migration is Source of Truth**: If production differs from migrations, that's drift that must be reconciled.

3. **Exceptions Require Logged Reason**: If direct SQL is absolutely necessary, file a GitHub issue documenting:
   - What change was made
   - Why it couldn't be a migration
   - Retroactive migration to track it

## Exceptions Process

If you must execute direct SQL on production:

```sql
-- 1. Document in GitHub issue before executing
-- 2. Capture before/after state
-- 3. Create migration immediately after to make it reproducible
```

## Next Steps (Phase 2)

- Capture remote schema baseline: `supabase db dump --schema-only > remote-schema.sql`
- Compare against local migrations
- Create reconciliation migration: `20260117000000_reconcile_drift.sql`
- Verify via `supabase migration list --linked`

## Sign-off

- [x] Build/lint blockers fixed
- [x] This freeze document created
- [ ] Remote schema captured
- [ ] Drift reconciliation complete
- [ ] Remote matches local migrations

**Owner**: OpenCode execution
**Next Review**: After Phase 2 completion
