# SCHEMA_MAP.md

**Schema Map — SuburbMates**

**Status:** ACTIVE (SSOT)  
**Authority Level:** High (Binds Code to Data)  
**Audience:** Engineering, Automation, AI Agents  
**Last Updated:** January 2026

---

## 1. Purpose

This document maps the **Logical Entities** defined in `USER_MODEL_AND_STATE_MACHINE.md` to the **Physical Tables** in the PostgreSQL database.

It exists to:
- Prevent "Schema Drift" where developers might accidentally use standard Supabase tables (like `profiles`) that are not active in this architecture
- Provide clear mapping between conceptual models and database implementation
- Document the "source of truth" for each piece of data

---

## 2. The Identity Map (CRITICAL)

| Logical Entity | Physical Table | Key Columns | Notes |
|----------------|----------------|-------------|-------|
| **User** | `public.users_public` | `id`, `role`, `email`, `stripe_customer_id`, `stripe_subscription_status`, `stripe_account_id` | **DO NOT USE `public.profiles`**. This is the authoritative user table. |
| **Auth User** | `auth.users` | `id`, `email`, `created_at` | Managed by Supabase Auth. 1:1 relationship with `users_public`. |

### Warning: Zombie Tables

> [!CAUTION]
> The table `public.profiles` is a **"zombie" artifact** from standard Supabase templates.  
> It **must be ignored or deleted**. All user metadata resides in `users_public`.

### Schema

```sql
CREATE TABLE public.users_public (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role DEFAULT 'visitor' NOT NULL,
    email text,
    full_name text,
    avatar_url text,
    warning_count integer DEFAULT 0 NOT NULL,
    is_delisted boolean DEFAULT false NOT NULL,
    is_suspended boolean DEFAULT false NOT NULL,
    suspended_until timestamp with time zone,
    is_evicted boolean DEFAULT false NOT NULL,
    evicted_at timestamp with time zone,
    violation_log jsonb DEFAULT '[]'::jsonb NOT NULL,
    -- Stripe / Monetisation Fields
    stripe_account_id text,              -- Stripe Connect Account ID (for Creators)
    stripe_customer_id text,             -- Stripe Customer ID (for subscriptions)
    stripe_subscription_status text,     -- 'active', 'canceled', 'past_due', etc.
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Key Fields Explained

- `role`: Enum ('visitor', 'creator', 'operator')
- `stripe_account_id`: For Stripe Connect (marketplace payouts)
- `stripe_customer_id`: For subscriptions (Pro tier)
- `stripe_subscription_status`: Synced from Stripe webhooks
- `violation_log`: JSON array of enforcement actions

---

## 3. The Content Map

| Logical Entity | Physical Table | Key Columns | Notes |
|----------------|----------------|-------------|-------|
| **Listing** | `public.listings` | `id`, `owner_id`, `status`, `tier`, `category_id`, `location`, `is_verified`, `featured_until`, `triage_status`, `slug` | Business directory entries. **DO NOT USE `content_listings`**. |
| **Creator Product** | `public.products` | `id`, `listing_id`, `category_id`, `price`, `name`, `description`, `image_url` | Digital goods sold by Creators. **STRICTLY NO PLATFORM SERVICES**. |
| **Platform Service** | `public.featured_queue` | `id`, `listing_id`, `location`, `status`, `started_at`, `ends_at` | Queue for Featured Placements (NOT in `products`). |
| **Platform Subscription** | `stripe_metadata` (External) | N/A | Billing status synced to `users_public.stripe_subscription_status`. |

### Listings Schema

```sql
CREATE TABLE public.listings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    description text,
    location text NOT NULL,  -- Council area (LGA)
    category_id uuid NOT NULL REFERENCES public.categories(id),
    slug text UNIQUE,
    is_verified boolean DEFAULT false NOT NULL,
    tier public.listing_tier DEFAULT 'Basic' NOT NULL,
    featured_until timestamp with time zone,
    status public.listing_status DEFAULT 'unclaimed' NOT NULL,
    triage_status public.triage_status DEFAULT 'pending' NOT NULL,
    triage_reason text,
    abn text,  -- 11-digit ABN for verification
    phone text,
    contact_email text,
    website text,
    search_vector tsvector,  -- Full-text search (generated)
    category_confirmed_at timestamp with time zone,
    policy_accepted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Products Schema

