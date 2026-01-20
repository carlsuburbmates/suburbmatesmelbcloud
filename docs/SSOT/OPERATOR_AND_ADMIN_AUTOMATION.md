# Operator & Admin Automation Manual

**Status:** ACTIVE - SSOT  
**Last Updated:** January 2026  
**Scope:** Database-level automation (Triggers, Functions, Crons)  
**Parent Document:** `AUTOMATION_ARCHITECTURE.md` (comprehensive overview)  
**Related:** `AI_AUTOMATION.md`, `SCHEMA_MAP.md`

---

## Overview

This document provides detailed implementation reference for **database-layer automation** in SuburbMates. For the complete automation architecture including AI and application layers, see `AUTOMATION_ARCHITECTURE.md`.

SuburbMates enforces critical business rules at the **database level** to ensure they cannot be bypassed by API calls, rogue scripts, or direct database access. This is the foundation of the solo-operator model.

---

## 1. Safety Automations (Triggers)

These rules are enforced **before** data is written to the database. Any violation raises an exception and rolls back the transaction.

| Trigger Name | Table | Event | Logic Enforced | Migration File |
|--------------|-------|-------|----------------|----------------|
| `on_auth_user_created` | `auth.users` | INSERT | Creates `users_public` profile automatically | `20260108000000_consolidate_identity_taxonomy.sql` |
| `check_product_limit_trigger` | `products` | INSERT | **Tier Limits:** Basic = 3 products, Pro = 10 products | `20260102000002_create_products.sql` |
| `listings_check_category_type` | `listings` | INS/UPD | **Taxonomy purity:** Listings must use 'business' categories only | `20260103000002_taxonomy_triggers_and_rpc.sql` |
| `products_check_category_type` | `products` | INS/UPD | **Taxonomy purity:** Products must use 'product' categories only | `20260103000002_taxonomy_triggers_and_rpc.sql` |
| `listing_tags_check_limit` | `listing_tags` | INSERT | **Spam Prevention:** Max 5 tags per listing | `20260103000002_taxonomy_triggers_and_rpc.sql` |
| `product_tags_check_limit` | `product_tags` | INSERT | **Spam Prevention:** Max 5 tags per product | `20260103000002_taxonomy_triggers_and_rpc.sql` |

### Implementation Examples

#### 1.1 Product Limit Enforcement

**File:** `supabase/migrations/20260102000002_create_products.sql`

```sql
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  current_tier listing_tier;
  max_limit INTEGER;
BEGIN
  -- Get the tier of the listing
  SELECT tier INTO current_tier FROM listings WHERE id = NEW.listing_id;
  
  -- Determine limit based on tier
  IF current_tier = 'Basic' THEN
    max_limit := 3;
  ELSIF current_tier = 'Pro' THEN
    max_limit := 10;
  ELSE
    max_limit := 3; -- Default safety fallback
  END IF;

  -- Count existing products for this listing
  SELECT COUNT(*) INTO current_count FROM products WHERE listing_id = NEW.listing_id;

  -- Enforce limit
  IF current_count >= max_limit THEN
    RAISE EXCEPTION 'Product limit reached for % tier. Limit is %.', current_tier, max_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_product_limit_trigger
BEFORE INSERT ON products
FOR EACH ROW EXECUTE FUNCTION check_product_limit();
```

**Error Handling in Application:**

```typescript
try {
  await supabase.from('products').insert(newProduct);
} catch (error) {
  if (error.message.includes('Product limit reached')) {
    return { 
      success: false, 
      error: 'Upgrade to Pro to add more products (Basic: 3, Pro: 10)' 
    };
  }
}
```

#### 1.2 Category Type Validation

**File:** `supabase/migrations/20260103000002_taxonomy_triggers_and_rpc.sql`

