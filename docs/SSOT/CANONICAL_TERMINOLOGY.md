# CANONICAL_TERMINOLOGY.md  
Canonical Terminology — SuburbMates

Status: LOCKED (Language SSOT)  
Authority Level: Absolute (Overrides all other documents on naming)  
Audience: Product, Design, Engineering, Content, Operator  
Change Rule: Any change requires full SSOT review and re-approval

---

## 1. Purpose

This document defines the only permitted vocabulary for SuburbMates.

It exists to:
- Eliminate ambiguity
- Prevent UX and logic drift
- Ensure automation, billing, and trust systems align
- Stop future contributors from reintroducing banned terms

If wording in any UI, spec, automation, or copy contradicts this document, this document wins.

---

## 2. Absolute Rules

1. One concept = one term. No synonyms.
2. “Studio” is private-only.
3. Public destinations are explicitly named.
4. Directory language must support unclaimed entities.
5. Forbidden terms must never appear.

Violation is a blocking defect.

---

## 3. Canonical Terms (Authoritative)

### 3.1 People & Roles

#### Creator
- A registered owner of a claimed Listing.
- Can manage a Studio and sell Products.
- Appears publicly as the seller/owner.

Allowed contexts: Public UI, Studio, policies  
Never replaced by: vendor, business owner

---

#### Customer
- A user who purchases a Product.
- May or may not be logged in.

Allowed contexts: Help text, policies

---

#### Operator
- The internal platform owner.
- Uses the Operator Dashboard.

Allowed contexts: Internal only  
Never public

---

## 4. Core Entities (Public-Facing)

### Listing
- A Directory entry representing a local business.
- May be unclaimed or claimed.

Key rule: Listings exist before Creators.

---

### Unclaimed Listing
- A Listing without an owner.
- Routes to Claim flow only.
- Has no public detail page.

---

### Claimed Listing
- A Listing owned by a Creator.
- Enables a public destination.

---

### Studio Page
- The public destination page for a claimed Creator on Basic.
- Must always be complete and credible.

Never called: profile, business page

---

### Mini-site
- The Pro mode of the Studio Page.
- Same URL, additional capabilities unlocked.

Public label: “Pro Mini-site” (where tier signaling is required)

---

### Product
- A digital item sold by a Creator.
- Always labeled “Sold by [Creator]”.

---

### Collection
- A curated public grouping of Listings and/or Products.

---

## 5. Private Creator Surfaces

### Studio
- The Creator’s private workspace.
- Used to manage:
  - Listing details
  - Products
  - Mini-site settings
  - Share Kit
  - Verification
  - Billing

Hard rule: Studio is never public.

---

### Mini-site Editor
- A section inside Studio.
- Used to configure Pro Mini-site features.

---

### Share Kit
- Pro-only distribution tools:
  - Campaign links
  - Deep links
  - QR mode
  - Preview metadata

---

## 6. UI Components

### Card
- A preview component.
- Always links to a destination.
- A Card MUST be interactive (i.e., it routes on click) unless its state explicitly requires it to be disabled (e.g., a Listing that is 'Under Review'). <!-- Satisfies Artifact #3 -->
- A Card MUST be interactive (i.e., it routes on click) unless its state explicitly requires it to be disabled (e.g., a Listing that is 'Under Review'). <!-- Satisfies Artifact #3 -->
- Types:
  - Listing card
  - Studio card
  - Product card
  - Collection card

---

## 7. States & Badges (Truth UI)

### Basic
- Free Creator tier.
- Enables Studio Page.

---

### Pro
- Paid Creator tier.
- Unlocks Mini-site mode.

---

### ABN Verified
- Identity verification badge.
- Independent of tier and placement.
- Must explain what is verified.

---

### Featured Placement
- Paid, time-bound placement.
- Must always be labeled as paid.
- Never implies endorsement.

---

## 8. Forbidden Terms (Zero Tolerance)

The following must never appear in public or creator-facing UI, specs, or copy:

- profile
- vendor
- business profile
- admin (public)
- tiered verification
- managed marketplace
- account <!-- Satisfies Artifact #1 -->
- user account <!-- Satisfies Artifact #1 -->
- account <!-- Satisfies Artifact #1 -->
- user account <!-- Satisfies Artifact #1 -->

These may exist internally in legacy code only, never in language.

---

## 9. Canonical Mapping (Internal → Canonical)

- vendor → Creator
- vendor dashboard / portal → Studio
- business_profile → Listing
- claimed business_profile → Studio Page
- pro profile → Mini-site
- admin panel → Operator Dashboard

---

## 10. Governance & Enforcement

- This document overrides all others on naming.
- New terms must be added here before use.
- Any PR introducing forbidden terms must be rejected.
- QA must include a terminology check.

---

End of Canonical Terminology