```sql
CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id uuid REFERENCES public.listings(id),
    category_id uuid NOT NULL REFERENCES public.categories(id),
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    image_url text,
    search_vector tsvector,  -- Full-text search (generated)
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Featured Queue Schema

```sql
CREATE TABLE public.featured_queue (
    id serial PRIMARY KEY,
    listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    location text NOT NULL,  -- Council area (LGA)
    status public.featured_status DEFAULT 'pending' NOT NULL,
    requested_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    started_at timestamp with time zone,
    ends_at timestamp with time zone
);
```

---

## 4. The Taxonomy Map

| Logical Entity | Physical Table | Key Columns | Notes |
|----------------|----------------|-------------|-------|
| **Category** | `public.categories` | `id`, `name`, `type` | Single source of truth for both Directory (business) and Marketplace (product) categories. **CRITICAL**: `type` field ('business' \| 'product') enforces separation. |
| **Tag** | `public.tags` | `id`, `name`, `slug` | Flexible keywords for search enhancement. |
| **Listing Tag** | `public.listing_tags` | `listing_id`, `tag_id` | Many-to-many join (max 3 tags per listing). |
| **Product Tag** | `public.product_tags` | `product_id`, `tag_id` | Many-to-many join (max 3 tags per product). |

### Categories Schema

```sql
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('business', 'product')),
    CONSTRAINT categories_type_name_key UNIQUE (type, name)
);
```

**Business Categories (16):**
Brand Identity, Web Design, UI/UX Design, Illustration, Photography, Videography, Audio Production, Animation, Social Media Management, Copywriting, Content Marketing, SEO & Strategy, Web Development, No-Code Automation, App Development, Business Consulting

**Product Categories (6):**
Templates & Systems, Design & Creative Assets, Media Assets, Education & Guides, Software & Tools, Other Digital Products

### Tags Schema

```sql
CREATE TABLE public.tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE
);

CREATE TABLE public.listing_tags (
    listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, tag_id)
);

CREATE TABLE public.product_tags (
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);
```

---

## 5. The Commerce Map

| Logical Entity | Physical Table | Key Columns | Notes |
|----------------|----------------|-------------|-------|
| **Order** | `public.orders` | `id`, `customer_id`, `seller_id`, `status`, `total_cents`, `platform_fee_cents`, `seller_earnings_cents`, `seller_stripe_account_id` | Marketplace order records. |
| **Order Item** | `public.order_items` | `id`, `order_id`, `product_id`, `quantity`, `price_cents` | Line items for orders. |
| **Cart Item** | `public.cart_items` | `id`, `user_id`, `product_id`, `quantity` | Shopping cart (session-based or persisted). |

### Orders Schema

```sql
CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES auth.users(id),
    seller_id uuid NOT NULL REFERENCES auth.users(id),
    status text DEFAULT 'pending' NOT NULL,  -- 'pending', 'paid', 'completed', 'refunded'
    total_cents integer NOT NULL,
    platform_fee_cents integer NOT NULL,
    seller_earnings_cents integer NOT NULL,
    seller_stripe_account_id text NOT NULL,  -- Destination Connect account
    stripe_checkout_session_id text,
    stripe_payment_intent_id text,
    stripe_application_fee_id text,
    payout_status text DEFAULT 'pending',  -- 'pending', 'routed', 'completed'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id),
    quantity integer NOT NULL DEFAULT 1,
    price_cents integer NOT NULL,  -- Price at time of purchase
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## 6. The Support Map (Implicit)

| Logical Entity | Physical Table | Key Columns | Notes |
|----------------|----------------|-------------|-------|
| **Audit Log** | `public.audit_logs` | `id`, `event_type`, `entity_type`, `entity_id`, `actor_id`, `details`, `idempotency_key` | Immutable log of all admin actions and system events. |
| **Report** | `public.reports` | `id`, `reporter_id`, `entity_type`, `entity_id`, `reason`, `status` | User-submitted reports for moderation. |

### Audit Logs Schema