```sql
CREATE OR REPLACE FUNCTION check_category_type()
RETURNS TRIGGER AS $$
DECLARE
  category_type TEXT;
BEGIN
  -- Look up the category type
  SELECT type INTO category_type FROM categories WHERE id = NEW.category_id;

  -- Enforce "business" categories for listings
  IF TG_TABLE_NAME = 'listings' AND category_type <> 'business' THEN
    RAISE EXCEPTION 'Listings can only be assigned to "business" categories.';
  END IF;

  -- Enforce "product" categories for products
  IF TG_TABLE_NAME = 'products' AND category_type <> 'product' THEN
    RAISE EXCEPTION 'Products can only be assigned to "product" categories.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to both tables
CREATE TRIGGER listings_check_category_type
BEFORE INSERT OR UPDATE ON listings
FOR EACH ROW EXECUTE FUNCTION check_category_type();

CREATE TRIGGER products_check_category_type
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION check_category_type();
```

**Why this matters:** Prevents confusion between Directory (business listings) and Marketplace (products for sale). See `TAXONOMY_CONTRACT.md`.

#### 1.3 Tag Limit Enforcement

**File:** `supabase/migrations/20260103000002_taxonomy_triggers_and_rpc.sql`

```sql
CREATE OR REPLACE FUNCTION check_tag_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_limit INTEGER := 5;
BEGIN
  -- Count tags for the entity
  IF TG_TABLE_NAME = 'listing_tags' THEN
    SELECT COUNT(*) INTO current_count FROM listing_tags WHERE listing_id = NEW.listing_id;
  ELSIF TG_TABLE_NAME = 'product_tags' THEN
    SELECT COUNT(*) INTO current_count FROM product_tags WHERE product_id = NEW.product_id;
  END IF;

  -- Enforce limit
  IF current_count >= max_limit THEN
    RAISE EXCEPTION 'Tag limit of % reached for this entity.', max_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to both join tables
CREATE TRIGGER listing_tags_check_limit
BEFORE INSERT ON listing_tags
FOR EACH ROW EXECUTE FUNCTION check_tag_limit();

CREATE TRIGGER product_tags_check_limit
BEFORE INSERT ON product_tags
FOR EACH ROW EXECUTE FUNCTION check_tag_limit();
```

#### 1.4 Auto-Create User Profile

