# Documentation Conflicts & Ambiguities

**Status:** CRITICAL REVIEW  
**Date:** 2026-01-21  
**Scope:** All SSOT documents reviewed for inconsistencies, contradictions, and gaps

---

## Critical Finding: SYSTEMIC AMBIGUITY BETWEEN S-STAGES AND TIERS

### Conflict #1: S-Stages vs Tiers (MAJOR)

**Documents in conflict:**
- `CREATOR_STUDIO_SPEC.md` (S-stages: S0, S1, S2, S3)
- `USER_MODEL_AND_STATE_MACHINE.md` (S-stages: S0, S1, S2, S3)
- `PRODUCT_CONSTITUTION.md` (Tiers: Basic, Pro - different model)
- `CANONICAL_TERMINOLOGY.md` (No S-stage definition, only "Basic" and "Pro" badges)
- `PUBLIC_UX_CONTRACT.md` (Tier ordering logic)

**The ambiguity:**

**Model A (CREATOR_STUDIO_SPEC.md & USER_MODEL):**
```
S0: Incomplete (no public page)
S1: Live (Basic) - public page active
S2: Optimised - unlocks Featured purchase
S3: Pro-enabled - unlocks Mini-site mode
```

**Model B (PRODUCT_CONSTITUTION.md):**
```
Basic (Free): Has Studio page, can list products
Pro (Paid): Unlocks Mini-site mode, Share Kit, Spotlight
```

**The problem:**
- Are "S3: Pro-enabled" and "Pro" the same thing?
- If S3 = Pro, then what is "S2" in tier model?
- Is there a state where someone is "Pro tier" but "S2" stage?
- What happens when a user is S2 (Optimised) but has Pro subscription?

**Impact:** HIGH - Developers will implement different logic depending on which document they read

**Resolution needed:** Clear mapping between S-stages and Tiers
---

## Conflict #2: Public Page Routes & Naming

### 2.1: Listing Detail Page URL

**Conflicting information:**
- `SITE_MAP.md`: `/u/[slug]` (Studio Page / Mini-site)
- `SITE_MAP.md`: `/listing/[id]` (Permalink - redirects based on state)
- `USER_MODEL_AND_STATE_MACHINE.md`: Mentions "Studio page" and "Mini-site" as public destinations

**The ambiguity:**
- What is the actual public URL for a claimed listing?
- Does `/listing/[id]` still exist or is it a legacy route?
- How do redirects work in practice?

**Potential interpretation:**
- `/u/[slug]` is the canonical public URL
- `/listing/[id]` is a legacy redirect for backward compatibility
- But this is NOT explicitly stated

**Impact:** MEDIUM - Routing confusion, potential SEO duplicate content issues

---

### 2.2: Product Page URL

**Conflicting information:**
- `SITE_MAP.md`: `/product/[id]`
- `PUBLIC_UX_CONTRACT.md` (Section 5.3): "The canonical route for a Product page MUST be `/product/[id]`"
- `SEARCH_CONTRACT.md`: No route specified

**Ambiguity:** None - consistent

**Verdict:** CORRECT

---

## Conflict #3: Featured Placement Purchase Gating

### 3.1: S2 vs S3 for Featured Purchase

**Conflicting information:**
- `CREATOR_STUDIO_SPEC.md` (Section 3A):
  > "Featured Placement: A Creator MUST NOT be able to purchase or activate a Featured Placement unless their Studio is in stage `S2: Optimised` or higher."
  
- `PUBLIC_UX_CONTRACT.md` (Section 4.1):
  > "Verification elevates position within a tier; it does not override Featured placement."
  
- `USER_MODEL_AND_STATE_MACHINE.md`:
  > S2: "The Creator is eligible to purchase 'Featured Placement'. The next action presented is to upgrade to Pro."
  > S3: "All Pro features, including Mini-site editor and Share Kit, are unlocked."

**The ambiguity:**
- Can S2 (Optimised, Basic tier) purchase Featured?
- Or must they be S3 (Pro-enabled) first?
- Is "S2 or higher" inclusive of S3?

