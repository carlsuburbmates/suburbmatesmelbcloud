# Audit Report: Docs vs Codebase
**Date:** 2026-01-11
**Auditor:** Project Audit Specialist

## EXECUTIVE SUMMARY
* **Total Gaps:** 4
* **Severity Score:** Medium
* **Coverage Assessment:** The core architectural pillars (Listing, Creator, Studio) are well-implemented and aligned with the SSOT. However, there is a persistent leak of the forbidden term "Profile" into both the public UI and the internal developer dialect, creating a risk of concept drift.

## 1. PHASE 1: INDEXING (TERRITORY MAP)
*Inventory of scanned assets.*

### A. Documentation (The Map)
*   `docs/SSOT/CANONICAL_TERMINOLOGY.md`
*   `docs/SSOT/CREATOR_STUDIO_SPEC.md`
*   `docs/SSOT/MINI_SITE_ENGINE_SPEC.md`
*   `docs/SSOT/OPERATOR_AND_ADMIN_AUTOMATION.md`
*   `docs/SSOT/PRODUCT_CONSTITUTION.md`
*   `docs/SSOT/PUBLIC_UX_CONTRACT.md`
*   `docs/SSOT/SEARCH_CONTRACT.md`
*   `docs/SSOT/EMAIL_TEMPLATES.md`
*   `docs/SSOT/USER_MODEL_AND_STATE_MACHINE.md`
*   `monetisation.md`

### B. Codebase (The Territory)
*   `app/` (Next.js App Router)
    *   `app/studio/` (Private Creator Logic)
    *   `app/admin/` (Operator Logic)
    *   `app/listing/` (Routing utility)
    *   `app/claim/` (Claim flow)
    *   `app/api/` (Webhooks & Cron)
*   `components/` (UI Library)
*   `types/supabase.ts` (Database Schema)

## 2. PHASE 2: COMPARISON (DETAILED DIFF REPORT)

| File/Module | Issue Type | Severity | Description of Discrepancy |
| :--- | :--- | :--- | :--- |
| `app/studio/page.tsx` | **Forbidden Term** | **Critical** | UI text explicit uses "Edit Business Profile" and "Your business profile is now live". `CANONICAL_TERMINOLOGY.md` strictly forbids "business profile". |
| `app/studio/onboarding/[id]/page.tsx` | **Forbidden Term** | **Critical** | UI text uses "business profile" in user-facing instructions. |
| `app/pricing/page.tsx` | **Forbidden Term** | **High** | UI text advertise "Basic Listing Profile". This is a non-canonical hybrid term. Should be "Studio Page" or "Basic Listing". |
| `docs/SSOT/SITE_MAP.md` (Derived) | **Missing Scope** | **High** | The initial Site Map failed to document the ABN Verification surface (`ClaimModal` in `components/listing/ClaimModal.tsx` and `OnboardingForm`), creating a "Ghost" feature (Code exists, mapped docs did not). |
| `app/admin/layout.tsx` (and others) | **Mental Model Drift** | Medium | Internal variable names (`const { data: profile } = ...`) refer to the `users_public` table. While not a functional bug, this violates the domain language and perpetuates the forbidden "profile" concept in the developer contract. |
| `types/supabase.ts` | **Drift** | Low | The `product_tags` table exists in types but is not explicitly detailed in `CREATOR_STUDIO_SPEC.md` (implied feature). |

## AUDIT NOTES
*   **Strong Adherence to "Sold By":** The `ProductCard` component correctly implements the "Sold by [Listing Name]" rule, linking to the correct Studio Page URL. This is a major SSOT win.
*   **Database Schema Evolution:** The codebase has successfully migrated from `profiles` to `users_public` (internally), effectively decoupling the "User" from the "Public Profile". However, the legacy variable naming (`profile`) masks this architectural improvement.
*   **Studio Dashboard:** The Studio Dashboard (`app/studio/page.tsx`) correctly checks for `listing.status` and `listing.tier` (Basic/Pro), implementing the state machine rules defined in `USER_MODEL_AND_STATE_MACHINE.md`.

## RECOMMENDED ACTIONS
1.  **Immediate UI Patch:** Grep and replace all instances of "Business Profile" in `app/` with "Listing" or "Studio Page" to comply with `CANONICAL_TERMINOLOGY.md`.
2.  **Refactor Variables:** Gradually rename `const profile` to `const userRecord` or `const publicUser` in `app/actions` and `app/admin` to break the mental association.