**File:** `supabase/migrations/20260108000000_consolidate_identity_taxonomy.sql`

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_public (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Why this matters:** Ensures every authenticated user has a public profile record. Prevents orphaned auth accounts.

---

## 2. Operational Automations (RPC Functions)

These functions power core business logic and are called by Server Actions, webhooks, or cron jobs.

### 2.1 Search Functions

| Function | Purpose | Parameters | Returns | File |
|----------|---------|------------|---------|------|
| `search_listings()` | Full-text search with filters | `query_text`, `council_filter`, `category_filter` | `TABLE (listings)` | `20260114000000_fix_council_catchment_logic.sql` |
| `search_products()` | Product search | `query_text`, `category_filter`, `min_price`, `max_price` | `TABLE (products)` | `20260114000000_fix_council_catchment_logic.sql` |

**Example Usage:**

```typescript
const { data } = await supabase.rpc('search_listings', {
  query_text: 'coffee',
  council_filter: 'Melbourne',
  category_filter: null,
});
```

### 2.2 Featured Queue Functions (FIFO Logic)

| Function | Purpose | Parameters | Returns | File |
|----------|---------|------------|---------|------|
| `check_queue_availability()` | Check free slots in council (max 5) | `target_council` | `INTEGER` (available count) | `20260113000001_upgrade_featured_queue.sql` |
| `join_queue()` | Add listing to FIFO queue | `p_listing_id` | `UUID` (queue entry ID) | `20260113000003_create_join_queue_rpc.sql` |
| `process_daily_queue()` | **CRON JOB:** Expire old, promote pending | None | `TABLE (actions)` | `20260113000002_queue_processing_rpc.sql` |
| `activate_queued_item()` | Manually activate pending item | `queue_record_id` | `VOID` | `20260111000004_fix_featured_logic.sql` |
| `expire_finished_slots()` | Clean up expired entries | None | `VOID` | `20260113000005_monetization_rpcs.sql` |
| `claim_promotion_tasks()` | Background job processor | `p_limit` | `TABLE (tasks)` | `20260113000005_monetization_rpcs.sql` |
| `reconcile_and_finalize()` | Match Stripe payment to queue | `p_checkout_session_id`, `p_stripe_payment_intent_id` | `VOID` | `20260113000005_monetization_rpcs.sql` |
| `cleanup_stuck_processing()` | Recover stuck tasks | None | `INTEGER` (count fixed) | `20260113000005_monetization_rpcs.sql` |

#### Key Function: `process_daily_queue()`

**File:** `supabase/migrations/20260113000002_queue_processing_rpc.sql`

This is the **heart of the Featured FIFO system**. Called by cron job at midnight UTC.

```sql
CREATE OR REPLACE FUNCTION public.process_daily_queue()
RETURNS TABLE (
    action_type text,         -- 'expired' or 'promoted'
    listing_id uuid,
    listing_name text,
    owner_email text,
    council_name text,
    new_end_date timestamptz
)
LANGUAGE plpgsql AS $$
DECLARE
    r_expired RECORD;
    r_next RECORD;
BEGIN
    -- Step 1: Find and expire active items past their end date
    FOR r_expired IN
        SELECT fq.id, fq.listing_id, fq.council_name, l.name, u.email
        FROM public.featured_queue fq
        JOIN public.listings l ON fq.listing_id = l.id
        JOIN public.users_public up ON l.owner_id = up.id
        JOIN auth.users u ON up.id = u.id
        WHERE fq.status = 'active' AND fq.ends_at < now()
    LOOP
        -- Mark as expired
        UPDATE public.featured_queue
        SET status = 'expired'
        WHERE id = r_expired.id;

        -- Return expiry event (for email notification)
        action_type := 'expired';
        listing_id := r_expired.listing_id;
        listing_name := r_expired.listing_name;
        owner_email := r_expired.owner_email;
        council_name := r_expired.council_name;
        new_end_date := NULL;
        RETURN NEXT;

        -- Step 2: Promote next in line (FIFO)
        SELECT fq.id, fq.listing_id, l.name, u.email INTO r_next
        FROM public.featured_queue fq
        JOIN public.listings l ON fq.listing_id = l.id
        JOIN public.users_public up ON l.owner_id = up.id
        JOIN auth.users u ON up.id = u.id
        WHERE fq.council_name = r_expired.council_name
        AND fq.status = 'pending'
        ORDER BY fq.requested_at ASC -- FIFO: earliest first
        LIMIT 1;

        IF FOUND THEN
            -- Activate the next item
            UPDATE public.featured_queue
            SET 
                status = 'active',
                started_at = now(),
                ends_at = now() + interval '30 days'
            WHERE id = r_next.id;

            -- Update denormalized "featured_until" on listing
            UPDATE public.listings
            SET featured_until = now() + interval '30 days'
            WHERE id = r_next.listing_id;

            -- Return promotion event (for email notification)
            action_type := 'promoted';
            listing_id := r_next.listing_id;
            listing_name := r_next.listing_name;
            owner_email := r_next.owner_email;
            council_name := r_expired.council_name;
            new_end_date := now() + interval '30 days';
            RETURN NEXT;
        END IF;
    END LOOP;

    RETURN;
END;
$$;
```

**Integration with Application Layer:**

```typescript
// Called by cron processor or webhook
export async function processDailyQueueNotifications() {
  const { data, error } = await supabaseAdmin.rpc('process_daily_queue');
  
  if (error) {
    console.error('Queue processing failed:', error);
    return;
  }
  
  // Send emails for each action
  for (const event of data) {
    if (event.action_type === 'expired') {
      await sendFeaturedExpiryNotice(event.owner_email, event.listing_name, event.council_name);
    } else if (event.action_type === 'promoted') {
      await sendFeaturedActiveEmail(event.owner_email, event.listing_name, event.council_name, event.new_end_date);
    }
  }
}
```

### 2.3 Utility Functions

| Function | Purpose | Parameters | Returns | File |
|----------|---------|------------|---------|------|
| `get_my_role()` | Get current user's role | None (uses `auth.uid()`) | `app_role` | `20260102000006_listings_rls.sql` |
| `upsert_tag()` | Create or update tag | `tag_name` | `UUID` (tag ID) | `20260103000002_taxonomy_triggers_and_rpc.sql` |

**Example: `upsert_tag()`**

```sql
CREATE OR REPLACE FUNCTION upsert_tag(tag_name TEXT)
RETURNS UUID AS $$
DECLARE
  tag_slug TEXT;
  tag_id UUID;
BEGIN
  -- Generate slug from name
  tag_slug := lower(regexp_replace(tag_name, '[^a-zA-Z0-9]+', '-', 'g'));

  -- Insert or update
  INSERT INTO tags (name, slug)
  VALUES (tag_name, tag_slug)
  ON CONFLICT (slug) DO UPDATE SET name = tag_name
  RETURNING id INTO tag_id;

  RETURN tag_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 3. Scheduled Automations (Cron Jobs)

⚠️ **CRITICAL:** Cron jobs are **NOT** defined in migration files. They must be configured manually in the Supabase Dashboard or via SQL after pg_cron extension is enabled.

### Required Cron Jobs

| Job Name | Schedule | Function Called | Purpose |
|----------|----------|-----------------|---------|
| `daily_queue_rotation` | `0 0 * * *` (Midnight UTC) | `process_daily_queue()` | Expire old Featured slots, promote next in queue |
| `cleanup_expired_slots` | `0 1 * * *` (1am UTC) | `expire_finished_slots()` | Archive expired queue entries |
| `recover_stuck_tasks` | `0 */6 * * *` (Every 6 hours) | `cleanup_stuck_processing()` | Reset stuck background jobs |

### Setup Instructions

#### Via Supabase Dashboard (Recommended)

1. Navigate to **Database → Cron Jobs**
2. Click **"Create a new cron job"**
3. Enter details:
   - **Name:** `daily_queue_rotation`
   - **Schedule:** `0 0 * * *`
   - **Command:** `SELECT * FROM process_daily_queue();`
4. Save and enable
5. Repeat for other cron jobs

#### Via SQL (if pg_cron enabled)

```sql
-- Enable extension (one-time setup)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily queue rotation
SELECT cron.schedule(
  'daily_queue_rotation',
  '0 0 * * *',
  $$SELECT * FROM process_daily_queue()$$
);

-- Schedule cleanup
SELECT cron.schedule(
  'cleanup_expired_slots',
  '0 1 * * *',
  $$SELECT * FROM expire_finished_slots()$$
);

-- Schedule recovery
SELECT cron.schedule(
  'recover_stuck_tasks',
  '0 */6 * * *',
  $$SELECT * FROM cleanup_stuck_processing()$$
);
```

### Verification

```sql
-- List all scheduled jobs
SELECT * FROM cron.job;

-- View recent job runs
SELECT jobname, status, start_time, end_time, 
       (end_time - start_time) as duration,
       return_message
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;

-- Check for failures
SELECT * FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC;
```

### Manual Execution (Testing)

```sql
-- Test queue processing manually
SELECT * FROM process_daily_queue();

-- Test cleanup
SELECT * FROM expire_finished_slots();

-- Test recovery
SELECT cleanup_stuck_processing();
```

---

## 4. Error Handling

### Trigger Failures

**Behavior:** Triggers raise exceptions that rollback the entire transaction.

```sql
-- Example error
EXCEPTION: Product limit reached for Basic tier. Limit is 3.
```

**Application Handling:**

```typescript
try {
  const { error } = await supabase.from('products').insert(product);
  if (error) throw error;
  return { success: true };
} catch (error) {
  // Parse database exception
  if (error.message.includes('Product limit reached')) {
    return { 
      success: false, 
      error: 'Upgrade to Pro to add more products',
      code: 'TIER_LIMIT_EXCEEDED'
    };
  }
  throw error; // Unexpected error
}
```

### Cron Job Failures

**Detection:**

```sql
SELECT * FROM cron.job_run_details
WHERE status = 'failed'
AND start_time > now() - interval '7 days'
ORDER BY start_time DESC;
```

**Recovery:**

1. Check error in `return_message` column
2. Fix underlying issue (function bug, permission, etc.)
3. Manually run function to catch up:
   ```sql
   SELECT * FROM process_daily_queue();
   ```

### RPC Function Errors

**Pattern:** Functions return error codes or raise exceptions.

```typescript
const { data, error } = await supabase.rpc('join_queue', { p_listing_id: id });

if (error) {
  console.error('Queue join failed:', error);
  // Fallback logic or user notification
}
```

---

## 5. Testing

### Test Triggers Locally

```sql
-- Test product limit (should fail on 4th insert for Basic tier)
BEGIN;
  -- Assume listing has tier = 'Basic'
  INSERT INTO products (listing_id, name, price, category_id)
  VALUES ('existing-listing-uuid', 'Product 1', 10.00, 'category-uuid');
  
  INSERT INTO products (listing_id, name, price, category_id)
  VALUES ('existing-listing-uuid', 'Product 2', 10.00, 'category-uuid');
  
  INSERT INTO products (listing_id, name, price, category_id)
  VALUES ('existing-listing-uuid', 'Product 3', 10.00, 'category-uuid');
  
  -- This should RAISE EXCEPTION
  INSERT INTO products (listing_id, name, price, category_id)
  VALUES ('existing-listing-uuid', 'Product 4', 10.00, 'category-uuid');
ROLLBACK; -- Clean up test data
```

### Test Cron Jobs

```bash
# Local Supabase
supabase start
psql postgresql://postgres:postgres@localhost:54322/postgres

# Run function manually
SELECT * FROM process_daily_queue();

# Verify results
SELECT * FROM featured_queue WHERE status = 'expired';
SELECT * FROM featured_queue WHERE status = 'active';
```

### Test RPC Functions

```typescript
// In test file or playground
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.rpc('check_queue_availability', {
  target_council: 'Melbourne'
});

console.log('Available slots:', data); // Should be 0-5
```

---

## 6. Monitoring

### Database Metrics

```sql
-- Trigger execution counts
SELECT schemaname, tablename, n_tup_ins, n_tup_upd
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_tup_ins DESC;

-- Function call statistics
SELECT proname, calls, total_time, avg_time
FROM pg_stat_user_functions
WHERE schemaname = 'public'
ORDER BY calls DESC;

-- Active triggers
SELECT tgname, tgrelid::regclass, tgenabled
FROM pg_trigger
WHERE tgisinternal = false;
```

### Cron Job Health

```sql
-- Success rate by job
SELECT 
  jobname,
  COUNT(*) FILTER (WHERE status = 'succeeded') as successes,
  COUNT(*) FILTER (WHERE status = 'failed') as failures,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'succeeded') / COUNT(*), 2) as success_rate
FROM cron.job_run_details
WHERE start_time > now() - interval '7 days'
GROUP BY jobname;
```

---

## 7. Pre-Launch Checklist

### Database Layer

- [ ] All triggers deployed to production
- [ ] All RPC functions deployed
- [ ] Test each trigger with edge cases
- [ ] Test each RPC function manually
- [ ] Verify Row Level Security policies active

### Cron Jobs

- [ ] `daily_queue_rotation` scheduled and enabled
- [ ] `cleanup_expired_slots` scheduled and enabled
- [ ] `recover_stuck_tasks` scheduled and enabled
- [ ] Test manual execution of each job
- [ ] Verify cron job logging is working

### Monitoring

- [ ] Set up alerts for cron failures
- [ ] Document recovery procedures
- [ ] Test rollback scenarios
- [ ] Verify audit logging (if enabled)

---

## Related Documentation

- **`AUTOMATION_ARCHITECTURE.md`** - Complete automation system overview
- **`AI_AUTOMATION.md`** - Z.ai integration and Phase 5 workflows
- **`SCHEMA_MAP.md`** - Database schema reference
- **`platform-logic.md`** - FIFO queue logic and business rules
- **`api.md`** - Server Actions that call these functions
