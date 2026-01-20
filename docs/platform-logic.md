# Platform Logic - SuburbMates Melbourne

**Status:** NON-AUTHORITATIVE - For implementation details, defer to `docs/SSOT/**`  
**Last Updated:** January 2026  
**Purpose:** Comprehensive synthesis of platform logic, taxonomy, and operational rules

---

## 1. Core Identity and Trust Architecture

### The "Mall Model"

SuburbMates functions as a **venue**, not a merchant. It aggregates listings and facilitates discovery, but the transaction contract is strictly between the **Buyer** and the **Creator**.

**Key Implications:**
- Every product page **must** explicitly state: *"Sold by [Creator]. Payments processed by Stripe"*
- Platform provides: Visibility, Infrastructure, Credibility gates
- Creators provide: Products, Fulfillment, Support
- SuburbMates is **NOT** the merchant of record

### No Fake Signals ("Truth UI")

The design constitution forbids:
- ❌ Fake scale metrics (e.g., "trusted by thousands")
- ❌ Artificial urgency (countdown timers, "only 2 left")
- ❌ Inflated claims or endorsements
- ❌ AI-generated authority signals

**"Alive" Definition:**
- Defined by **real data freshness**: new drops, updated Studio Pages, recent activity
- NOT by decorative motion, carousels, or animated badges

### Support Pathways (Middleman Truth)

To enforce the middleman role, support is split into **two distinct lanes**:

1. **"Get help with this purchase"** → Routes directly to the **Creator**
2. **"Report a platform concern"** → Routes to the **Operator** (for fraud, scams, policy enforcement)

This separation ensures the platform never intermediates in Creator-Customer disputes.

---

## 2. The Two-Domain Taxonomy

To prevent data pollution, SuburbMates enforces **strict separation** between Business entities and Product inventory.

### Business Domain (The Directory)

**16 Business Categories:**
1. Brand Identity
2. Web Design
3. UI/UX Design
4. Illustration
5. Photography
6. Videography
7. Audio Production
8. Animation
9. Social Media Management
10. Copywriting
11. Content Marketing
12. SEO & Strategy
13. Web Development
14. No-Code Automation
15. App Development
16. Business Consulting

**Usage:**
- Acts as hard filters for Studios and Unclaimed Listings
- A **Listing** must use a business category
- Business categories **cannot** be used for Products

### Product Domain (The Marketplace)

**6 Product Categories:**
1. Templates & Systems
2. Design & Creative Assets
3. Media Assets
4. Education & Guides
5. Software & Tools
6. Other Digital Products

**Usage:**
- Applied only to digital goods sold by Creators
- Products **must** use a product category
- Product categories **cannot** be used for Listings

### Cross-Contamination Ban (CRITICAL)

**Forbidden:**
- ❌ An unclaimed listing cannot sell products
- ❌ A product cannot be labeled with a business category (e.g., "Plumber")
- ❌ Mixing business and product categories in search filters

**Enforced by:**
- Database triggers: `listings_check_category_type`, `products_check_category_type`
- Server-side validation in all CRUD operations

---

## 3. Monetization and Tiers

There are **strictly two subscription tiers** and **one paid placement add-on**.

### Basic (Free)

- **Cost**: $0
- **Product Limit**: 3 products maximum
- **Platform Fee**: 8% per sale
- **Features**:
  - Public Studio Page
  - Standard card design
  - Directory listing
  - Marketplace access

### Pro ($20 AUD/30 days)

- **Cost**: $20 AUD per 30 days (auto-renewing subscription)
- **Product Limit**: 10 products maximum
- **Platform Fee**: 6% per sale
- **Features**:
  - Pro Mini-site (HighEnd template)
  - Gold card treatment
  - Priority ranking
  - Share Kit (campaign links, QR codes, deep links)
  - Mini-site Editor (Vibe tuner, Spotlight)

