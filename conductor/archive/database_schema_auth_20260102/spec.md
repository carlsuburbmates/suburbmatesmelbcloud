# Track Specification: Database Schema & Authentication Setup

## 1. Overview
This foundational track establishes the data architecture and security layer for SuburbMates Melbourne. It involves defining the core SQL schema in a remote Supabase instance, implementing low-friction passwordless authentication, and establishing the user role and enforcement state machines required for a fully automated, solo-operator platform.

## 2. Functional Requirements

### 2.1 Supabase Schema & Taxonomy (Truth UI)
*   **Roles:** Enum type for `visitor`, `creator`, `operator`.
*   **Business Categories Table:** Seed with exactly 16 SSOT-defined categories.
*   **Product Categories Table:** Separate seed set for digital assets.
*   **Listings Table:** 
    *   Fields: `name`, `description`, `location` (Council area), `category_id`, `is_verified` (ABN badge).
    *   Monetization: `tier` (Basic, Pro), `featured_until` (timestamp).
    *   States: `status` (unclaimed, claimed).
*   **Featured Placement Queue:** A dedicated table to handle **FIFO logic** per Council area when the 5-slot limit is reached.
*   **Products Table:** Stores digital asset metadata (price, name, etc.). Limited to 3 for Basic, 10 for Pro via RLS/Triggers.

### 2.2 Enforcement State Machine (Solo-Operator Automation)
*   **Enforcement Table/Fields:** To support the AI-automated escalation ladder:
    *   `warning_count`: Integer.
    *   `is_delisted`: Boolean (public visibility hidden, Studio access active).
    *   `is_suspended`: Boolean (Studio access blocked).
    *   `is_evicted`: Boolean (Permanent ban, human-confirmed hook).
    *   `violation_log`: JSONB field for automated AI audit trails.

### 2.3 Authentication Flow
*   **Primary Method:** Magic Link (Passwordless) via email.
*   **User Provisioning:** Auto-create profile on first sign-in (default: `visitor`).

### 2.4 Initial Operator Provisioning
*   **Seed Script:** SQL script to manually provision the initial `operator` user based on a specific email address.

### 2.5 Security & RLS (Middleman Trust)
*   **RLS Policies:**
    *   `public`: Read-only access to `is_delisted = false` listings and their products.
    *   `creator`: CRUD access to their own data; restricted from editing verification or enforcement states.
    *   `operator`: Full read/write access for automated moderation.

## 3. Non-Functional Requirements
*   **Type Safety:** Automatically generate TypeScript types to `types/supabase.ts`.
*   **Performance:** Proper indexing on `location` (Council) and `category_id` for high-speed directory filtering.

## 4. Acceptance Criteria
*   [ ] Database successfully handles the 16 Business Categories.
*   [ ] RLS prevents Basic users from publishing more than 3 products.
*   [ ] Featured placement logic respects the 5-slot-per-council limit.
*   [ ] Enforcement states correctly hide listings from public view.
*   [ ] TypeScript types are generated and reflect the new schema.

## 5. Out of Scope
*   Stripe Checkout integration (logic only, schema is in scope).
*   Frontend UI for the Operator Dashboard.