# SCHEMA_MAP.md
Schema Map — SuburbMates

Status: ACTIVE (SSOT)
Authority Level: High (Binds Code to Data)
Audience: Engineering, Automation

---

## 1. Purpose
This document maps the **Logical Entities** defined in `USER_MODEL_AND_STATE_MACHINE.md` to the **Physical Tables** in the database.
It exists to prevent "Schema Drift" where developers might accidentally use standard Supabase tables (like `profiles`) that are not active in this legacy/custom architecture.

---

## 2. The Identity Map (CRITICAL)

| Logical Entity | Physical Table | Key Columns | Notes |
|---|---|---|---|
| **User** | `public.users_public` | `stripe_subscription_status`, `role` | **DO NOT USE `public.profiles`**. |
| **Auth User** | `auth.users` | `id`, `email` | Managed by Supabase Auth. 1:1 with `users_public`. |

> [!WARNING]
> The table `public.profiles` is a "zombie" artifact from standard templates. It must be ignored or deleted. All user metadata resides in `users_public`.

---

## 3. The Content Map

| Logical Entity | Physical Table | Key Columns | Notes |
|---|---|---|---|
| **Listing** | `public.listings` | `is_verified`, `abn`, `tier`, `featured_until` | **DO NOT USE `content_listings`**. |
| **Creator Product** | `public.products` | `price`, `listing_id` | Digital goods sold by Creators. **STRICTLY NO PLATFORM SERVICES**. |
| **Platform Service** | `public.featured_queue` | `status` | Queue for Featured Placements (NOT in `products`). |
| **Platform Subscription** | `stripe_metadata` (Ref) | N/A | Billing status synced to `users_public`. |

---

## 4. The Taxonomy Map

| Logical Entity | Physical Table | Key Columns | Notes |
|---|---|---|---|
| **Category** | `public.categories` | `name`, `type` | Single source of truth for Directory categories. |
| **Locality** | `public.localities` | `state`, `postcode` | Geographic definitions (Suburbs/Regions). |
| **Platform Catalog** | `public.service_definitions` | `price_aud`, `stripe_price_id` | Pricing / Config for Platform Services (Pro, Featured). |

---

## 5. The Support Map (Implicit)
These tables support relationships but are not primary entities.

| Logical Entity | Physical Table | Key Columns | Notes |
|---|---|---|---|
| **Tag** | `public.tags` | `name` | Shared pool of descriptive tags. |
| **Listing Tag** | `public.listing_tags` | `listing_id`, `tag_id` | Join table: Listing <-> Tags. |
| **Product Tag** | `public.product_tags` | `product_id`, `tag_id` | Join table: Product <-> Tags. |


---

## 6. Data Flow & Truth Mechanics

### 6.1. "The Phone Book Entry" (`public.listings`)
This is the master record for the business. It contains:
*   **The Business**: `name`, `description`, `location`.
*   **Verification Status**: `is_verified` (Boolean) and `abn` (String) are **stored directly on the listing**.
*   **Current Mode**: `tier` (Enum: "Basic" | "Pro"). This tells the frontend whether to show the "Mini-site" or standard page.
*   **Featured Expiry**: `featured_until` (Timestamp). If this date is in the future, the listing is "Featured".

### 6.2. "The Owner's Wallet" (`public.users_public`)
This represents the person managing the listing. It contains:
*   **Billing Status**: `stripe_subscription_status`.
*   *Note: When a user pays for Pro on Stripe, a webhook updates their `users_public` record, which then triggers an update to their listing's `tier` to "Pro".*

### 6.3. "The Queue Ticket" (`public.featured_queue`)
This is the history/log of featured spots.
*   When a user buys a slot, a row is added here (`status: pending`).
*   When the slot activates, this row updates the `listings.featured_until` field.

### 6.4. Logic Summary
| Question | Source of Truth |
| :--- | :--- |
| **Is it verified?** | Check `listings.is_verified`. |
| **Is it Pro?** | Check `listings.tier` (synced with owner's Stripe sub). |
| **Is it Featured?** | Check if `listings.featured_until > now()`. |

---

## 7. Future/Reserved Tables
To ensure consistency, we reserve these names for future features:

| Logical Entity | Reserved Table Name | Notes |
|---|---|---|
| **Reviews** | `public.reviews` | Standard polymorphic or listing-linked reviews. |
| **Collections** | `public.collections` | Curated lists of listings/products. |
| **Orders** | `public.orders` | If we move off pure Stripe-only logging. |

