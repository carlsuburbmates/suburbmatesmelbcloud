Here are the detailed logic and specifications for the **SuburbMates Monetization Architecture**, strictly adhering to your locked sources.

The platform operates on a **"Two Tiers + One Add-on"** model. There is no "Premium" tier; there is only **Basic**, **Pro**, and the **Featured** placement add-on.

### 1. The Subscription Tiers (Recurring)
The foundation of the platform is a binary creator tier system. All prices are in AUD and GST-inclusive.

#### **Basic Tier (The Entry Point)**
*   **Cost:** **Free** ($0).
*   **Inventory Quota:** Strictly capped at **3 products**.
*   **Platform Fee:** **8%** per sale (deducted automatically via Stripe Connect).
*   **Visual Identity:**
    *   **Public Label:** "Studio Page".
    *   **Card Design:** Standard size, neutral/standard styling.
    *   **Template:** Uses the Standard Template.
*   **Ranking:** Lowest priority bucket (displayed below Featured and Pro).
*   **Capabilities:** Full access to the Directory listing and Marketplace sales, subject to the 3-product cap.

#### **Pro Tier (The Upgrade)**
*   **Cost:** **$20 AUD** per **30 days** (auto-renewing subscription).
*   **Inventory Quota:** Strictly capped at **10 products**.
*   **Platform Fee:** **6%** per sale.
*   **Visual Identity:**
    *   **Public Label:** "Pro Mini-site" (unlocked mode of the Studio Page).
    *   **Card Design:** **Gold Card** treatment. Crucially, this card is the **same size** as the Basic card, just visually distinct (gold border/accent).
    *   **Template:** Unlocks the "HighEnd" template options.
*   **Ranking:** Priority placement. Pro cards always appear above Basic cards in search results.
*   **Exclusive Features:**
    *   **Share Kit:** Access to campaign links and QR modes.
    *   **Mini-site Editor:** Controls for spotlighting and "vibe knobs".

### 2. Featured Placement (The "Add-On")
Featured placement is a separate, non-recurring purchase available to both Basic and Pro users. It is a "digital real estate" purchase, not a subscription.

*   **Cost:** **$15 AUD** for **30 days** (non-recurring, manual re-purchase required).
*   **Scope:** **Council-based only** (LGA). It is not suburb-based or region-based.
*   **Hard Constraint:** Maximum **5 featured slots** per Council area at any one time. No exceptions.
*   **Visual Identity:**
    *   **Card Design:** **Larger card** than Pro or Basic (more media height, distinct layout).
    *   **Label:** Must explicitly state "Featured placement" or "Featured" to ensure middleman truth (no implied endorsement).
*   **Ranking:** The absolute top bucket. Featured cards always appear above Pro and Basic cards.

#### **The FIFO Queue Logic (Fairness Contract)**
Because slots are capped at 5, the system uses a **First-In-First-Out (FIFO)** scheduling system.
1.  **If a slot is open:** Purchase activates immediately.
2.  **If Council is full (5/5):** The user purchases a "reservation." They are added to the `featured_queue`.
3.  **Scheduling:** The system calculates the `start_date` based on when the current occupants expire. The UI must display "Scheduled for [Date]" rather than "Active Now".
4.  **Expiry & Reminders:** An automated email is sent **3 days before expiry**. This system is idempotent to prevent duplicate reminders.

### 3. The Global Ranking Contract
Monetization directly dictates the sorting order of the Directory. The "bucket order" is deterministic and hard-coded.

**The Hierarchy:**
1.  **Featured Bucket:** (Top) Large cards.
2.  **Pro Bucket:** (Middle) Gold cards, standard size.
3.  **Basic Bucket:** (Bottom) Neutral cards, standard size.
4.  **Unclaimed:** (Footer) Plain cards, strictly separated.

**The "Verified" Rule (Crucial nuance):**
"Verified" is **not** a paid tier; it is a trust status (ABN check).
*   **Logic:** Verified creators **always** outrank non-verified creators *within their specific bucket*.
*   **Example:** A "Verified Basic" user will rank higher than a "Non-Verified Basic" user, but they will *never* outrank a "Pro" user (even if the Pro is unverified).

### 4. Operational & Lifecycle Specifications
*   **Downgrades (Pro to Basic):**
    *   If a user cancels Pro, they retain Pro features (Mini-site, Gold card, 10 product limit) until the end of the current 30-day billing period.
    *   **At expiry:** The profile reverts to "Studio Page" (Basic) mode. Any "Pro-only" links (Share Kit) disable gracefully.
    *   **Inventory Overflow:** If a user downgrades while having >3 products, the system must handle the excess (typically by hiding/pausing the most recent, though specific "overflow" logic isn't explicitly detailed in the sources, the strict quota of 3 for Basic implies gating).
*   **Refunds:** There are **no refunds** for Pro or Featured purchases. Pro can be cancelled anytime to stop renewal; Featured expires automatically.
*   **Upgrade Gating:**
    *   Users hitting the 3-product limit on Basic are blocked from publishing more.
    *   The UI must present a "calm explanation + upgrade path," avoiding fake urgency.
    *   Drafts are allowed beyond the limit, but publishing is blocked.

### Analogy: The Shopping District
Think of the directory like a physical high street.

*   **Basic Tier (The Stall):** You get a standard 3x3m spot in the general market area. You can sell 3 items. It's free to set up, but the market manager takes a slightly larger cut (8%) of your sales.
*   **Pro Tier (The Boutique):** You pay rent ($20/mo). You get a shop with a **gold-painted storefront** (Gold Card) on a busier street (Priority Ranking). You can stock 10 items, and the manager takes a smaller cut (6%). You also get better tools to decorate your shop (Mini-site editor).
*   **Featured (The Billboard):** Regardless of whether you have a Stall or a Boutique, you can pay ($15) to rent one of the **5 massive billboards** at the town entrance (Council Area). These are physically larger than any shop. If all 5 are rented, you join a waiting list (FIFO) to grab the next one that becomes available.