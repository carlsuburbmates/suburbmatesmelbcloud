# SSOT Freeze Record

This document provides an auditable record of when the SuburbMates Single Source of Truth (SSOT) was frozen, signifying that it is stable and engineering may proceed with implementation.

---

## Freeze Instance: 2026-01-05

*   **Repository:** `https://github.com/carlsuburbmates/suburbmatesmelbcloud.git`
*   **Branch:** `main`
*   **Commit Hash:** `238fca44632611e035cb3d01c51085946f14d2c9`
*   **Freeze Timestamp (UTC):** `2026-01-04T13:28:52+00:00`
*   **Freeze Timestamp (Local):** `2026-01-05T00:28:52+11:00` (Australia/Melbourne)
*   **Scope Frozen:** All files and directories under `docs/SSOT/`.

---

## Governance Rule

**Any change to the frozen scope requires a new reconciliation cycle and a new, subsequent entry in this freeze record.** The previously frozen state becomes invalid upon the commit of any change to the `docs/SSOT/` directory. Engineering MUST halt and reference the newly frozen SSOT once it is declared.
