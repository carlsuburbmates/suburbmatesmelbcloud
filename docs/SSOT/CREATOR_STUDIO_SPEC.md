# CREATOR_STUDIO_SPEC.md  
Creator Studio Specification — SuburbMates

Status: LOCKED (SSOT)  
Authority Level: High (Subordinate only to Product Constitution, Canonical Terminology, User Model, Public UX Contract)  
Audience: Product, Design, Automation, Operator  
Change Rule: Changes require tier-impact and automation review

---

## 1. Purpose

This document defines the Creator Studio as a private workspace and establishes:
- What Creators can do
- What differs between Basic and Pro
- How upgrades and downgrades behave
- Which actions are automated vs manual

If a feature contradicts this spec, it must be revised or removed.

---

## 2. What the Studio Is (and Is Not)

### 2.1 Definition
Studio is the private workspace a Creator uses to manage their presence on SuburbMates.

It is:
- Logged-in only
- Creator-owned
- The control surface for public representation

### 2.2 Explicit Non-Goals
Studio is not:
- A public page
- A website builder
- A customer support tool
- An admin surface

---

## 3. Studio Information Architecture (Canonical)

### 3.1 Top-Level Sections
The Studio contains the following sections (labels must match):

1. Overview
2. Listing details
3. Products
4. Mini-site editor (Pro gated)
5. Share Kit (Pro gated)
6. Verification
7. Billing & Plan

No additional top-level sections may be introduced without updating this document.

---

### 3A. Studio Lifecycle and Progression

The Creator Studio MUST guide Creators through a clear lifecycle, from incomplete to pro-enabled. The UI MUST reflect the Creator's current stage and clearly indicate the next required action to progress. <!-- Satisfies Artifact #2 -->

**Lifecycle Stages:**

*   **S0: Incomplete**
    *   **Definition:** The Creator has claimed a Listing but has not completed the minimum required fields for a public Studio Page.
    *   **State:** The public Studio Page is not live. The Studio UI is focused on completing required information.

*   **S1: Live (Basic)**
    *   **Definition:** The Creator has filled all mandatory fields.
    *   **State:** The public Studio Page is live. The Creator has access to all Basic features. The next action presented is to optimize their listing.

 *   **S2: Optimised** <blockquote>[NOT IMPLEMENTED]</blockquote> [NOT IMPLEMENTED]
    *   **Definition:** The Creator has met a deterministic set of criteria indicating their Studio is well-configured for public discovery and commerce.
    *   **State:** The Creator is eligible to purchase "Featured Placement". The next action presented is to upgrade to Pro.
    *   **S1 → S2 Gating Criteria:** A Studio automatically transitions to S2 ONLY IF all of the following criteria are met:
        1.  A description/about section has been completed.
        2.  At least one (1) Product has been published.
        3.  A primary contact method (e.g., email or phone) has been set.
        4.  The Creator has reviewed and confirmed their primary business category.
        5.  The Creator has accepted the most recent platform policy acknowledgements.
    *   **Computation:** Stage evaluation MUST be automatic based on a system checking the criteria above. It is NEVER a manual operator flag.
    *   **Regression:** If a Creator modifies their Studio such that one or more of the S2 criteria are no longer met (e.g., by unpublishing all products), their stage MUST automatically regress to S1.
    *   **ACTUAL STATUS:** This concept is NOT IMPLEMENTED. No `s_stage` column exists in database. See `ACTUAL_IMPLEMENTATION_STATE.md`.

*   **S3: Pro-enabled**
    *   **Definition:** The Creator has upgraded to the Pro plan.
    *   **State:** All Pro features, including the Mini-site editor and Share Kit, are unlocked.

**Gating Rules:**

