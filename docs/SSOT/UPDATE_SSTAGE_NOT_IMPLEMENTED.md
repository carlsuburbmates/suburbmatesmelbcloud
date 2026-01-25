# Update: S-Stage Model Marked as NOT IMPLEMENTED

**Status:** READY FOR REVIEW  
**Date:** 2026-01-22  
**Purpose:** Updates to `CREATOR_STUDIO_SPEC.md` and `USER_MODEL_AND_STATE_MACHINE.md` to reflect that S-stage model is NOT IMPLEMENTED

---

## Updates to CREATOR_STUDIO_SPEC.md

### Section 3A. Studio Lifecycle and Progression

**Line 73:** Change S2 section title
**FROM:**
```
*   **S2: Optimised** <!-- Resolves Blocker #4 -->
```

**TO:**
```
*   **S2: Optimised** <!-- Resolves Blocker #4 --> [NOT IMPLEMENTED]
```

**Line 75-83:** Add ACTUAL STATUS note at end of S2 section
**ADD after line 83:**
```
*   **ACTUAL STATUS:** This concept is NOT IMPLEMENTED. No `s_stage` column exists in database. See `ACTUAL_IMPLEMENTATION_STATE.md`.
```

### Section 3A. Gating Rules

**Line 91:** Remove S-stage gating from Featured Placement rule
**FROM:**
```
*   **Featured Placement:** A Creator MUST NOT be able to purchase or activate a Featured Placement unless their Studio is in stage `S2: Optimised` or higher.
```

**TO:**
```
*   **Featured Placement:** A Creator MUST NOT be able to purchase or activate a Featured Placement unless their Studio is in stage `S2: Optimised` or higher. [S-STAGE GATING NOT IMPLEMENTED]
```

**Rationale:** Current implementation uses capacity-based gating (max 5 slots per council), not S-stage gating. S-stage model is NOT IMPLEMENTED.

---

## Updates to USER_MODEL_AND_STATE_MACHINE.md

### Section 4.6: Listing Claim Workflow

**Line 413-426:** Add S2 gating clarification
**ADD after line 426:**
```
**NOTE:** S-stage gating is NOT IMPLEMENTED. Featured placement is capacity-based (max 5 slots per council). Both Basic and Pro tier users can purchase Featured slots (user confirmed).
```

### Section 4.7: Creator Studio Lifecycle (S-Stages)

**Lines 289-353:** Add S-stage NOT IMPLEMENTED warning
**ADD after line 353:**
```
**CRITICAL WARNING:** S-stage model (S0-S3) is NOT IMPLEMENTED in current codebase. Database uses `tier` (Basic/Pro) and `status` (unclaimed/claimed) only. No `s_stage` column or automatic S-stage computation logic exists. See `ACTUAL_IMPLEMENTATION_STATE.md` for full details.
```

---

## Updates to PRODUCT_CONSTITUTION.md

### Section 6.2: Pro (Paid)

**Line 72-80:** Remove S-stage references
**CHANGE:**
```diff
- Pro unlocks:
- Mini-site mode (same URL)
- Share Kit
- Spotlight
- Advanced ordering and pinning
- Theme "Vibe" tuning
```

**TO:**
```diff
+ Pro unlocks:
+ Mini-site mode (same URL)
+ Share Kit
+ Spotlight
+ Advanced ordering and pinning
+ Theme "Vibe" tuning
+
+ [S-STAGE FEATURES NOT INCLUDED]: S-stage model is NOT IMPLEMENTED. Mini-site mode is controlled by `tier='Pro'` in database, not by S-stage progression.
```

**Rationale:** Remove implicit S-stage references that don't match actual implementation.

---

## Updates to AUTOMATION_ARCHITECTURE.md

### Section 3: Scheduled Automations (Cron Jobs)

**Line 272-279:** Clarify S-stage role in cron jobs
**ADD after line 279:**
```
**NOTE:** S-stage model is NOT IMPLEMENTED. Cron jobs operate on tier (Basic/Pro) and capacity (Featured slots) only.
```

---

## Summary of Changes

| Document | Section | Change | Impact |
|----------|---------|--------|---------|
| CREATOR_STUDIO_SPEC.md | 3A (S2) | Mark as NOT IMPLEMENTED | HIGH |
| CREATOR_STUDIO_SPEC.md | 3A (Featured) | Remove S-stage gating | HIGH |
| USER_MODEL_AND_STATE_MACHINE.md | 4.6 | Add S-stage warning | CRITICAL |
| USER_MODEL_AND_STATE_MACHINE.md | 4.7 | Add S-stage warning | CRITICAL |
| PRODUCT_CONSTITUTION.md | 6.2 | Remove S-stage references | MEDIUM |
| AUTOMATION_ARCHITECTURE.md | 3 | Clarify S-stage role | MEDIUM |

---

## Application Instructions

### To Apply These Updates:

1. Review `UPDATE_SSTAGE_NOT_IMPLEMENTED.md` for correctness
2. Apply changes to each document manually OR
3. Update cross-references in all affected documents
4. Update `CONFLICTS_AMBIGUITIES.md` to reflect that conflicts are resolved
5. Commit changes to git

### Files Changed:

1. `docs/SSOT/CREATOR_STUDIO_SPEC.md` - 3 updates
2. `docs/SSOT/USER_MODEL_AND_STATE_MACHINE.md` - 2 updates
3. `docs/SSOT/PRODUCT_CONSTITUTION.md` - 1 update
4. `docs/SSOT/AUTOMATION_ARCHITECTURE.md` - 1 update
5. `docs/SSOT/CONFLICTS_AMBIGUITIES.md` - Add resolution note

---

End of Update Document
