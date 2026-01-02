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
- Media assets

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
- Basic: Limited number of Products
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