*   **Featured Placement:** A Creator MUST NOT be able to purchase or activate a Featured Placement unless their Studio is in stage `S2: Optimised` or higher.
*   **LGA Capacity Rule:** Featured Placements are strictly limited to **5 slots per Council (LGA)** at any given time.
    *   **Allocation:** First-In-First-Out (FIFO).
    *   **Behavior:** If 5 slots are occupied for a specific Council, the purchase option MUST be disabled/greyed out for all other Creators in that Council until a slot opens.

---

## 4. Studio Sections (Behavioral Contract)

### 4.1 Overview
Purpose: At-a-glance status.

Must show:
- Current plan (Basic or Pro)
- Public page status (Studio page / Pro Mini-site)
- Verification status
- Key alerts (e.g. “Pro ends on [date]”)

---

### 4.2 Listing Details
Purpose: Manage the canonical business identity.

Editable fields include:
- Name
- Category
- Location
- Description / tagline
- Links / contact methods
- Media assets (Business Logo, Cover Image)

Rules:
- Changes here propagate to the public page
- Character limits and aspect ratio constraints enforced
- Truth UI rules apply (no fake claims)

---

### 4.3 Products
Purpose: Marketplace management.

Capabilities:
- Create, edit, publish Products
- Manage availability
- View basic performance signals (if enabled elsewhere)

Tier limits:
- Basic: Up to 3 Products
- Pro: Up to 10 Products

Attempting to exceed Basic limits must trigger a Pro upgrade prompt.

---

### 4.4 Mini-site Editor (Pro Only)
Purpose: Configure the public Mini-site mode.

Controls include:
- Spotlight mode selection
- Pinned content
- Section ordering
- Theme / “Vibe” tuning
- Primary CTA selection

Rules:
- No free-form layout or CSS
- Constraint-based knobs only
- Reset to default always available
- No silent changes without Creator consent

---

### 4.5 Share Kit (Pro Only)
Purpose: Distribution tools.

Includes:
- Default public link
- Campaign links (e.g. Instagram, Email)
- Deep links (Spotlight, Products)
- QR mode

Rules:
- Links remain active until paid period ends
- Links disable automatically on Pro expiry
- Public degradation must be graceful

---

### 4.6 Verification
Purpose: Identity trust.

Includes:
- ABN submission
- Verification status
- Explanation of what “Verified” means

Rules:
- Available to all Creators
- Independent of tier
- Badge applied automatically upon successful verification

---

### 4.7 Billing & Plan
Purpose: Subscription control.

Includes:
- Current plan
- Upgrade to Pro
- Downgrade flow
- Billing history

Rules:
- Upgrade immediately unlocks Pro features
- Downgrade preserves Pro features until paid period ends
- No data loss on downgrade

---

## 5. Upgrade & Downgrade Automation

### 5.1 Upgrade to Pro
On successful upgrade:
- Mini-site mode activates automatically
- Spotlight defaults configured
- Share Kit links generated
- Creator lands on a ready-to-share page

Zero manual setup required.

---

### 5.2 Downgrade from Pro
On downgrade request:
- Pro features remain active until paid period ends
- Creator is notified of expiry date
- After expiry:
  - Mini-site mode disables
  - Share Kit links deactivate
  - Public page reverts to Studio page (Basic)

---

## 6. Permissions & Safety

### 6.1 What Creators Cannot Do
Creators cannot:
- Modify verification logic
- Override enforcement
- Hide truth statements
- Misrepresent platform role

---

### 6.2 Enforcement Interaction
Studio may display:
- Warnings
- Delisting notices
- Suspension states

These are informational only; enforcement actions are controlled by Operator workflows.

---

## 7. Invalid Studio States (Must Never Occur)

- Mini-site editor visible to Basic Creators
- Share Kit active after Pro expiry
- Verification badge editable by Creator
- Public page editable without Studio access

Any occurrence is a critical defect.

---

## 8. Governance Rule

Any change that:
- Adds new Studio sections
- Alters tier boundaries
- Changes upgrade behavior

Requires this document to be updated first.

---

End of Creator Studio Specification