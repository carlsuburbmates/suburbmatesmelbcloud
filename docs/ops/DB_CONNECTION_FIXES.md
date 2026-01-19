# Database Connection Fixes - Supabase Research

**Generated**: 2026-01-16
**Context**: psql connection refused to `db.nhkmhgbbbcgfbudszfqj.supabase.co:5432`

---

## Root Cause Analysis

### Issue 1: Direct psql Connection Refused

**Error Observed**:
```
psql: error: connection to server at "db.nhkmhgbbbcgfbudszfqj.supabase.co" (2406:da1a:6b0:f611:b825:c416:3dad:ce12), port 5432 failed: Connection refused
Is the server running on that host and accepting TCP/IP connections?
```

**Likely Causes**:
1. **IP whitelist restrictions** - Supabase databases don't accept connections from all IPs
2. **Firewall blocking port 5432**
3. **VPN/proxy interference**
4. **Incorrect connection string format**
5. **Database temporarily unavailable**

**References**:
- GitHub Issue #36091: "In supabase/supabase" - Postgres 17.6 not working locally
- GitHub Issue #11199: "Self-hosted Supabase" - Supabase from docker hub fails to start in wsl 2 with docker desktop

---

## Connection String Formats

### Format 1: Pooler Connection String (What we have)

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Example**:
```
postgresql://postgres.nhkmhgbbbcgfbudszfqj:SERVICE_ROLE_KEY@db.nhkmhgbbbcgfbudszfqj.supabase.co:5432/postgres
```

**Notes**:
- This format bypasses the pooler URL and connects directly
- Port 5432 must be included
- Database name is `postgres`

---

### Format 2: Direct Database URL

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]
```

**Example**:
```
postgresql://postgres.nhkmhgbbbcgfbudszfqj:SERVICE_ROLE_KEY@db.nhkmhgbbbcgfbudszfqj.supabase.co:5432/postgres
```

**Same as Format 1** - the pooler format is actually the direct format

---

### Format 3: Connection Parameters (for psql)

```
psql --host=HOST \
     --port=5432 \
     --username=USER \
     --password=PASSWORD \
     --dbname=DATABASE_NAME
```

**Our Working Values**:
```
psql --host="db.nhkmhgbbbcgfbudszfqj.supabase.co" \
     --port=5432 \
     --username="postgres.nhkmhgbbbcgfbudszfqj" \
     --dbname="postgres" \
     --password="$SERVICE_ROLE_KEY"
```

---

## Supabase CLI Connection Solutions

### Solution 1: Use --linked flag (RECOMMENDED for schema operations)

```bash
# The --linked flag uses the project's connection pooler automatically
# Works for: db dump, db push, db pull (without Docker)
supabase db dump --linked
supabase db push --linked
```

**Note**: Requires Docker Desktop for most commands

---

### Solution 2: Use --db-url with percent-encoded @ symbol

```bash
# The @ symbol in passwords must be percent-encoded as %40
# Supabase CLI: db-url must be percent-encoded connection string
ENCODED_PASSWORD=$(echo -n "$SERVICE_ROLE_KEY" | od -An -tx1 | head -1 | tr ' ' '%' | tr -cd '%' | tr -d ' ')
DB_URL="postgresql://postgres.PROJECT_REF%40${ENCODED_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

# Then use with CLI
supabase db dump --db-url "$DB_URL"
```

**Reference**: https://supabase.com/docs/reference/cli/supabase-db-push

---

### Solution 3: Use psql with PGPASSWORD env var

```bash
export PGPASSWORD="$SERVICE_ROLE_KEY"

psql --host="db.nhkmhgbbbcgfbudszfqj.supabase.co" \
     --port=5432 \
     --username="postgres.nhkmhgbbbcgfbudszfqj" \
     --dbname="postgres" \
     -c "SELECT version();"
```

**Note**: psql should be installed: `brew install postgresql` (v14.x is sufficient)

---

### Solution 4: Connection Pooler URL via CLI

```bash
# Get pooler URL from project settings
# This is what the SERVICE_ROLE_KEY is for
POOLER_URL="https://nhkmhgbbbcgfbudszfqj.supabase.co"

# Use for initial setup
supabase link --project-ref nhkmhgbbbcgfbudszfqj --skip-pooler
```

**Note**: This requires running `supabase link` first

---

## Troubleshooting Connection Refused Errors

### Check 1: Verify Service Role Key Validity

```bash
# Check if key has expired or been revoked
curl -X POST "https://nhkmhgbbbcgfbudszfqj.supabase.co/rest/v1/projects/validate-api-key" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

**Expected Response**: `{ "is_valid": true }`
**If Invalid**: Regenerate key in Supabase Dashboard → Settings → Database → Connection Pooling

---

### Check 2: Test Network Connectivity

```bash
# Test basic network connectivity
ping -c 3 db.nhkmhgbbbcgfbudszfqj.supabase.co

# Test DNS resolution
nslookup db.nhkmhgbbbcgfbudszfqj.supabase.co

# Test TCP port connectivity
nc -zv db.nhkmhgbbbcgfbudszfqj.supabase.co 5432
```

