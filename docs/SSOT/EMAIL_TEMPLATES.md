# System Email Catalogue

This document catalogs every automated email sent by the platform. These emails are defined in `lib/email.ts` and triggered by specific system events.

## 1. Onboarding & Claiming
| Function | Generated Subject | Trigger |
| :--- | :--- | :--- |
| `sendWelcomeEmail` | Welcome to SuburbMates | User Signs Up (Auth) |
| `sendListingClaimedEmail` | Listing Claimed ✅ | User successfully claims a listing via ABN |

## 2. Verification & Triage
| Function | Generated Subject | Trigger |
| :--- | :--- | :--- |
| `sendListingApprovedEmail` | Listing Approved 🟢 | Operator clicks "Safe" in Triage |
| `sendListingRejectedEmail` | Action Required: Listing Hidden 🔴 | Operator clicks "Flag" in Triage |

## 3. Monetization (Pro & Featured)
| Function | Generated Subject | Trigger |
| :--- | :--- | :--- |
| `sendProActivatedEmail` | Pro Activated | Stripe Checkout `session.completed` (Subscription) |
| `sendProExpiryUpcomingEmail` | Subscription Notice | Stripe Webhook: 3 days before renewal |
| `sendProExpiredEmail` | Subscription Ended | Stripe Webhook: `customer.subscription.deleted` |
| `sendPaymentFailedEmail` | Action Required: Payment Failed | Stripe Webhook: `invoice.payment_failed` |
| `sendFeaturedActiveEmail` | Featured Placement Active | Stripe Checkout (FIFO Slot Available) |
| `sendFeaturedQueuedEmail` | Placement Reserved | Stripe Checkout (FIFO Slot Full) |

## 4. Safety & Trust
| Function | Generated Subject | Trigger |
| :--- | :--- | :--- |
| `sendReportReceivedEmail` | Report Received | User submits form at `/admin/reports` |

## 5. Enforcement Ladder
| Function | Generated Subject | Trigger |
| :--- | :--- | :--- |
| `sendEnforcementWarningEmail` | Platform Warning | Operator Action: Warn User |
| `sendEnforcementSuspensionEmail`| Account Suspended | Operator Action: Suspend User |
| `sendEnforcementEvictionEmail` | Account Terminated | Operator Action: Evict User |

---
**Note:** All emails are sent via `Resend`. Templates use a shared style system with a standard footer.