```sql
CREATE TABLE public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL,  -- 'order_paid', 'payout_routed', 'listing_approved', etc.
    entity_type text NOT NULL,  -- 'orders', 'listings', 'users', etc.
    entity_id uuid NOT NULL,
    actor_id text NOT NULL,  -- User ID or 'system'
    actor_type text NOT NULL,  -- 'customer', 'seller', 'operator', 'system'
    details jsonb,
    idempotency_key text UNIQUE,  -- Prevents duplicate logs
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## 7. Data Flow & Truth Mechanics

### 7.1. "The Phone Book Entry" (`public.listings`)

This is the **master record** for the business. It contains:
- **The Business**: `name`, `description`, `location`
- **Verification Status**: `is_verified` (Boolean) and `abn` (String) are **stored directly on the listing**
- **Current Mode**: `tier` (Enum: "Basic" | "Pro"). This tells the frontend whether to show the "Mini-site" or standard page
- **Featured Expiry**: `featured_until` (Timestamp). If this date is in the future, the listing is "Featured"
- **Triage Status**: `triage_status` ('pending' | 'safe' | 'flagged')

### 7.2. "The Owner's Wallet" (`public.users_public`)

This represents the **person managing the listing**. It contains:
- **Billing Status**: `stripe_subscription_status`
- **Connect Account**: `stripe_account_id` (for marketplace payouts)
- **Customer ID**: `stripe_customer_id` (for subscriptions)

**Sync Logic:**
- When a user pays for Pro on Stripe, a webhook updates their `users_public.stripe_subscription_status`
- This triggers an update to their listing's `tier` field → 'Pro'

### 7.3. "The Queue Ticket" (`public.featured_queue`)

This is the **history/log** of featured spots.
- When a user buys a slot, a row is added here (`status: pending`)
- When the slot activates, this row's `status` → 'active' and updates `listings.featured_until`
- Cron job rotates queue nightly: Expires old → Activates queued

### 7.4. Logic Summary

| Question | Source of Truth |
|----------|-----------------|
| **Is it verified?** | Check `listings.is_verified` |
| **Is it Pro?** | Check `listings.tier` (synced with owner's Stripe sub) |
| **Is it Featured?** | Check if `listings.featured_until > now()` |
| **What stage is the Creator?** | Calculate using `lib/studio-logic.ts` based on listing data |

---

## 8. Database Enums

```sql
CREATE TYPE public.app_role AS ENUM ('visitor', 'creator', 'operator');

CREATE TYPE public.listing_status AS ENUM ('unclaimed', 'claimed');

CREATE TYPE public.listing_tier AS ENUM ('Basic', 'Pro');

CREATE TYPE public.featured_status AS ENUM ('pending', 'active', 'expired', 'rejected');

CREATE TYPE public.triage_status AS ENUM ('pending', 'safe', 'flagged');
```

---

## 9. Database Triggers (Auto-Enforcement)

### Product Limit Enforcement

```sql
-- Trigger: check_product_limit_trigger
-- Prevents Basic users from exceeding 3 products, Pro users from exceeding 10
```

### Category Type Enforcement

```sql
-- Trigger: listings_check_category_type
-- Ensures listings can only use 'business' categories

-- Trigger: products_check_category_type
-- Ensures products can only use 'product' categories
```

### Tag Limit Enforcement

```sql
-- Trigger: listing_tags_check_limit
-- Max 3 tags per listing

-- Trigger: product_tags_check_limit
-- Max 3 tags per product
```

---

## 10. RPC Functions

### Search Functions

```sql
-- search_listings(search_query, category_filter, limit_val, offset_val)
-- Returns listings ranked by: Featured > Pro > Basic > Unclaimed
-- Within each bucket: Verified > Non-verified
-- Uses PostgreSQL FTS on search_vector column

-- search_products(search_query, category_filter, min_price, max_price, limit_val, offset_val)
-- Returns products with listing metadata (seller name, verification status)
```

### Featured Queue Functions

```sql
-- check_featured_availability(council_text)
-- Returns: { total_count, pending_count, next_available_date }

-- activate_queued_item(queue_record_id)
-- Promotes pending → active, syncs to listings.featured_until

