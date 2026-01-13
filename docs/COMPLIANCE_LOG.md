# Compliance & Architectural Decisions Log

## Purpose
This document serves as a permanent record of critical architectural decisions, schema constraints, and Single Source of Truth (SSOT) enforcements. It explains the "Why" behind the system's structure to prevent future regression or re-introduction of anti-patterns.

---

## 1. Schema Bans (The "Anti-Patterns")

### 🚫 `profiles` Table
*   **Status**: **BANNED**. Do not create.
*   **Reasoning**: The term "profile" is ambiguous. It previously conflated user account data with public business listing data.
*   **Correct Pattern**:
    *   User authentication & billing data &rarr; `users_public`
    *   Business entities & public display &rarr; `listings`
    *   *There is no middle layer.*

### 🚫 `content_listings` Table
*   **Status**: **BANNED**. Do not create.
*   **Reasoning**: This table appeared in legacy schemas as a duplicate of `listings` or a content management layer. It violated the canon that `listings` is the master record for a business.
*   **Correct Pattern**: All business data (name, description, location) lives directly on `public.listings`.

---

## 2. "Church and State" Separation

We enforce a strict separation between **Platform Logic** (The State) and **Creator Products** (The Church).

| Domain | Table | Responsibility |
| :--- | :--- | :--- |
| **State (Platform)** | `users_public` | Manages "Who is this person?". Stores Stripe Customer IDs, Subscription Status (`active`, `past_due`, etc.). **Status is truth.** |
| **Church (Product)** | `listings` | Manages "What is this business?". Stores the **Effect** of the subscription (e.g., `tier: 'Pro'`). |

*   **Data Flow**:
    1.  User pays Stripe &rarr; Webhook fires.
    2.  Webhook updates `users_public.stripe_subscription_status`.
    3.  Database Trigger/Logic propagates this to `listings.tier`.
    *   *The Listing never knows about the Stripe Subscription directly, only its tier.*

---

## 3. Pricing & Service Definitions

Hardcoded prices in code are **BANNED**. All platform service pricing comes from the database.

*   **Source of Truth**: `public.service_definitions` table.
*   **Current Canonical Prices**:
    *   **Pro Tier**: $20.00 AUD (Monthly)
        *   Canonical ID: `price_1SoikRClBfLESB1n5bYWi4AD`
    *   **Featured Placement**: $15.00 AUD (Every 30 Days)
        *   Canonical ID: `price_1SoikSClBfLESB1nEj4aBQKu`
*   **Implementation**: Application triggers (Node/Supabase) must query `service_definitions` to get the correct `stripe_price_id` for checkout sessions.

---

## 4. Localities & Location Logic

Location data is complex (suburbs crossing council boundaries). We have simplified this for the application layer.

*   **Source of Truth**: `public.localities` table.
*   **Seed Source**: `docs/SSOT/Melbourne Councils Suburbs Council Reference.md`
*   **UX Logic**:
    *   Frontend queries `localities` to autocomplete Suburbs.
    *   The table provides the authoritative `council_name`, `region`, and `character` for that suburb.
    *   **Deduplication**: While some suburbs physically span two councils (e.g., Richmond), the application enforces a **Single Primary Council** per suburb in the `localities` table to prevent duplicate search results.
    *   **UX Label**: Use the `ux_label` column for user-friendly display (e.g., "Melbourne CBD & Inner City" instead of just "Inner City").

---

## 5. Governance & Audit Trail

Adherence to **Antigravity Rule 5** is mandatory for this workspace.

*   **Audit Trail**: All actions, plans, and verifications must be logged to Artifacts in the `brain/` directory.
*   **Cleanup Policy**: The `brain/` directory serves as active working memory. It may be cleared (or pruned to recent history) **ONLY** after specific milestones are reached and the system state is strictly verified against the SSOT.
*   **Fail-Safe**: If a task cannot be verified with low risk, it must be escalated to the user.