**Lifecycle:**
- Subscription managed via Stripe
- Downgrade at period end if cancelled
- Immediate tier sync on payment success
- Graceful degradation on Pro → Basic

### Featured Placement ($15 AUD/30 days)

- **Cost**: $15 AUD for 30 days (non-recurring, manual re-purchase required)
- **Eligibility**: Must be in **Stage S2: Optimised**
  - Requires: Description, Contact info, 1+ public product, Category confirmed, Policy accepted
- **Scope**: Council-based only (LGA), not suburb-based
- **Hard Constraint**: **Maximum 5 slots per Council area** at any one time
- **Visual Identity**:
  - Larger card than Pro or Basic
  - Explicit "Featured placement" label (paid transparency)
  - Top placement in directory

### FIFO Queue Logic (Fairness Contract)

**When Council has < 5 featured slots:**
1. Purchase activates **immediately**
2. `featured_queue` status: `active`
3. `listings.featured_until` set to +30 days

**When Council is full (5/5):**
1. Purchase creates **reservation**
2. Added to `featured_queue` with status: `pending`
3. System calculates `start_date` based on current occupants' expiry
4. UI displays: *"Scheduled for [Date]"* (not "Active Now")

**Expiry & Reminders:**
- Automated email sent **3 days before expiry**
- System is idempotent (prevents duplicate reminders)
- Cron job rotates queue nightly: Expires old → Activates queued

---

## 4. The Ranking and Placement Contract

The platform uses **deterministic sorting logic** to ensure fairness and search integrity.

### Bucket Hierarchy

**Directory Ranking (Top to Bottom):**

1. **Featured** (Top)
   - Larger card design
   - Explicit "Featured" badge
   - Max 5 per Council (LGA)

2. **Pro** (Priority)
   - Gold card treatment
   - **Same size** as Basic (only visual distinction)
   - Priority placement within bucket

3. **Basic** (Standard)
   - Neutral card design
   - Standard placement

4. **Unclaimed** (Bottom)
   - Visually plain
   - Labeled "Unclaimed listing"
   - CTA: "Claim this listing"

### The Verified Rule (Overlay, Not Bucket)

**"ABN Verified"** is an overlay status, not a ranking bucket.

**Logic:**
- A **Verified creator** always ranks above a **non-verified creator** *within their specific bucket*
- Example:
  - ✅ Verified Basic > Non-Verified Basic
  - ❌ Verified Basic does **NOT** outrank Pro (even if Pro is unverified)

**Verification Criteria:**
- Valid ABN (11 digits)
- Passes Luhn algorithm checksum
- Automated validation on claim

---

## 5. Creator Lifecycle (S-Stages)

Creators progress through **4 stages** (S0 → S3) based on data completeness and subscription status.

| Stage | Name | Criteria | Unlocks |
|-------|------|----------|---------|
| **S0** | Incomplete | Missing required fields | Nothing (page hidden) |
| **S1** | Live (Basic) | Name + Category + Location | Public Studio Page |
| **S2** | Optimised | S1 + Description + Contact + 1 Product + Category confirmed + Policy accepted | **Featured Placement** |
| **S3** | Pro-enabled | Active Pro subscription | Mini-site, Share Kit, Spotlight |

**Implementation**: `lib/studio-logic.ts`

**Progression/Regression:**
- Automated based on data completeness
- No manual approval required (unless flagged by triage)
- Graceful degradation on subscription cancellation

---

## 6. Design Constitution: Premium Minimalism

### Visual Strategy

The UI relies on **"bold minimalism"**:
- Editorial typography (Inter Tight, Cormorant Garamond)
- Precise spacing (modular scale)
- High-quality imagery (no stock hero patterns)

**Avoid:**
- Gradient blobs or ornamentation
- Excessive glassmorphism
- Generic AI template aesthetics

### Mobile-First Ergonomics

