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