**Impact:** HIGH - Business logic will be implemented incorrectly

**Clarification needed:** Explicit rule: "Featured purchase requires S2 stage, REGARDLESS of tier"

---

## Conflict #4: Verification Independence vs Tier

### 4.1: Verification Badge Scope

**Conflicting information:**
- `CANONICAL_TERMINOLOGY.md`:
  > "ABN Verified: Identity verification badge. Independent of tier and placement."
  > "Must explain what is verified"
  
- `CREATOR_STUDIO_SPEC.md` (Section 4.6):
  > "Available to all Creators"
  > "Independent of tier"
  
- `USER_MODEL_AND_STATE_MACHINE.md` (Section 4.3):
  > "Verification: Is optional"
  > "Not tier-dependent"

**Conflict:** None - VERIFIED CONSISTENT

**Verdict:** CORRECT

---

## Conflict #5: Product Limits Enforcement

### 5.1: Basic vs Pro Product Limits

**Conflicting information:**
- `CREATOR_STUDIO_SPEC.md` (Section 4.3):
  > "Basic: Up to 3 Products"
  > "Pro: Up to 10 Products"
  > "Attempting to exceed Basic limits must trigger a Pro upgrade prompt."
  
- `PRODUCT_CONSTITUTION.md` (Section 6.2):
  > "Pro unlocks: Mini-site mode, Share Kit, Spotlight, Advanced ordering and pinning"
  > Does NOT explicitly state product limits
  
- `OPERATOR_AND_ADMIN_AUTOMATION.md` (Trigger):
  > "check_product_limit_trigger: Tier Limits: Stops 'Basic' listings from adding >3 products."
  > Database trigger enforces: Basic = 3, Pro = 10

**Ambiguity:** MINOR - PRODUCT_CONSTITUTION.md should mention limits for completeness

**Verdict:** Consistent in practice, PRODUCT_CONSTITUTION.md should reference automation doc

---

## Conflict #6: Marketplace vs Directory Relationship

### 6.1: Product Placement on Studio Page

**Conflicting information:**
- `CREATOR_STUDIO_SPEC.md` (Section 4.3):
  > "Products section" (in Studio overview)
  > Implies products are visible on Studio page
  
- `MINI_SITE_ENGINE_SPEC.md` (Section 4):
  > "Spotlight Modes: Pinned products, Pinned service, Pinned collection"
  > Only one Spotlight mode may be active at a time
  > "Pinned products" = default if published products exist
  
- `PUBLIC_UX_CONTRACT.md` (Section 3.1):
  > Studio Page (Basic): "Must include: ... Products (if any)"
  
- `PRODUCT_CONSTITUTION.md`:
  > "Marketplace: A secondary discovery surface"
  > "Distinct from Directory (which is for Listings)"
  > "Exclusion: Never displays Platform Services (like Pro upgrades or Featured spots)"

**The ambiguity:**
- Can products appear on Studio Page/Mini-site?
- If yes, is this conflicting with "Marketplace is secondary surface"?
- Are products only on Marketplace or also on Studio pages?

**Potential interpretation:**
- Products CAN appear on Studio Page (via Products section)
- Products ALSO appear on Marketplace surface
- This is not a conflict, but clarity is needed

**Impact:** MEDIUM - UI implementation confusion

---

## Conflict #7: Search Implementation

### 7.1: Search Data Sources

**Conflicting information:**
- `SEARCH_CONTRACT.md`:
  > "Search will be implemented using **Postgres Full-Text Search (FTS) only**"
  > "No third-party or paid search services"
  > Indexed fields: Name, Description, Category Name, Tag Names
  
- `SCHEMA_MAP.md`:
  > Lists `search_listings()` and `search_products()` RPC functions
  > Mentions `search_vector` column (tsvector) missing on local
  
- `platform-logic.md`:
  > (not reviewed in detail - need to verify)

**Ambiguity:** 
- Is FTS actually implemented in codebase?
- Are the RPC functions using FTS correctly?
- Is the schema actually indexed for search?