- **Core Loop**: Thumb-friendly bottom navigation
- **Filters**: Must open as **bottom sheet**, not sidebar
- **Primary Actions**: Sticky on Studio Pages (Save, Share, Shop)

### Mixed Collections

When curating **Studios and Products together**:
- Must be **separated into two distinct sections** (via toggle or divider)
- **Never interleaved** in a single list (preserves domain clarity)

---

## 7. Creator Mini-Sites

Creator public pages function as **standalone portfolios** ("Mini-sites"), not social network pages.

### Structure

**Strict Hierarchy:**
1. **Identity** → Who is this?
2. **Proof (Portfolio)** → Why trust this?
3. **Action** → What can I do? (Shop/Contact)

### Templates

| Tier | Template | Features |
|------|----------|----------|
| **Basic** | Standard | Fixed layout, standard spacing |
| **Pro** | HighEnd ("Pro Mini-site") | Custom vibe tuner, Spotlight system, enhanced layout |

**Important:**
- Switching templates changes **layout only**
- Core content is **never hidden**
- Same URL (`/u/[slug]`) for both tiers

### Product Details

All product cards route to a **dedicated detail page**:
- Route: `/product/[id]`
- Truth label: *"Sold by [Creator]"*
- Clear payment processor: *"Payments processed by Stripe"*

---

## 8. Admin and Enforcement (Solo-Operator)

The admin system is designed for a **solo operator** using "Enforcement & Conduct" workflows rather than dispute resolution.

### Escalation Ladder

**Progressive Enforcement:**
1. **Warn** → Email notification, warning count incremented
2. **Delist** → Listing hidden from directory, Creator notified
3. **Suspend** → Account suspended (time-bound), all listings hidden
4. **Evict** → Permanent termination, account closed

### Automation Philosophy

**Allowed:**
- ✅ Automated warnings for credibility violations (e.g., "fake scale" text detection)
- ✅ Temporary protective suspensions for fraud signals (with operator review)
- ✅ Email notifications for enforcement actions

**Prohibited:**
- ❌ AI must **never** permanently ban/evict a user without human confirmation
- ❌ AI must **never** silently change public rankings
- ❌ AI must **never** modify listing content automatically

### Admin Interface Philosophy

*"Fast, boring, and deterministic"*

- Triage queue (not browsing for work)
- AI-powered severity scoring (advisory only)
- Audit log for all actions (immutable)
- Minimal clicks for common actions

---

## 9. Search Architecture

### Discovery Philosophy

SuburbMates is built on a **search-first discovery** model.

**Primary Method**: Search bar  
**Secondary Methods**: Browsing, filtering

**Taxonomy Role:**
- **Categories** are **filters**: Fixed, top-level taxonomy to narrow broad areas
- **Tags** are **helpers**: Flexible, user-generated keywords for context

### Implementation

**Technology**: PostgreSQL Full-Text Search (FTS) only
- No third-party services (Algolia, Elasticsearch)
- Uses `tsvector` columns: `listings.search_vector`, `products.search_vector`

**Indexed Fields:**

**Listings:**
- Name
- Description
- Category Name (from `categories` table)
- Tag Names (from `tags` table)

**Products:**
- Name
- Description
- Category Name (from `categories` table)
- Tag Names (from `tags` table)

**RPCs:**
- `search_listings(search_query, category_filter, limit_val, offset_val)`
- `search_products(search_query, category_filter, min_price, max_price, limit_val, offset_val)`

---

## 10. Geographic Scope (Melbourne-Specific)

### Council-Based Organization

SuburbMates uses **Local Government Areas (LGAs)** as the primary geographic unit.

**22 Melbourne Councils:**
- Inner City: Melbourne, Port Phillip, Yarra
- Northern: Banyule, Darebin, Hume, Merri-bek, Whittlesea, Nillumbik
- Eastern: Boroondara, Knox, Manningham, Maroondah, Whitehorse, Yarra Ranges
- Southeastern: Bayside, Glen Eira, Kingston, Casey, Frankston, Cardinia, Mornington Peninsula
- Western: Brimbank, Hobsons Bay, Maribyrnong, Melton, Moonee Valley, Wyndham

