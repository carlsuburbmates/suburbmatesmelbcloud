# Agent Instructions - Supabase & Database

## CRITICAL: Environment Files

### Production (.env.local)
- Contains **PRODUCTION** Supabase credentials
- **READ the warning header** in `.env.local` before any operations
- NEVER modify, delete, or expose these values
- NEVER run destructive operations against production endpoints

### Local Development (.env.development.local)
- Contains **LOCAL** Supabase credentials (Docker-based)
- Safe for testing, experimenting, schema changes
- Use `supabase db reset` freely here

### Switching Environments
```bash
# For local isolated testing (recommended for development):
supabase start
# App will use .env.development.local if it exists

# For production testing:
supabase stop
# App will use .env.local
```

---

## Critical Rules

### 1. NEVER Run SQL Directly on Production
- Do NOT use Supabase Dashboard SQL Editor for schema changes
- Do NOT use `psql` to alter tables directly
- ALL schema changes MUST go through migration files

### 2. Creating Migrations
```bash
# ALWAYS use CLI to generate unique timestamp
supabase migration new <descriptive_name>

# NEVER manually name files with timestamps
# NEVER copy-paste timestamps from other migrations
```

### 3. Before Creating Any Migration
```bash
# Check current sync status first
supabase migration list --linked

# If there's drift (local != remote), STOP and reconcile first
```

### 4. Applying Migrations
```bash
# Test locally first (if Docker available):
supabase db reset

# Push to remote production:
supabase db push --linked

# Verify after push:
supabase migration list --linked
```

### 5. One Migration = One Purpose
- Keep migrations atomic and focused
- Name clearly: `add_user_preferences`, `fix_orders_index`, `create_reviews_table`
- Include rollback comments if complex

### 6. Local Development with Docker
```bash
# Start local Supabase:
supabase start

# Reset and reseed local DB:
supabase db reset

# Stop local Supabase:
supabase stop
```

### 7. Environment Reference
| Environment | URL | Credentials |
|-------------|-----|-------------|
| Production | `nhkmhgbbbcgfbudszfqj.supabase.co` | `.env.local` |
| Local | `127.0.0.1:54321` | `.env.development.local` |

---

## Safe vs Unsafe Operations

### SAFE (No approval needed)
- Read-only queries
- Local development (`supabase start/stop/reset`)
- Creating migration files
- Running `npm run dev` / `npm run build`

### UNSAFE (Ask user first)
- `supabase db push --linked` (applies to production)
- Direct SQL on production via Dashboard
- Deleting/modifying user data
- Changing RLS policies on production
- Any operation using `SUPABASE_SERVICE_ROLE_KEY`

---

## If You Discover Drift

1. Run `supabase migration list --linked`
2. Document what's out of sync
3. **Ask user before attempting repair**
4. Use `supabase migration repair <version> --status applied --linked` to mark as synced

---

## Tables Reference (as of Jan 2026)

**Core:** `listings`, `users_public`, `products`, `categories`, `tags`
**Commerce:** `orders`, `order_items`, `cart_items`
**Features:** `featured_queue`, `localities`, `reports`, `audit_logs`
**Join:** `listing_tags`, `product_tags`
**Other:** `service_definitions`, `articles`

---

## Quick Commands

```bash
# Check migration status
supabase migration list --linked

# Create new migration
supabase migration new <name>

# Apply to production
supabase db push --linked

# Local dev
supabase start
supabase db reset
supabase stop
```

---

## Known Local vs Production Differences

The local database is created fresh from migrations. Production may have columns/features added directly via SQL that aren't in migrations yet.

### Missing on Local (exists on Production only):
- `listings.search_vector` - Full-text search column (tsvector)
- Some PostGIS indexes and spatial optimizations

### To sync these differences:
1. Create a new migration that adds the missing column/feature
2. Test locally with `supabase db reset`
3. Push to production with `supabase db push --linked`

---

## RPC Functions Available

| Function | Purpose |
|----------|---------|
| `search_listings` | Full-text search with filters |
| `search_products` | Product search |
| `join_queue` | Add listing to featured queue |
| `process_daily_queue` | Cron job for queue processing |
| `check_featured_availability` | Check if slot is available |
| `get_my_role` | Get current user's role |
| `upsert_tag` | Create or update tag |
| `activate_queued_item` | Activate a queued listing |
| `expire_finished_slots` | Expire old featured slots |
| `claim_promotion_tasks` | Background job helper |
| `reconcile_and_finalize` | Order reconciliation |

---

## Seed Data

Edit `supabase/seed.sql` to add test data. After editing:
```bash
supabase db reset  # Resets DB and runs seed.sql
```

---

## Troubleshooting

### "relation does not exist" on local
The migration order may be wrong or a table wasn't created. Check:
```bash
supabase db reset --debug
```

### "column does not exist" on local  
Column was added directly on production. Create a migration to add it.

### Migration drift detected
Run `supabase migration list --linked` to see what's out of sync. Use `repair` command to reconcile.

### Docker containers not starting
```bash
supabase stop --no-backup
docker system prune -f
supabase start
```

---

# Agent Instructions - AI Automation & MCP

## 1. AI Implementation Standards
**Goal:** Unified AI pipeline via Z.ai and Vercel AI SDK.

- **Do Not:** Use generic `openai` fetch calls.
- **Do:** Use the helper at `lib/ai/z-ai-provider.ts` and actions in `actions/z-ai-actions.ts`.
- **Reference:** Full architecture details are in `docs/AI_AUTOMATION.md`.

## 2. MCP Tool Usage
**Goal:** Use installed MCP servers for external tool interactions instead of manual API calls.

- **Stripe:** Use MCP tools to check products/subscriptions.
- **Resend:** Use MCP to check email logs or domains.
- **Supabase:** Use MCP for quick schema inspection (read-only).
- **GitHub:** Use MCP to search code or check PRs.

## 3. Creating New AI Features
When asked to build a new AI feature (e.g., "Auto-Review Bot"):
1.  **Check:** Is there an existing action in `actions/z-ai-actions.ts`?
2.  **Extend:** If not, add a new specific function there using the `zai` provider.
3.  **UI:** Use the standard `useChat` hook from `@ai-sdk/react` pointing to `/api/chat` for streaming interfaces.
