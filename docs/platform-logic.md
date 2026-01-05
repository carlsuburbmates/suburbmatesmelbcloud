NON-AUTHORITATIVE: For implementation, defer to docs/SSOT/**.

**SuburbMates Melbourne** is a localized, mobile-first "Directory + Marketplace" designed to connect digital creators with local buyers. It operates on a strict "Middleman Truth" architecture, acting as a high-trust discovery layer rather than a merchant of record, and is governed by a "Premium Minimalism" design constitution that rejects generic AI templates in favor of editorial craft.

Here is the comprehensive synthesis of the platform’s logic, taxonomy, and operational rules.

### 1. Core Identity and Trust Architecture
*   **The "Mall" Model:** The platform functions as a venue. It aggregates listings and facilitates discovery, but the transaction contract is strictly between the Buyer and the Creator. Every product page must explicitly state: "Sold by [Creator]. Payments processed by Stripe",,.
*   **No Fake Signals:** The design forbids "fake scale" metrics (e.g., "trusted by thousands") or artificial urgency. "Alive" is defined by real data freshness (new drops, updated Studio Pages), not by decorative motion or carousels,,.
*   **Support Pathways:** To enforce the middleman role, support is split into two distinct lanes:
    1.  **"Get help with this purchase":** Routes directly to the Creator,.
    2.  **"Report a platform concern":** Routes to the Admin for fraud, scams, or policy enforcement,.

### 2. The Two-Domain Taxonomy
To prevent data pollution, the platform enforces a strict separation between **Business** entities and **Product** inventory.
*   **Business Domain (The Directory):** Uses exactly **16 Business Categories**. These act as hard filters for Studios and Unclaimed Listings. A Listing cannot use a product category,.
*   **Product Domain (The Marketplace):** Uses a separate "digital product seed set." These categories apply only to the items sold by creators,.
*   **Cross-Contamination Ban:** You must never mix these domains. An unclaimed listing cannot sell products, and a product cannot be labeled with a business category (e.g., "Plumber"),.

### 3. Monetization and Tiers
There are strictly two subscription tiers and one paid placement add-on. References to a "Premium" tier have been eliminated,,.
*   **Basic (Free):** Allows a creator to publish **3 products**. Displays as a standard "Studio Page",.
*   **Pro ($20 AUD/30 days):** Allows **10 products**. Unlocks the "Pro Mini-site" mode (HighEnd template) and prioritized placement. Auto-renews,,.
*   **Featured Placement ($15 AUD/30 days):** A non-recurring add-on. It is capped at **5 slots per Council area**. If full, it uses a **FIFO (First-In-First-Out) queue** to schedule the next available slot,,.

### 4. The Ranking and Placement Contract
The platform uses a deterministic sorting logic to ensure fairness and search integrity.
*   **Bucket Hierarchy:**
    1.  **Featured:** Top of results. Renders as a **larger card**,.
    2.  **Pro:** "Priority placement." Renders as a **gold card** (same size as Basic),.
    3.  **Basic:** Standard placement. Neutral card design,.
    4.  **Unclaimed:** Bottom of results. Visually plain, labeled "Unclaimed listing," with a CTA to "Claim this listing",.
*   **The Verified Rule:** "Verified" (achieved via ABN check) is an overlay, not a bucket. A Verified creator **always** ranks above a non-verified creator *within their specific bucket*. (e.g., A Verified Basic > Non-Verified Basic, but does not beat a Pro),.

### 5. Design Constitution: Premium Minimalism
*   **Visual Strategy:** The UI relies on "bold minimalism"—editorial typography, precise spacing, and high-quality imagery—rather than ornamentation. It avoids "stock-hero" patterns (gradient blobs) and excessive glassmorphism,,.
*   **Mobile-First Ergonomics:** The core loop uses thumb-friendly bottom navigation. Filters must open as a **bottom sheet**, not a sidebar. Primary actions on Studio Pages (Save, Share, Shop) must be sticky,,.
*   **Mixed Collections:** When curating Studios and Products together, they must be separated into two distinct sections (via a toggle or divider) and never interleaved in a single list to preserve domain clarity,,.

### 6. Creator Mini-Sites
Creator public pages are designed to function as standalone portfolios ("Mini-sites") rather than social network pages.
*   **Structure:** Strict hierarchy of Identity → Proof (Portfolio) → Action (Shop/Contact).
*   **Templates:** Basic users get the Standard template; Pro users get the HighEnd template ("Pro Mini-site"). Switching templates changes layout but never hides core content,.

### 7. Admin and Enforcement (Solo-Operator)
The admin system is designed for a solo operator using "Enforcement & Conduct" workflows rather than dispute resolution.
*   **Escalation Ladder:** Warn → Delist → Suspend → Evict,.
*   **Automation:**
    *   **Allowed:** Automated warnings for credibility violations (e.g., "fake scale" text detection) and temporary protective suspensions for fraud signals.
    *   **Prohibited:** AI must never permanently ban/evict a user or silently change public rankings without human confirmation,.
*   **Philosophy:** The admin interface should feel "fast, boring, and deterministic".

### Analogy
Think of SuburbMates as a **curated design district**:
*   **The Architecture (Taxonomy):** There is strict zoning. Professional offices (Directory) are distinct from retail shops (Marketplace); you don't find a dentist's chair in a clothing boutique.
*   **The Real Estate (Tiers):** **Featured** tenants rent the massive billboards at the entrance. **Pro** tenants have gold signage and prime street-level spots. **Basic** tenants have standard storefronts. **Unclaimed** listings are the "For Lease" signs.
*   **The Management (Admin):** The landlord (Admin) ensures the building is safe (Enforcement) and the directory is accurate, but if you buy a faulty shirt from a shop, you return it to the shop owner (**Creator**), not the landlord.