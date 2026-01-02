# Track Plan: Database Schema & Authentication Setup

## Track Description
Establish core SQL schema, passwordless authentication, and automated enforcement states in a remote Supabase instance.

---

## Phase 1: Database Schema & Taxonomies [checkpoint: 5558051]

### Objective
Define the foundational SQL structures and seed the canonical taxonomies.

*   [x] Task: Create SQL migration for enums and categories (Business & Product). [7a6a168]
*   [x] Task: Create SQL migration for the `Listings` table with monetization and status fields. [799bf06]
*   [x] Task: Create SQL migration for the `Products` table with tier-based constraint triggers. [571f75d]
*   [x] Task: Create SQL migration for the `Featured Placement Queue` (FIFO logic). [5031f39]
*   [x] Task: Create SQL migration for `Profiles` including the 4-step enforcement ladder. [083051f]
*   [x] Task: Conductor - User Manual Verification 'Database Schema & Taxonomies' (Protocol in workflow.md) [5558051]

## Phase 2: Authentication & User Provisioning [checkpoint: 8ece04c]

### Objective
Implement Magic Link auth and automatic profile creation.

*   [x] Task: Configure Supabase Client utility in `lib/supabase.ts`. [dee78a2]
*   [x] Task: Write tests for user profile auto-creation trigger. [6c13916]
*   [x] Task: Implement database trigger for profile creation on Auth Sign-up. [bf200d6]
*   [x] Task: Write tests for Magic Link sign-in logic. [8fc52e7]
*   [x] Task: Implement Magic Link sign-in flow on the frontend (Auth components). [19d867b]
*   [x] Task: Conductor - User Manual Verification 'Authentication & User Provisioning' (Protocol in workflow.md) [8ece04c]

## Phase 3: RLS Policies & Security

### Objective
Enforce the "Middleman Truth" and data ownership via Row Level Security.

*   [x] Task: Write tests to verify public vs. creator vs. operator access levels. [b72cb56]
*   [x] Task: Implement RLS policies for Listings (hiding delisted/suspended items). [840c2e7]
*   [x] Task: Implement RLS policies for Products (enforcing tier limits). [ca510d6]
*   [x] Task: Create seed script for the initial `operator` user. [e209cf2]
*   [ ] Task: Conductor - User Manual Verification 'RLS Policies & Security' (Protocol in workflow.md)

## Phase 4: Type Generation & Final Integration

### Objective
Ensure end-to-end type safety and project-wide integration.

*   [ ] Task: Generate TypeScript types from remote Supabase schema into `types/supabase.ts`.
*   [ ] Task: Update existing components to use generated types.
*   [ ] Task: Perform final audit of enforcement state hooks for future automation.
*   [ ] Task: Conductor - User Manual Verification 'Type Generation & Final Integration' (Protocol in workflow.md)