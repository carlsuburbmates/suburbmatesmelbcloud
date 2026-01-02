# MINI_SITE_ENGINE_SPEC.md  
Pro Mini-Site Engine — SuburbMates

Status: LOCKED (SSOT)  
Authority Level: High (Subordinate only to Product Constitution, Canonical Terminology, User Model, Public UX Contract, Creator Studio Spec)  
Audience: Product, Design, Automation, Operator  
Change Rule: Any change requires distribution-impact and downgrade-safety review

---

## 1. Purpose

This document defines the Mini-Site Engine as a mode of the public Studio page unlocked by Pro.

It exists to:
- Deliver a share-first, conversion-ready public page
- Preserve structural integrity through constraints
- Eliminate operator involvement post-launch
- Avoid “website builder” failure modes

If a feature enables arbitrary layout, styling, or claims, it violates this spec.

---

## 2. Mini-Site as a Mode (Non-Negotiable)

### 2.1 Mode Definition
- Mini-site is not a separate object
- Mini-site shares the same URL as the Studio page
- Tier controls capabilities, not identity

### 2.2 Mode Transitions
- Basic → Pro: Mini-site mode activates immediately
- Pro → Basic: Mini-site mode deactivates after paid period ends
- Public degradation must be graceful

---

## 3. The Constraint-Based Theme Engine (“Vibe Tuner”)

### 3.1 Design Philosophy
Creators are given bounded control, not freedom.

The engine exposes knobs, not canvases.

### 3.2 Preset Vibes (Pro Only)
Vibes are pre-validated design packs created once by the platform.

Allowed presets:
- Swiss: tight grid, restrained hierarchy
- Editorial: generous whitespace, calm reading flow
- Monochrome: high contrast, minimal chrome, single accent

Vibes change presentation only, never content or layout integrity.

---

### 3.3 Creator-Adjustable Knobs (Allowed)

Color Authority
- Accent color (single value)
- Background tone (Light / Warm / Dark)
- System enforces contrast automatically

Layout Toggles
- Hero style (Cover vs Profile-focus)
- Product display (Grid vs List)
- Density (Comfortable vs Compact)

Content Emphasis
- Spotlight selection (see Section 4)
- Primary CTA selection

---

### 3.4 Guardrails (System-Enforced)
The system must enforce:
- Auto-contrast (no unreadable text)
- Fixed aspect ratios (avatar 1:1, cover 16:9)
- Character limits (tagline, descriptions)
- Reset-to-default at all times

Creators can never “break” the layout.

---

## 4. Spotlight System (Pro Core Feature)

### 4.1 Purpose
Spotlight exists to answer one question immediately:
> “What should I do here?”

### 4.2 Spotlight Modes (Single-Select)
- Pinned products
- Pinned service
- Pinned collection

Only one Spotlight mode may be active at a time.

---

### 4.3 Default Spotlight Logic (Automated)
On Pro upgrade:
- If published products exist → Pinned products
- Else → Pinned service (or setup prompt if none)

This default may be changed manually by the Creator.

---

### 4.4 Pinned Content Rules
- Maximum of 3 pinned items
- Order is Creator-controlled
- Unpublished items cannot be pinned
- Empty Spotlight states are forbidden

---

## 5. Primary CTA System

### 5.1 Allowed CTAs (Single-Select)
- Shop products
- Enquire
- Book (external)
- Visit website (external)

### 5.2 CTA Behavior
- CTA appears in Spotlight and Hero context
- CTA destination must be explicit and testable
- Invalid CTAs (e.g. “Shop” with no products) must be blocked

---

## 6. Share Kit (Distribution Layer)

### 6.1 Purpose
Enable Creators to distribute their Mini-site intentionally.

### 6.2 Share Kit Components
- Default public link
- Campaign links (Instagram, Email, QR)
- Deep links (Spotlight, Products, Enquiry)
- Share preview metadata (truth-safe only)

---

### 6.3 Lifecycle Rules
- Share Kit activates immediately on Pro upgrade
- Remains active until paid period ends
- Disables automatically after expiry
- Links must degrade gracefully (no 404)

---

## 7. “Alive” Behavior (Optional, Never Silent)

### 7.1 Definition
“Alive” behavior reflects real activity, not animation.

Examples:
- New product added
- Spotlight content updated
- Collection refreshed

---

### 7.2 Auto-Adjustment Rules
- Auto-adjustment (e.g. switching Spotlight to “Shop”) is opt-in only
- Creator must be notified
- Undo must be available
- All changes logged

Silent changes are forbidden.

---

## 8. Forbidden Capabilities

The Mini-site Engine must never allow:
- Custom CSS or HTML
- Arbitrary layout creation
- Fake social proof
- AI-generated claims
- Removal of truth statements

Violation invalidates the feature.

---

## 9. Invalid States (Critical Defects)

- Mini-site active without Pro tier
- Spotlight empty or contradictory
- Share Kit links active after Pro expiry
- Creator able to misrepresent verification or endorsement

---

## 10. Governance Rule

Any feature that:
- Adds a new knob
- Changes Spotlight logic
- Alters Share Kit behavior
- Affects downgrade degradation

Must update this document first.

---

End of Mini-Site Engine Specification