**Expected**: Pings and port check should succeed

---

### Check 3: Verify Database is Accessible

```bash
# Test if the database is accepting connections
psql --host="db.nhkmhgbbbcgfbudszfqj.supabase.co" \
     --port=5432 \
     --username="postgres.nhkmhgbbbcgfbudszfqj" \
     --dbname="postgres" \
     -c "\conninfo" -- returns connection info
```

**Expected Output**:
```
connection to server at "db.nhkmhgbbbcgfbudszfqj.supabase.co", port 5432:
  Hostname: db.nhkmhgbbbcgfbudszfqj.supabase.co
  Port: 5432
  SSL: TLSv1.3 (encrypted)
  SSL compression: off
```

---

## Recommended Actions

### Action 1: Use Supabase SQL Editor (FASTEST)

1. Log into Supabase Dashboard: https://supabase.com/dashboard/project/nhkmhgbbbcgfbudszfqj/database
2. Navigate to SQL Editor
3. Run this query:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public'
  AND table_name IN ('reports', 'orders', 'order_items', 'cart_items', 'localities')
ORDER BY table_name;
```
4. Paste results to: `docs/ops/reconcile/production_verification_results.txt`

---

### Action 2: Test Connection from Different Network

**If working from home network**:
```bash
# Try from home network (different IP)
psql --host="db.nhkmhgbbbcgfbudszfqj.supabase.co" \
     --username="postgres.nhkmhgbbbcgfbudszfqj" \
     --password="$SERVICE_ROLE_KEY"
```

**If working from VPN/proxy**:
```bash
# Temporarily disable VPN or proxy
# Then retry psql command
```

---

### Action 3: Regenerate Service Role Key

If connection authentication continues to fail:

1. Log into Supabase Dashboard
2. Settings → Database → Connection Pooling
3. Click "Regenerate Service Role Key"
4. Copy new key
5. Update `.env.local` file:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ...new-key...
```
6. Test connection again

---

## Key Takeaways

| Issue | Root Cause | Recommended Fix |
|-------|-------------|------------------|
| psql connection refused | IP whitelist / firewall | Use Supabase SQL Editor for verification |
| Docker not running | Docker Desktop not started | Start Docker Desktop (required for CLI) |
| Wrong connection string format | Password not properly formatted | Use --db-url with percent-encoded password |
| Service Role Key expired | Key revoked / expired | Regenerate in Dashboard |

---

## Commands to Try (in order)

```bash
# 1. Test basic connectivity
nc -zv db.nhkmhgbbbcgfbudszfqj.supabase.co 5432

# 2. Try psql with correct params
export PGPASSWORD="$SERVICE_ROLE_KEY"
psql --host="db.nhkmhgbbbcgfbudszfqj.supabase.co" --port=5432 --username="postgres.nhkmhgbbbcgfbudszfqj" --dbname="postgres" -c "\conninfo"

# 3. Try with direct DB URL
export PGPASSWORD="$SERVICE_ROLE_KEY"
ENCODED_PASSWORD=$(echo -n "$SERVICE_ROLE_KEY" | od -An -tx1 | head -1 | tr ' ' '%' | tr -cd '%' | tr -d ' ')
DB_URL="postgresql://postgres.nhkmhgbbbcgfbudszfqj%40${ENCODED_PASSWORD}@db.nhkmhgbbbcgfbudszfqj.supabase.co:5432/postgres"
psql "$DB_URL" -c "\dt+ public.*"

# 4. Try Supabase CLI with --db-url (if CLI access works)
ENCODED_PASSWORD=$(echo -n "$SERVICE_ROLE_KEY" | od -An -tx1 | head -1 | tr ' ' '%' | tr -cd '%' | tr -d ' ')
DB_URL="postgresql://postgres.nhkmhgbbbcgfbudszfqj%40${ENCODED_PASSWORD}@db.nhkmhgbbbcgfbudszfqj.supabase.co:5432/postgres"
supabase db dump --db-url "$DB_URL" --data-only > /tmp/test-dump.sql

# 5. Start Docker and try CLI (required for most Supabase commands)
open -a Docker
# Wait for "Docker Desktop is running" status
supabase db dump --linked > /tmp/remote-schema.sql
```

---

## Final Recommendation

### PRIMARY: Use Supabase SQL Editor for table verification
**Why**:
1. No connection issues (works via dashboard)
2. Fastest way to verify schema
3. No local tooling needed

### SECONDARY: Regenerate Service Role Key if SQL Editor works but psql fails
**Why**:
- Key may have expired during local setup
- Easy to verify and test

### TERTIARY: Start Docker Desktop for CLI commands
**Why**:
- Most `supabase db` commands require Docker
- Some `db push --linked` workflows need Docker
- Docker Desktop is standard development requirement

---

## Documentation Links

- Supabase CLI Reference: https://supabase.com/docs/reference/cli
- Local Development Guide: https://supabase.com/docs/guides/cli/local-development
- Connecting to Postgres: https://supabase.com/docs/guides/cli/connecting-to-postgres
- Troubleshooting: https://supabase.com/docs/guides/cli/troubleshooting
