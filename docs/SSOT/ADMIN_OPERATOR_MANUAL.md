# ADMIN & OPERATOR MANUAL
**Status:** DRAFT (Verified)
**Date:** 2026-01-10
**System Version:** v1.0 (Automation-First)

---

## 1. Executive Summary
This specific implementation of SuburbMates is engineered for a **Solo Operator**. 
Where traditional platforms require teams of moderators, this system uses **Event-Driven Automation** and **AI Triage** to suppress noise and surface only actionable signals.

**Key Principle:** The Operator should never "browse" for work. work is pushed to the Triage Queue.

---

## 2. The Command Center (Admin Dashboard)
**URL:** `/admin`
**Access:** Restricted to users with `role: operator` in `users_public`.

### 2.1 Core Screens
| Path | Function | Key Actions |
| :--- | :--- | :--- |
| **`/admin`** | **Triage Queue** | Approve/Flag Listings, View AI Severity Scores. |
| **`/admin/users`** | **User Registry** | Search Users, View Stripe Status, **Evict/Ban**. |
| **`/admin/reports`** | **Concern Inbox** | Review user-submitted reports. Update status. |
| **`/admin/audit`** | **Flight Recorder** | Immutable log of *every* admin action. |

---

## 3. Automation Wiring Diagram (The "Invisible Hand")

### 3.1 Monetization Automation
* **Trigger 1: Pro Subscription:** User upgrades via Stripe.
* **Webhook:** `app/api/stripe/webhook/route.ts` (Handles `checkout.session.completed` & `customer.subscription.updated`).
* **Actions:**
    1.  Updates `users_public.stripe_subscription_status`.
    2.  **Auto-Upgrades:** Sets `listings.tier` to 'Pro'.
        *   *Downgrade Logic:* If payment fails or sub cancels, reverts tier to 'Basic' automatically.
    3.  **Sends Email:** `sendProActivatedEmail` (Welcome) or `sendProExpiredEmail`.

* **Trigger 2: Featured Placement (FIFO):** User buys placement via Stripe `payment` mode.
* **Webhook:** `app/api/stripe/webhook/route.ts` (Handles `checkout.session.completed` with `purchase_type: 'featured_placement'`).
* **Actions:**
    1.  **Capacity Check:** Counts active featured items in that specific `location`.
    2.  **FIFO Logic:**
        *   **If < 5 Active:** Activates immediately (`status: active`).
        *   **If >= 5 Active:** Queues item (`status: pending`).
    3.  **Scheduling:** Calculates `start_date` based on the *earliest expiry* of current items to ensure gaps are filled.
    4.  **Sends Email:** 
        *   `sendFeaturedActiveEmail` (If live now).
        *   `sendFeaturedQueuedEmail` (If queued, includes estimated start date).

### 3.2 Verification Automation
* **Trigger:** User Enters ABN in Studio.
* **Logic:** `lib/admin/abn.ts` (Luhn Algorithm).
* **Actions:**
    1.  Validates Checksum.
    2.  **Auto-Verifies:** If valid, `listings.is_verified = true`.
    3.  **Audit Log:** Records `VERIFY_ABN_SUCCESS`.

### 3.3 Enforcement Ladder (Safety)
* **Trigger:** Operator clicks "Evict" in `/admin/users`.
* **Logic:** `app/actions/admin-users.ts` -> `evictUser`.
* **Actions:**
    1.  Sets `is_evicted = true`.
    2.  Sets `is_suspended = true`.
    3.  **Blocks Login:** Disables Auth user.
    4.  **Sends Email:** `sendEnforcementEvictionEmail` (Automatic Notice).
    5.  **Audit Log:** Records `EVICT_USER`.

---
### 3.4 Appeals (Exception Handling)
* **Trigger:** User replies to Eviction/Ban email.
* **Process:** Manual Email Loop (No UI).
* **Policy:** Operator reviews evidence. If valid, manually resets `is_evicted` via database or future UI.
* **Ref:** `OPERATOR_AND_ADMIN_AUTOMATION.md` (Section 3.1: Manual review reserved for appeals).

---

## 4. AI Copilot Implementation
**Location:** `/admin` (Sidebar/Floating)
**Brain:** `lib/ai/copilot.ts` + `app/api/ai/copilot/route.ts`

### 4.1 Context Injection
The AI is not generic. It is fed real-time DB stats on every request:
- `pendingTriageCount`: Number of listings waiting.
- `activeListings`: Total live supply.
- `recentSignups`: Growth velocity.

### 4.2 Capabilities
- **Triage Assistant:** Asking "What should I do?" causes the AI to check the Triage queue first.
- **Drafting:** Can draft rejection emails or policy notices based on platform rules.

---

## 5. Troubleshooting Guide

### 5.1 "Emails aren't sending"
*   **Check:** `.env.local`
*   **Variable:** `RESEND_API_KEY`
*   **Verify:** Must be a valid key. If using the Free Tier of Resend, you can ONLY send to your own registered email.
*   **Fix:** Check Server Logs for `[Resend] Email sent to...`.

### 5.2 "AI Copilot says 'System Offline'"
*   **Check:** `.env.local`
*   **Variable:** `Z_AI_API_KEY`
*   **Verify:** The API key must be valid for `https://api.z.ai/api/paas/v4`.
*   **Fallback:** The system operates 100% correctly without AI. AI is purely advisory.

### 5.3 "Stripe Webhooks aren't firing locally"
*   **Cause:** Localhost cannot receive public events.
*   **Fix:** Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
*   **Variable:** Update `STRIPE_WEBHOOK_SECRET` in `.env.local` with the CLI output secret.

---

## 6. Deliverable Checklist (Verified)
- [x] **Secure Admin Routes** (Middleware + RLS)
- [x] **Automated Audit Logging** (DB Triggers + Action Hooks)
- [x] **Payment -> Email Loop** (Stripe Webhook -> Resend)
- [x] **Eviction -> Email Loop** (Admin Action -> Resend)
- [x] **ABN Verification** (Algorithmic Logic)
- [x] **User Reporting System** (Public Form -> Admin Table)
- [x] **Featured Placement Engine** (FIFO Queuing + Capacity Logic)

*Signed: Automation Agent (Antigravity)*