-- expire_finished_slots()
-- Called by cron job, expires old slots
```

### Utility Functions

```sql
-- get_my_role()
-- Returns current user's role (visitor | creator | operator)

-- upsert_tag(tag_name)
-- Creates tag if doesn't exist, returns tag_id
```

---

## 11. Row Level Security (RLS)

**Enabled on ALL tables.**

### Public Read, Owner Write Pattern

**Listings:**
```sql
-- Public can SELECT all listings
-- Only owner_id can INSERT/UPDATE/DELETE their own listings
```

**Products:**
```sql
-- Public can SELECT all products
-- Only listing owner can manage products
```

**Users:**
```sql
-- Public can SELECT basic user info (id, name, avatar)
-- User can UPDATE only their own record
```

**Admin-Only Tables:**
```sql
-- audit_logs, reports: Service role only
-- No public access
```

---

## 12. Future/Reserved Tables

To ensure consistency, we **reserve** these names for future features:

| Logical Entity | Reserved Table Name | Notes |
|----------------|---------------------|-------|
| **Reviews** | `public.reviews` | Standard polymorphic or listing-linked reviews |
| **Collections** | `public.collections` | Curated lists of listings/products |
| **Notifications** | `public.notifications` | In-app notification system |
| **Messages** | `public.messages` | Creator-Customer messaging |

---

## 13. Index Strategy

### Performance Indexes

```sql
-- Listings
CREATE INDEX listings_owner_id_idx ON listings(owner_id);
CREATE INDEX listings_category_id_idx ON listings(category_id);
CREATE INDEX listings_location_idx ON listings(location);
CREATE INDEX listings_status_tier_idx ON listings(status, tier);
CREATE INDEX listings_search_vector_idx ON listings USING gin(search_vector);

-- Products
CREATE INDEX products_listing_id_idx ON products(listing_id);
CREATE INDEX products_category_id_idx ON products(category_id);
CREATE INDEX products_search_vector_idx ON products USING gin(search_vector);

-- Featured Queue
CREATE INDEX featured_queue_location_status_idx ON featured_queue(location, status);
CREATE INDEX featured_queue_listing_id_idx ON featured_queue(listing_id);

-- Orders
CREATE INDEX orders_customer_id_idx ON orders(customer_id);
CREATE INDEX orders_seller_id_idx ON orders(seller_id);
CREATE INDEX orders_status_idx ON orders(status);
```

---

## 14. TypeScript Types

**Generated types**: `types/supabase.ts`

**Regenerate after schema changes:**
```bash
# Using Supabase CLI
supabase gen types typescript --local > types/supabase.ts

# Or from remote (production)
supabase gen types typescript --linked > types/supabase.ts
```

**Usage:**
```typescript
import { Database } from '@/types/supabase';

type Listing = Database['public']['Tables']['listings']['Row'];
type ListingInsert = Database['public']['Tables']['listings']['Insert'];
type ListingUpdate = Database['public']['Tables']['listings']['Update'];
```

---

## 15. Migration Strategy

**CRITICAL**: All schema changes MUST go through migration files.

**Workflow:**
```bash
# 1. Create migration
supabase migration new add_new_feature

# 2. Edit generated SQL file
# supabase/migrations/YYYYMMDDHHMMSS_add_new_feature.sql

# 3. Test locally
supabase db reset

# 4. Apply to production (with approval)
supabase db push --linked

# 5. Regenerate types
supabase gen types typescript --linked > types/supabase.ts
```

See `AGENTS.md` for complete migration rules.

---

## Summary

This schema map provides a **single source of truth** for the database structure. Key principles:

1. **No `profiles` table** - Use `users_public`
2. **Strict taxonomy separation** - Business vs Product categories enforced by triggers
3. **Single source of truth** - Each logical entity maps to ONE physical table
4. **Automated enforcement** - Triggers, RLS, and enums enforce constraints
5. **Migration-first** - All changes go through migration files

**For implementation details, always defer to this document and the actual database schema.**

---

**Last Updated:** January 2026  
**Maintained By:** Platform team  
**Regenerate Types After Changes:** `supabase gen types typescript --linked > types/supabase.ts`
