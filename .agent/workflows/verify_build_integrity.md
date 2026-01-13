---
description: Verify the build integrity against the SSOT Unification Protocol.
---

# verify_build_integrity

> [!IMPORTANT]
> This workflow ensures that the codebase (the "Territory") accurately reflects the SSOT (the "Map") as defined in `docs/SSOT/00_UNIFICATION_PROTOCOL.md`.

## 1. Compliance Check (The Binding Map)
Verify that the Unification Protocol is the active law.
1.  Read `docs/SSOT/00_UNIFICATION_PROTOCOL.md`.
2.  Confirm the "Binding Map" covers all critical surfaces (Schema, Auth, Creator Studio, Public UX).
3.  If any new feature has been added, ensure it is audited against its governing SSOT.

## 2. Automated Truth Audit
Run the automated audit tools to detect strict deviations.
1.  **Terminology Scan:**
    ```bash
    npx playwright test ssot_audit
    ```
    *Must pass with 0 deviations.*

2.  **Schema & Logic (Type Check):**
    ```bash
    npx tsc --noEmit
    ```
    *Ensure Typescript interfaces mirror the `platform-logic.md`.*

## 3. Functional Verification (The Loop)
Verify the core value delivery loops are unbroken.
1.  **Revenue Loop:** Run `tests/e2e/studio_lifecycle.spec.ts` (Claim -> Onboard -> Upgrade).
2.  **Contact Loop:** Run `tests/e2e/contact_loop.spec.ts` (Customer -> Business).

## 4. Visual Certification
Manual verification of the "Premium Minimalism" aesthetic.
1.  **Grid Geometry:**
    - Visit `/directory`.
    - Verify "Featured" cards span 2 columns.
    - Verify no whitespace gaps exist in the grid.
2.  **Typography**:
    - Confirm `Cormorant Garamond` is used for Headers.
    - Confirm `Inter Tight` is used for Body.

## 5. Operational Readiness
1.  **Cron Jobs:**
    - Verify `cron-featured-queue` is deployed.
    - Check Supabase Logs for `process_daily_queue` execution.
