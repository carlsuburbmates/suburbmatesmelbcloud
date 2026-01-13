# Site Map & Route Architecture

**Status:** VERIFIED (Matches SSOT & Codebase)  
**Date:** 2026-01-11  
**Purpose:** Defines the expected surface area of the application, including all public, private, and automated routes.

---

## 1. Public Routes (Visitor & Customer)
*Accessible to anyone. No login required.*

| Route | Page Name | Purpose | Key Features |
| :--- | :--- | :--- | :--- |
| `/` | **Home** | Land & Orient | Hero search, Featured listings, Value prop. |
| `/directory` | **Directory** | Browse & Search | Filter by Council/Category, Map view, Ranking logic (Featured > Pro > Basic). |
| `/u/[slug]` | **Studio Page / Mini-site** | Creator Profile | **Basic:** Standard layout, Products list.<br>**Pro:** Mini-site layout, Pinned content ("Spotlight"), Custom vibe. |
| `/product/[id]` | **Product Detail** | Purchase Intent | "Sold by [Creator]" truth label, "Add to Cart" / "Buy Now" (Stripe), Description, Images. |
| `/marketplace` | **Marketplace** | Product Discovery | Global feed of all products (secondary discovery surface). |
| `/about` | **About** | Trust & Mission | Manifesto, Platform rules ("Middleman Truth"). |
| `/pricing` | **Pricing** | Sales | Compare Basic vs Pro tiers. CTA to Claim/Register. |
| `/faq` | **FAQ** | Support | Common questions (Buyer & Creator). |
| `/trust` | **Trust & Safety** | Policy | Explanation of Verification, Triage, and "Truth UI". |
| `/articles/*` | **Articles** | Content | SEO content and guides. |
| `/legal/*` | **Legal** | Compliance | Terms of Service, Privacy Policy, Creator Policy. |

---

## 2. Authentication, Onboarding & Logic
*Entry points and critical redirects.*

| Route | Page Name | Purpose | Key Features |
| :--- | :--- | :--- | :--- |
| `/auth/login` | **Login** | Sign In | Email/Password, Helper links. |
| `/auth/register` | **Register** | Join | Visitor → User conversion. Email verification trigger. |
| `/auth/forgot-password` | **Recovery** | Account Access | Password reset flow. |
| `/claim/[id]` | **Claim Listing** | Claim Flow | **Destination for Unclaimed Listings.** Verification pre-check. Transitions User to Creator. |
| `/listing/[id]` | **Permalink** | Routing Utility | Redirects to `/u/[slug]` if Live. Redirects to `/claim/[id]` if Unclaimed. |

---

## 3. Creator Studio (Private)
*Accessible only to logged-in Creators involved with a Listing.*

| Route | Page Name | Lifecycle Stage | Key Features |
| :--- | :--- | :--- | :--- |
| `/studio` | **Dashboard** | All | Overview of Listing status (Live/Review), Plan (Basic/Pro), Product count. |
| `/studio/onboarding/[id]` | **Listing Details** | S0 (Incomplete) / All | **The Core Editor.** <br>1. Business Identity (Name, Category, Location) <br>2. Contact Details (Phone, Email, Website) <br>3. **ABN Verification (Input & Status)**  <br>4. Description. |
| `/studio/products` | **Product Manager** | All | CRUD operations. Enforce limits (Basic: 3, Pro: 10). |
| `/studio/design` | **Mini-site Editor** | S3 (Pro) | **Pro Only:** Vibe tuner, Spotlight config, Layout toggles. |
| `/studio/share` | **Share Kit** | S3 (Pro) | **Pro Only:** QR codes, Campaign links, Deep links. |
| `/studio/promote` | **Promote** | S2 (Optimised) | Purchase **Featured Placement** ($15/mo). FIFO Queue status check. |
| `/studio/billing` | **Billing** | All | Upgrade to Pro ($20/mo), Manage Subscription (Stripe Portal), Invoice history. |

---

## 4. Operator Console (Private)
*Accessible only to Users with `role: operator`.*

| Route | Page Name | Purpose | Key Features |
| :--- | :--- | :--- | :--- |
| `/admin` | **God Mode** | Global Oversight | High-level metrics, Health check. |
| `/admin/triage` | **Triage Queue** | Safety | Review "Under Review" listings. Accept/Reject claims. |
| `/admin/users` | **User Management** | Enforcement | Search users. Actions: Warn, Delist, Suspend, Evict. |
| `/admin/featured` | **Featured Queue** | Fairness | Monitor FIFO queue usage per Council. |
| `/admin/reports` | **Reports** | Community Safety | Review user-submitted flags. |

---

## 5. Automation & Monetization Surfaces
*Headless or Third-Party Interactions.*

| Endpoint / Surface | Type | Purpose | Logic Owner |
| :--- | :--- | :--- | :--- |
| `api/stripe/webhook` | **Webhook** | State Sync | Listens for `checkout.completed` (Pro/Featured), `subscription.updated` (Tier Sync), `invoice.payment_failed` (Downgrade). |
| `api/cron/featured` | **Cron** | Queue Rotation | Nightly rotation of Featured slots (Expires old, Activates queued). |
| `api/auth/*` | **Auth API** | Identity | Supabase Auth endpoints (callback, etc). |
| **Stripe Checkout** | **External UI** | Payments | Hosted payment page for subscriptions and one-off Featured purchases. |
| **Stripe Portal** | **External UI** | Self-Service | User manages their own card details and cancellations. |
| **Email System** | **Notification** | Comms | Auth emails, "Featured Slot Active" alerts, "Pro Expiring" warnings, "Listing Claimed" confirmation. |

---

## 6. SSOT References
*   `docs/SSOT/CANONICAL_TERMINOLOGY.md`
*   `docs/SSOT/CREATOR_STUDIO_SPEC.md`
*   `docs/SSOT/MINI_SITE_ENGINE_SPEC.md`
*   `docs/SSOT/OPERATOR_AND_ADMIN_AUTOMATION.md`
*   `docs/SSOT/PUBLIC_UX_CONTRACT.md`
*   `monetisation.md`
