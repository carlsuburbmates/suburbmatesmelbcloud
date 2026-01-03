# Track Specification: Connect Frontend to Supabase & Display Directory Data

## 1. Overview
This track will connect the Next.js frontend to the Supabase backend to fetch and display the directory of creator listings. This will make the application dynamic and bring the core directory feature to life.

## 2. Functional Requirements

### 2.1 Data Fetching Strategy
*   **Method:** Incremental Static Regeneration (ISR) will be used to fetch the directory data.
*   **Rationale:** This approach provides the performance and SEO benefits of a static site, while ensuring the data remains reasonably fresh. The page will be regenerated at a set interval (e.g., every 5 minutes).

### 2.2 Data Fetching Logic
*   A new module, `lib/listings.ts`, will be created to house all data-fetching logic related to the creator listings.
*   This module will use the Supabase client from `lib/supabase.ts` to query the `listings` table.

### 2.3 Directory Page (`app/(home)/page.tsx`)
*   The main directory page will be updated to fetch and display the creator listings.
*   The page will call the data-fetching functions from `lib/listings.ts` to get the directory data.

### 2.4 Listing Cards (`components/home/Directory.tsx`)
*   The `Directory.tsx` component will be updated to receive the listing data as props.
*   Each listing card will display the following information, as per `docs/SSOT/PUBLIC_UX_CONTRACT.md`:
    *   Listing name
    *   Category
    *   Location cue
    *   Status indicators (e.g., "Featured", "Verified"), if applicable.

## 3. Non-Functional Requirements
*   **Performance:** The directory page should load quickly, leveraging the benefits of ISR.
*   **Code Quality:** The new code should adhere to the existing coding standards, including the use of TypeScript and the established project structure.

## 4. Acceptance Criteria
*   [ ] The main directory page successfully fetches and displays a list of creators from the Supabase database.
*   [ ] The data on the directory page is automatically regenerated at a reasonable interval.
*   [ ] Each listing card displays the required information.
*   [ ] The data fetching logic is encapsulated within the `lib/listings.ts` module.
*   [ ] All new code is typed and passes linting checks.

## 5. Out of Scope
*   Implementation of search and filtering functionality.
*   User authentication and creator-specific views.
*   Monetization features.