**Usage:**
- Featured placement is **Council-scoped** (not suburb-scoped)
- Directory filtering by Council area
- Council data in `lib/councils.ts`

---

## 11. Email System

### Email Categories

**Onboarding:**
- Welcome (user signup)
- Listing Claimed (successful claim)

**Verification:**
- Approved (listing goes live)
- Rejected (listing flagged)

**Monetization:**
- Pro Activated
- Pro Expiring (3 days before renewal)
- Pro Expired (subscription ended)
- Payment Failed

**Featured:**
- Active (placement live now)
- Queued (reservation confirmed, scheduled start date)
- Expiring Soon (3 days before expiry)

**Safety:**
- Report Received (user-submitted report acknowledged)

**Enforcement:**
- Warning (first violation)
- Suspension (temporary account suspension)
- Eviction (permanent termination)

**Implementation:** `lib/email.ts`  
**Provider:** Resend  
**Catalogue:** `docs/SSOT/EMAIL_TEMPLATES.md`

---

## 12. Stripe Integration

### Subscription Flow (Pro)

1. User clicks "Upgrade to Pro" in `/studio/billing`
2. Server creates Stripe Checkout session (mode: `subscription`)
3. User completes payment on Stripe Checkout
4. Webhook: `checkout.session.completed` → Update `users_public.stripe_subscription_status`
5. Webhook: `customer.subscription.updated` → Sync `listings.tier` to 'Pro'
6. Email: Pro Activated

### Featured Placement Flow

1. User clicks "Purchase Featured" in `/studio/promote` (S2 required)
2. Server checks availability via RPC: `check_featured_availability(council)`
3. Server creates Stripe Checkout session (mode: `payment`, metadata: `purchase_type=featured_placement`)
4. User completes payment
5. Webhook: `checkout.session.completed` → Insert into `featured_queue`
6. **If < 5 active**: Status `active`, sync `listings.featured_until`
7. **If >= 5 active**: Status `pending`, calculate scheduled start date
8. Email: Featured Active OR Queued

### Marketplace Flow (Stripe Connect)

1. Creator onboards to Stripe Connect (creates Connect account)
2. Customer adds Product to cart
3. Customer checks out via `/api/checkout`
4. Server creates Checkout session with **destination charge**:
   - `payment_intent_data.destination` → Creator's Connect account
   - `payment_intent_data.application_fee_amount` → Platform fee (6% or 8%)
5. Webhook: `checkout.session.completed` → Mark order as `paid`
6. Stripe automatically routes funds:
   - Platform fee → Platform account
   - Net amount → Creator's Connect account

**Handler:** `app/api/stripe/webhook/route.ts`

---

## 13. AI & Automation

### Z.ai Integration

**Purpose**: Application-level AI features (chat, auto-generation, triage)

**Provider**: Vercel AI SDK → Z.ai PaaS (OpenAI-compatible)

**Configuration:**
- Provider: `lib/ai/z-ai-provider.ts`
- Actions: `actions/z-ai-actions.ts`
- API Route: `app/api/chat/route.ts`

**Usage Patterns:**
```typescript
// Server Actions
import { runZaiAutomation } from '@/actions/z-ai-actions';
const verdict = await runZaiAutomation("Analyze this listing...");

// Chat UI
import { useChat } from '@ai-sdk/react';
const { messages } = useChat({ api: '/api/chat' });
```

**Future: Auto-Triage**
- User submits listing
- Webhook triggers server action
- AI analyzes description for prohibited content
- Returns JSON verdict: `{ safe: boolean, reason: string }`
- Update `listings.triage_status` → 'safe' | 'flagged'

### MCP (Model Context Protocol)

