# Actual Implementation State

**Status:** VERIFIED (matches codebase)  
**Date:** 2026-01-21  
**Purpose:** Documents what is ACTUALLY implemented, not aspirational features

---

## 1. Database Schema (ACTUAL)

### Listings Table

| Column | Type | Purpose |
|---------|-------|---------|
| `id` | UUID | Primary key |
| `owner_id` | UUID (nullable) | Owner (Creator), null if unclaimed |
| `name` | TEXT | Business name |
| `description` | TEXT | Business description |
| `location` | TEXT | Council area name |
| `category_id` | BIGINT | Business category FK |
| `is_verified` | BOOLEAN | ABN verification status |
| `tier` | ENUM('Basic', 'Pro') | **Subscription level (NOT S-stage)** |
| `featured_until` | TIMESTAMP | Featured placement expiry |
| `status` | ENUM('unclaimed', 'claimed') | **Claim status (NOT S-stage)** |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

**IMPORTANT:**
- NO `s_stage` column exists
- `tier` tracks subscription level (Basic/Pro)
- `status` tracks claim status (unclaimed/claimed)
- S-stage model (S0-S3) is **NOT IMPLEMENTED**

### Users Public Table

| Column | Type | Purpose |
|---------|-------|---------|
| `id` | UUID | Primary key (FK to auth.users) |
| `role` | ENUM('visitor', 'creator', 'operator') | User role |
| `stripe_customer_id` | TEXT | Stripe customer reference |
| `stripe_subscription_status` | TEXT | Subscription status string |
| `stripe_account_id` | TEXT | Stripe Connect account |
| `warning_count` | INTEGER | Enforcement tracking |
| `is_delisted` | BOOLEAN | Platform enforcement |
| `is_suspended` | BOOLEAN | Temporary ban |
| `is_evicted` | BOOLEAN | Permanent ban |
| `evicted_at` | TIMESTAMP | Eviction time |
| `violation_log` | JSONB | Enforcement history |

**IMPORTANT:**
- NO `s_stage` column exists
- Subscription status is in `stripe_subscription_status` (text field)
- Tier determination is likely manual or via Stripe webhook

---

## 2. S-Stage Model (NOT IMPLEMENTED)

### SSOT Description (Aspirational)

SSOT documents describe:
- S0: Incomplete
- S1: Live (Basic)
- S2: Optimised
- S3: Pro-enabled

With automatic S-stage computation and gating.

### Actual Implementation

**Status:** NOT IMPLEMENTED

The database schema does not support S-stages:
- NO `listings.s_stage` column
- NO automatic S-stage computation trigger
- NO S-stage gating for Featured purchase
- NO S-stage progression triggers

### What ACTUALLY Exists

1. **Tier System:** Basic (free) vs Pro ($20/month)
2. **Claim Status:** Unclaimed vs Claimed
3. **Verification:** Boolean `is_verified` badge
4. **Featured:** `featured_until` timestamp
5. **Product Limits:** Enforced by database trigger `check_product_limit_trigger`
   - Basic tier: 3 products max
   - Pro tier: 10 products max

### How S-Stage Concepts Map to Reality

| SSOT Concept | Actual Implementation | Notes |
|--------------|---------------------|-------|
| S0: Incomplete | `status='unclaimed'` | Listing exists but no owner |
| S1: Live (Basic) | `status='claimed', tier='Basic'` | Owner assigned, Basic tier |
| S2: Optimised | NO EQUIVALENT | **This concept doesn't exist** |
| S3: Pro-enabled | `status='claimed', tier='Pro'` | Owner assigned, Pro tier |

**S2 (Optimised) Missing:**
- No automatic detection of "optimised" state
- No S-stage gating for Featured purchase
- Both Basic and Pro tiers can purchase Featured slots (user confirmed)
- Product limits enforced by tier, not S-stage

---

## 3. Featured Placement (ACTUAL)

### FIFO Queue

**Table:** `featured_queue`
- `status`: 'pending' | 'active' | 'completed' | 'expired'
- `requested_at`: FIFO ordering
- `started_at`: Activation time
- `ends_at`: 30 days from start

### Gating Rule (Per User)

**User statement:** "both tiers can buy featured business slot (15aud for 30 days non recurring, FIFO)"

**Actual behavior:**
- No S-stage check in database
- Capacity check: Max 5 slots per council
- If <5 active: Immediate activation
- If >=5 active: Queue (pending status)
- **Basic tier (S1) users CAN purchase Featured** (confirmed by user)
- **Pro tier users CAN purchase Featured**
- Gating is based on **Council capacity**, not S-stage or tier

---

## 4. Product Limits (ACTUAL)

### Enforcement Mechanism

**Trigger:** `check_product_limit_trigger`  
**Location:** `supabase/migrations/20260102000002_create_products.sql`