**Impact:** HIGH - Search may not work as documented

**Investigation needed:** Check if PostgreSQL FTS is implemented in actual code

---

## Conflict #8: Cron Job Configuration

### 8.1: Cron Jobs vs Manual Setup

**Conflicting information:**
- `AUTOMATION_ARCHITECTURE.md`:
  > "Cron jobs are NOT defined in migration files"
  > "They must be configured manually in Supabase Dashboard or via SQL"
  > Lists 3 required jobs: daily_queue_rotation, cleanup_expired_slots, recover_stuck_tasks
  
- `OPERATOR_AND_ADMIN_AUTOMATION.md`:
  > "Scheduled Automations (Cron)" section
  > Same 3 jobs listed
  > Same setup instructions
  
- `SITE_MAP.md`:
  > "Automation & Monetization Surfaces" section
  > Lists: `api/cron/featured` (Cron) - "Nightly rotation"
  
**The ambiguity:**
- Are cron jobs triggered via API route or Supabase pg_cron?
- `SITE_MAP.md` suggests `api/cron/featured` exists
- But other docs say "must be configured manually in Supabase Dashboard"

**Potential interpretation:**
- Cron jobs are Supabase pg_cron scheduled jobs
- API routes may exist for testing/manual triggering
- This is not a conflict, but needs clarification

**Impact:** LOW - Implementation confusion

---

## Conflict #9: AI Implementation Model

### 9.1: Z.ai Model Name

**Conflicting information:**
- `AI_AUTOMATION_MASTER.md`:
  > "export const zaiModel = 'glm-4-flash';"
  
- `lib/ai/z-ai-provider.ts` (actual code):
  > "export const zaiModel = 'gpt-4o';"
  
**Conflict:** DIRECT CONTRADICTION

**Impact:** CRITICAL - Code uses different model than documented

**Resolution needed:** Update `AI_AUTOMATION_MASTER.md` to match code OR update code to match docs

---

### 9.2: AI Integration Points

**Conflicting information:**
- `AI_AUTOMATION_MASTER.md`:
  > Pattern 4: Structured JSON Output
  > Mentions `lib/ai/seo.ts` (SEO Agent) and `lib/ai/triage.ts` (Safety Agent)
  
- Actual codebase:
  > Need to verify if these files exist
  
- `ADMIN_OPERATOR_MANUAL.md`:
  > "AI Copilot Implementation: lib/ai/copilot.ts + app/api/ai/copilot/route.ts"
  
**Ambiguity:** 
- Do `seo.ts` and `triage.ts` actually exist?
- Is AI automation implemented yet or is this documentation for future work?

**Investigation needed:** Check if these AI files exist in `lib/ai/`

**Impact:** HIGH - Documentation references non-existent code

---

## Conflict #10: Database Schema vs Documentation

### 10.1: Schema Table Names

**Conflicting information:**
- `SCHEMA_MAP.md`:
  > Comprehensive mapping of all tables
  > States: "WARNING about zombie 'profiles' table"
  
- `COMPLIANCE_LOG.md`:
  > "profiles table BANNED. Do not create."
  
- Actual codebase migrations:
  > Need to verify if any migration creates 'profiles' table
  
**Ambiguity:** Need to verify if legacy migrations still exist that create 'profiles'

**Impact:** LOW - Historical compliance issue, likely resolved

---

## Conflict #11: Category Count

### 11.1: Business Categories

**Conflicting information:**
- `TAXONOMY_CONTRACT.md`:
  > Lists 16 business categories
  > Lists 6 product categories
  
- Earlier context I created (incorrect):
  > Listed 16 business categories in SSOT Blueprint I incorrectly created

**Ambiguity:** Verify if category lists are consistent across all docs

**Verdict:** `TAXONOMY_CONTRACT.md` is source of truth here

---

## Conflict #12: Email Template Completeness

### 12.1: Email Functions vs Templates

**Conflicting information:**
- `EMAIL_TEMPLATES.md`:
  > Catalogues all emails
  > Lists 21 email functions
  
