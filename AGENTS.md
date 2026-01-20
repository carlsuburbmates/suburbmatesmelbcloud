# Agent Instructions - Supabase & Database

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
# Push to remote (no Docker needed)
supabase db push --linked

# Verify after push
supabase migration list --linked
```

### 5. One Migration = One Purpose
- Keep migrations atomic and focused
- Name clearly: `add_user_preferences`, `fix_orders_index`, `create_reviews_table`
- Include rollback comments if complex

### 6. No Docker Available
This project uses remote-only Supabase. Do NOT attempt:
- `supabase start` (requires Docker)
- `supabase db reset` (requires Docker)
- `supabase db dump` without `--linked` flag

### 7. Environment
- Remote: `nhkmhgbbbcgfbudszfqj.supabase.co`
- Credentials: `.env.local`
- Branch: `main` only (no feature branches for DB)

## If You Discover Drift

1. Run `supabase migration list --linked`
2. Document what's out of sync
3. Ask user before attempting repair
4. Use `supabase migration repair <version> --status applied --linked` to mark as synced

## Tables Reference (as of Jan 2026)

Core: `listings`, `users_public`, `products`, `categories`, `tags`
Commerce: `orders`, `order_items`, `cart_items`
Features: `featured_queue`, `localities`, `reports`, `audit_logs`
Join: `listing_tags`, `product_tags`
