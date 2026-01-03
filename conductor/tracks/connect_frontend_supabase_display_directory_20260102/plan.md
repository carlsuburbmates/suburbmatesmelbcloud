# Implementation Plan: Connect Frontend to Supabase & Display Directory Data

## Phase 1: Data Fetching Logic

- [x] **Task:** Create the `lib/listings.ts` module. (47119ec)
- [x] **Task:** Implement a function within `lib/listings.ts` to fetch all creator listings from the Supabase `listings` table. (0fd4065)
- [x] **Task:** Write unit tests for the data fetching function to ensure it correctly queries the database and returns the expected data. (0fd4065)

## Phase 2: Frontend Integration

- [x] **Task:** Update the main directory page (`app/(home)/page.tsx`) to use the new data fetching function from `lib/listings.ts`. (9d26948)
- [x] **Task:** Implement Incremental Static Regeneration (ISR) on the directory page with a 5-minute revalidation interval. (042883a)
- [ ] **Task:** Pass the fetched listings data as props to the `Directory.tsx` component.
- [ ] **Task:** Write a unit test for the directory page to verify that it correctly fetches and passes the data.

## Phase 3: UI Implementation

- [ ] **Task:** Update the `Directory.tsx` component to dynamically render a list of `ListingCard` components based on the received data.
- [ ] **Task:** Update the `ListingCard` component to display the creator's name, category, location, and any applicable status indicators ("Featured", "Verified").
- [ ] **Task:** Write unit tests for the `Directory.tsx` and `ListingCard` components to ensure they render the data correctly.
- [ ] **Task:** Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md)
