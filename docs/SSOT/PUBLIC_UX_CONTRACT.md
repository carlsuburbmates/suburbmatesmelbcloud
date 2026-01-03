# PUBLIC_UX_CONTRACT.md  
Public UX Contract — SuburbMates

Status: LOCKED (SSOT)  
Authority Level: High (Subordinate only to Product Constitution, Canonical Terminology, and User Model)  
Audience: Product, Design, Content, Automation  
Change Rule: Any change requires explicit trust-impact review

---

## 1. Purpose

This document defines the public promise of SuburbMates.

It specifies:
- What public users can expect to see
- What SuburbMates does and does not do for them
- How listings, studios, and products are presented
- How ranking, badges, and placement signals must be interpreted

If the public UX implies something that contradicts this document, the UX is invalid.

---

## 2. Public Surfaces (Read-Only Contract)

### 2.1 Directory
The Directory is the primary discovery surface.

Must contain:
- Listings (claimed and unclaimed)
- Location-based discovery (suburb/council)
- Neutral preview cards

Must not:
- Imply endorsement
- Imply availability
- Imply verification unless explicitly shown

---

### 2.2 Listing Cards
Cards are previews, not guarantees.

Required elements:
- Listing name
- Category
- Location cue
- Status indicators (if applicable)

Optional elements:
- Featured placement badge
- Verified badge (only if verified)

Hard rules:
- Cards must never imply quality, trust, or outcomes by default
- Cards must never display “fake scale” (ratings, reviews, teams, numbers) unless backed by real data

---

### 2.3 Unclaimed Listings
Explicit contract:
- Unclaimed listings exist for discoverability only
- Tapping an unclaimed listing routes to Claim flow
- No public detail page exists until claimed

This prevents false representation.

---

## 3. Studio Page & Mini-site (Public Destinations)

### 3.1 Studio Page (Basic)
The Studio page is the default public destination for a claimed Creator.

Must include:
- Clear identity (Creator name, category)
- Location context
- Truth UI statements
- Products (if any)
- Contact/links (if provided)

Must not include:
- Share Kit
- Spotlight hero treatment
- Advanced layout controls

The Basic Studio page must still feel complete and credible, not degraded.

---

### 3.2 Mini-site (Pro Mode)
The Mini-site is an upgraded mode of the Studio page at the same URL.

Adds:
- Spotlight (CTA-driven)
- Share Kit (campaign links, deep links, QR)
- Pinned content
- Advanced ordering and layout tuning

Public labeling rules:
- May show a “Pro Mini-site” badge
- Must not imply endorsement or verification

---

## 4. Ranking & Placement Rules (Publicly Observable)

### 4.1 Tier Ordering (Within Context)
When Listings or Studios are shown together:

1. Featured placements (explicitly labeled)
2. Verified within their respective tier or group
3. Pro before Basic (within non-featured)
4. Remaining results (neutral order)

Important:  
Verification elevates position within a tier; it does not override Featured placement.

---

### 4.2 Featured Placement
Definition:
- A paid, time-bound placement

Rules:
- Must always be labeled “Featured placement”
- Must not appear indistinguishable from organic results
- The disclosure ("Featured") MUST appear at the point of impression (e.g., on-card, via tooltip, or as inline microcopy) and MUST NOT be confined to a site-wide footer. <!-- Satisfies Artifact #3 -->
- Must not override Truth UI language

---

### 4.3 Verification Badge
Definition:
- Mechanism-backed verification (e.g., ABN)

Rules:
- Independent of tier
- Independent of Featured
- Must clearly explain what is verified (identity, not quality)
- The explanation of what is verified MUST be accessible on mobile devices (i.e., via a tap action, not hover-only). <!-- Satisfies Artifact #3 -->

---

## 5. Products & Marketplace Truth

### 5.1 Product Presentation
Every product must clearly state:
- “Sold by [Creator]”
- That SuburbMates is not the merchant of record

### 5.2 Payments
- Payments are processed via Stripe
- SuburbMates does not handle fulfilment or refunds

Ambiguity is considered a UX defect.

---

### 5.3 Product Cards <!-- Resolves Blocker #3 -->

Product Cards are preview components used in public marketplace surfaces. They MUST adhere to the following contract to ensure consistency and clarity.

**A) Mandatory Fields & Elements:**
A Product Card MUST display the following information:
*   **Thumbnail:** A visual representation of the product MAY be displayed.
*   **Product Name:** The canonical name of the product.
*   **Product Price:** The current price, including currency symbol.
*   **Product Category:** The product's assigned category from the platform taxonomy.
*   **Seller Line:** MUST be the exact label "Sold by [Creator]", where `[Creator]` is the public name of the seller. Tapping this element MUST route to the Creator's public Studio Page.
*   **ABN Verified Badge:** The "ABN Verified" badge MUST be displayed ONLY IF the seller's Listing is verified.
*   **Freshness Label:** A label indicating the last update time, formatted as "Updated [Month YYYY]" (e.g., "Updated January 2026"), derived from the `product.updated_at` timestamp.

**B) Click Routing:**
*   A tap on any part of the Product Card, excluding the Seller Line, MUST route to the canonical Product page.
*   The canonical route for a Product page MUST be `/product/[id]`.

**C) Disclosure Location:**
*   The platform disclosure ("SuburbMates is a discovery platform. Purchases are fulfilled by the Creator.") MUST appear on the Product page. It MUST NOT appear on the Product Card itself.

---

## 6. Support Lanes (Public Wording Contract)

SuburbMates operates two distinct support lanes.

### 6.1 Purchase Help
Purpose:  
Redirect transactional issues to the correct party.

Public wording intent (exact copy locked elsewhere):
- For delivery, access, or refund issues
- Clearly states: contact the Creator directly

### 6.2 Report a Concern
Purpose:  
Platform integrity and safety.

Used for:
- Fraud
- Misrepresentation
- Policy violations

Explicitly not for:
- Refund requests
- Product complaints

---

## 7. What the Platform Does NOT Promise

The public UX must never imply:
- Quality guarantees
- Response times
- Availability
- Endorsement
- Arbitration or mediation

Silence is preferred over implication.

---

## 8. Forbidden Public UX Patterns

The following are not allowed:
- Dark patterns
- Urgency countdowns
- Fake social proof
- AI-generated authority language
- Hidden paid placement

Any appearance is grounds for removal.

---

## 9. Public UX Governance

If a public-facing change:
- Alters ranking behavior
- Introduces a new badge
- Changes support language
- Adds implied authority

This document must be reviewed and updated first.

---

End of Public UX Contract