- `lib/email.ts` (actual code):
  > Need to verify if all 21 functions exist
  
**Ambiguity:** Documentation completeness vs actual implementation

**Impact:** LOW - Documentation may be ahead of or behind implementation

---

## Critical Gaps Identified

### Gap #1: S-Stage Computation Logic

**Missing:**
- `CREATOR_STUDIO_SPEC.md` states: "Stage evaluation MUST be automatic based on system checking criteria"
- But NO document specifies the exact computation logic or SQL/RPC function
- How does system know when to transition S1 → S2?

**Impact:** CRITICAL - No implementation guidance

**Resolution needed:** Specify exactly where computation logic lives (DB trigger vs Server Action)

---

### Gap #2: Downgrade Grace Period Behavior

**Missing:**
- `CREATOR_STUDIO_SPEC.md` states: "Pro features remain active until paid period ends"
- `MINI_SITE_ENGINE_SPEC.md` states: "Share Kit links disable automatically on Pro expiry"
- But NO specification of:
  - What happens to products?
  - What happens to Featured placement if active?
  - How long is grace period?

**Impact:** MEDIUM - UX confusion

---

### Gap #3: Featured Queue Expiry Handling

**Missing:**
- `AUTOMATION_ARCHITECTURE.md` and `OPERATOR_AND_ADMIN_AUTOMATION.md` document queue processing
- But NO specification of:
  - What happens if user's Featured placement expires mid-period?
  - Can they renew early?
  - What happens to their FIFO queue position?

**Impact:** MEDIUM - Business logic gap

---

## Terminology Verification

### Verified Consistent Terms
- Creator (not vendor) ✅
- Listing (not business profile) ✅
- Studio Page (not profile) ✅
- Mini-site (not pro profile) ✅
- Operator (not admin) ✅

### Potential Drift Risks
- S-stage terminology not in `CANONICAL_TERMINOLOGY.md`
- Potential for "S2" vs "Optimised" confusion
- "S3" vs "Pro-enabled" vs "Pro tier"

---

## Priority Resolution Matrix

| Conflict | Priority | Risk Level | Recommended Action |
|----------|----------|-------------|-------------------|
| #1: S-stages vs Tiers | HIGH | CRITICAL | Create explicit mapping table showing S0-S3 = which Tier state |
| #2: Public routes | MEDIUM | MEDIUM | Remove legacy `/listing/[id]` or document its purpose |
| #3: Featured gating | HIGH | CRITICAL | State: "Featured purchase requires S2, any tier" explicitly |
| #9: AI Model name | CRITICAL | CRITICAL | Update AI_AUTOMATION_MASTER.md to use 'gpt-4o' (matches code) |
| #9: AI files exist | HIGH | HIGH | Verify if `seo.ts`, `triage.ts`, `copilot.ts` exist |
| Gap #1: S-stage logic | CRITICAL | CRITICAL | Create specification: where does S-stage computation live? |

---

## Summary

**Critical issues requiring immediate resolution:**
1. S-stage vs Tier mapping ambiguity
2. AI model name mismatch (docs vs code)
3. Featured purchase gating rules unclear
4. S-stage automatic transition logic not specified

**Medium priority issues:**
5. Public route naming confusion
6. Product placement on Studio page vs Marketplace separation
7. Downgrade grace period not specified
8. Search implementation verification needed

**Documentation quality assessment:**
- Core SSOT documents are internally consistent (within their scope)
- Cross-document conflicts are due to scope boundaries not being explicit
- Some documentation appears to be forward-looking (AI automation) vs implemented state
- Need for explicit "mapping documents" to connect models between docs

**Recommended next action:**
Create a `GLOSSARY_OF_MODELS.md` that explicitly maps:
- S-stages → Tiers
- Tier states → UI states
- Role → Permissions
- Status → Visibility

EOF
cat /Users/carlg/Documents/PROJECTS/Project-dev/suburbmatesmelblocal/docs/SSOT/CONFLICTS_AMBIGUITIES.md