**Logic:**
- On `INSERT` to `products` table:
  1. Query `listings.tier` for the associated listing
  2. IF tier='Basic': Allow up to 3 existing products
  3. IF tier='Pro': Allow up to 10 existing products
  4. IF count >= limit: RAISE EXCEPTION

**User statement:** "Basic is free, can list up to 5 products max in marketplace"

**ACTUAL from schema:**
- Basic: 3 products max (trigger enforces this)
- Pro: 10 products max (trigger enforces this)
- User's "5 products" is INCORRECT - database enforces 3 for Basic

---

## 5. Routes (ACTUAL)

### Public Routes (from app/ directory)

| Route | Purpose | Implementation Status |
|-------|---------|----------------------|
| `/` | Home | Implemented |
| `/directory` | Directory browse | Implemented |
| `/u/[slug]` | Listing page | Implemented |
| `/p/[id]` | Product page | Implemented |
| `/marketplace` | Marketplace browse | Implemented |
| `/about` | About page | Implemented |
| `/faq` | FAQ page | Implemented |

### Creator Studio Routes

| Route | Purpose | Implementation Status |
|-------|---------|----------------------|
| `/studio` | Dashboard | Implemented |
| `/studio/products` | Product manager | Implemented |
| `/studio/billing` | Billing/Pro | Implemented |
| `/admin` | Operator dashboard | Implemented |

### Legacy Routes

| Route | Purpose | Notes |
|-------|---------|-------|
| `/listing/[id]` | Legacy permalink | May still exist for backward compatibility |
| `/claim/[id]` | Claim flow | May redirect to `/studio` |

---

## 6. Search Implementation (ACTUAL)

**Status:** RPC Functions Exist

| Function | Purpose | Implementation |
|-----------|---------|---------------|
| `search_listings()` | Full-text search listings | Implemented in migrations |
| `search_products()` | Full-text search products | Implemented in migrations |

**Note:** `SEARCH_CONTRACT.md` states PostgreSQL FTS is used. This is correct.

---

## 7. What is NOT Implemented

### Aspirational SSOT Features

1. **S-Stage Model (S0-S3)**
   - NO database columns exist
   - NO automatic computation logic
   - NO S-stage gating triggers

2. **S-Stage Gating for Featured**
   - NOT implemented in database
   - Both Basic and Pro can purchase (user confirmed)

3. **Mini-site Mode (Pro)**
   - `tier='Pro'` exists in database
   - Actual UI behavior unknown (need to check app code)
   - Pro features like Spotlight, Share Kit may NOT be implemented

4. **AI Automation (Phase 5)**
   - `lib/ai/seo.ts` - NOT FOUND
   - `lib/ai/triage.ts` - NOT FOUND
   - `lib/ai/copilot.ts` - NOT FOUND
   - Only `lib/ai/z-ai-provider.ts` exists

5. **Automatic S-stage Progression**
   - NO trigger computes S-stage from profile completeness
   - Progression is manual (user action required)

---

## 8. Governance Rule

**DO NOT** write specifications for features that are:
1. Described in SSOT but not implemented in code
2. Referenced in `AI_AUTOMATION_MASTER.md` but files don't exist
3. Aspirational design patterns without implementation

**ALWAYS:**
- Document ACTUAL database schema
- Document ACTUAL code behavior
- Mark SSOT features as "NOT IMPLEMENTED" or "FUTURE STATE"
- Before implementing new features: Update SSOT first, then code

---

## 9. Resolution Strategy for Future S-Stage Model

If S-stages are to be implemented:

1. **Add `s_stage` column to `listings` table:**
   ```sql
   ALTER TABLE listings ADD COLUMN s_stage listing_stage DEFAULT 'S0';
   CREATE TYPE listing_stage AS ENUM ('S0', 'S1', 'S2', 'S3');
   ```

2. **Create computation trigger:**
   ```sql
   CREATE OR REPLACE FUNCTION evaluate_s_stage()
   RETURNS listing_stage AS $$
   -- Check S2 criteria and return S0/S1/S2/S3
   $$ LANGUAGE plpgsql;
   ```

3. **Create gating trigger:**
   ```sql
   CREATE TRIGGER check_s_stage_for_featured
   BEFORE INSERT ON featured_queue
   FOR EACH ROW EXECUTE FUNCTION check_s_stage_gating();
   ```

4. **Update dependent docs:**
   - `CREATOR_STUDIO_SPEC.md` - Add S-stage column reference
   - `USER_MODEL_AND_STATE_MACHINE.md` - Update to match implementation
   - `MODEL_MAPPING.md` - Create once columns exist

**UNTIL THEN:** S-stage model remains aspirational only.

---

End of Actual Implementation State