**Purpose**: Local development assistance, external tool integration

**Available Servers:**
- GitHub, Supabase, Stripe, Resend, Mapbox, Playwright, Next.js

**Use Cases:**
- Check Stripe products/subscriptions without manual API calls
- Verify email logs via Resend MCP
- Quick database schema inspection (read-only)

---

## 14. Analogy: The Shopping District

Think of SuburbMates as a **curated design district**:

### The Architecture (Taxonomy)
There is **strict zoning**:
- Professional offices (Directory) are distinct from retail shops (Marketplace)
- You don't find a dentist's chair in a clothing boutique

### The Real Estate (Tiers)
- **Featured** tenants rent the massive billboards at the entrance (max 5, FIFO queue)
- **Pro** tenants have gold signage and prime street-level spots
- **Basic** tenants have standard storefronts (free)
- **Unclaimed** listings are the "For Lease" signs (awaiting claim)

### The Management (Admin)
The landlord (Operator) ensures:
- ✅ The building is safe (Enforcement)
- ✅ The directory is accurate (Verification)

**But:**
- ❌ If you buy a faulty product from a shop, you return it to the **shop owner (Creator)**, not the landlord
- The platform is the venue, not the merchant

---

## 15. Key Operational Rules

### Feature Gating

Use `isFeatureUnlocked(listing, feature)` from `lib/studio-logic.ts`:

| Feature | Required Stage |
|---------|----------------|
| `mini_site` | S3 (Pro) |
| `share_kit` | S3 (Pro) |
| `featured_placement` | S2 (Optimised) or S3 (Pro) |

### Product Limits

Enforced by database trigger: `check_product_limit_trigger`

| Tier | Max Products |
|------|--------------|
| Basic | 3 |
| Pro | 10 |

**Behavior on Downgrade (Pro → Basic):**
- User retains Pro features until period end
- At expiry: Excess products (>3) are **paused/hidden** (not deleted)
- Creator notified to remove excess before publishing more

### Tag Limits

Enforced by database triggers:
- Max **3 tags per listing** (`listing_tags_check_limit`)
- Max **3 tags per product** (`product_tags_check_limit`)

### ABN Verification

**Algorithm**: Luhn checksum validation
- 11 digits required
- Subtract 1 from first digit
- Multiply by weights: [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
- Sum must be divisible by 89

**Implementation**: `actions/claim-listing.ts`

**Outcome:**
- Valid → `listings.is_verified = true`, `listings.abn = <value>`
- Invalid → Claim rejected with error message

---

## 16. Forbidden Patterns

### Language (CANONICAL_TERMINOLOGY.md)

**NEVER use:**
- "profile" → Use "Studio Page" or "Mini-site"
- "vendor" → Use "Creator"
- "business profile" → Use "Listing"
- "admin" (public) → Use "Operator" (internal only)
- "account" → Use "User" or role-specific term

### Database Operations

**NEVER:**
- Run SQL directly on production (use migrations)
- Use generic `profiles` table (use `users_public`)
- Mix business and product categories
- Exceed product limits without tier check

### UI Patterns

**NEVER:**
- Use fake metrics or urgency timers
- Hide "Sold by [Creator]" attribution
- Interleave Studios and Products in a single list
- Show Pro features to Basic users without upgrade prompt

---

## Summary

SuburbMates Melbourne is a **high-trust, automation-first platform** that:
- Operates as a **Mall** (venue, not merchant)
- Enforces **strict taxonomy** (Business vs Product separation)
- Uses **deterministic ranking** (Featured > Pro > Basic > Unclaimed)
- Implements **progressive creator lifecycle** (S0 → S3)
- Maintains **FIFO fairness** (Featured queue, max 5 per Council)
- Follows **Truth UI** (no fake signals)
- Supports **solo operator** (AI-assisted triage, automation)

**For authoritative implementation details, always defer to `docs/SSOT/**` documents.**
