USER_MODEL_AND_STATE_MACHINE.md

User Model & State Machine — SuburbMates

Status: LOCKED (SSOT)
Authority Level: High (Subordinate only to Product Constitution & Canonical Terminology)
Audience: Product, Design, Automation, Operator
Change Rule: Amendments require explicit migration impact review

⸻

1. Purpose

This document defines:
	•	Who exists in the system (actors)
	•	What exists in the system (entities)
	•	How entities change state
	•	What permissions unlock at each state

It prevents:
	•       Role confusion (e.g. “Customer vs Creator vs Operator”)
	•	UX leaks (showing actions that aren’t valid yet)
	•	Automation bugs caused by ambiguous states

⸻

2. Actors (People)

2.1 Visitor

Definition:
Any unauthenticated or authenticated user browsing the platform.

Capabilities:
	•	Browse Directory (Listings)
	•	View Studio pages / Mini-sites
	•	View Products
	•	Share links
	•	Report platform concerns

Explicit limitations:
	•	Cannot claim listings
	•	Cannot purchase without authentication (if required by payment flow)
	•	Cannot manage content

⸻

2.2 Customer

Definition:
A Visitor who purchases a Product.

Capabilities:
	•	Purchase Products
	•	Receive fulfilment from Creator
	•	Contact Creator for purchase-related support

Explicit limitations:
	•	No platform-level support guarantees
	•	No refund arbitration by SuburbMates

⸻

2.3 Creator

Definition:
A registered user who has claimed a Listing and owns a Studio.

Capabilities (Basic):
	•	Access Studio (private workspace)
	•	Edit listing/business information
	•	Publish limited Products
	•	Maintain a Studio page (public)

Capabilities (Pro):
	•	All Basic capabilities
	•	Unlock Mini-site mode
	•	Configure Spotlight
	•	Use Share Kit
	•	Advanced ordering and pinning
	•	Theme “Vibe” tuning

⸻

2.4 Operator

Definition:
The internal platform operator.

Capabilities:
	•	Access Operator Dashboard
	•	Review verification status
	•	Enforce platform rules
	•	Override edge cases
	•	View audit logs

Explicit limitations:
	•	Does not manage Creator products
	•	Does not fulfil orders
	•	Does not provide customer support

⸻

3. Core Entities (Objects)

3.1 Listing

Definition:
A Directory entity representing a local business.

Key properties:
	•	May be unclaimed or claimed
	•	Exists independently of user registration
	•	Is the anchor for discovery

⸻

3.2 Studio

Definition:
The private workspace associated with a claimed Listing.

Exists when:
A Listing is claimed and a Creator is registered.

Contains:
	•	Business information
	•	Product management
	•	Mini-site editor (Pro)
	•	Verification status
	•	Share tools

⸻

3.3 Studio Page / Mini-site

Definition:
The public rendering of a claimed Listing.

Modes:
	•	Studio page (Basic) — default
	•	Mini-site (Pro) — unlocked mode at same URL

⸻

3.4 Product

Definition:
A digital good sold by a Creator.

Ownership:
Always owned and fulfilled by the Creator.

⸻

3.5 Collection

Definition:
A curated public grouping of Listings and/or Products.

⸻

4. Core User Lifecycle Workflows

This section defines the standard, deterministic workflows for user account management.

4.1 User Registration & Onboarding

This workflow describes how a `Visitor` becomes a registered user, enabling them to become a `Creator` by claiming a listing.

1.  **Initiation:** The user provides a valid email address and a secure password.
2.  **Verification:** The system sends a verification email containing a unique, single-use link to the provided address.
3.  **Confirmation:** The user must click the verification link to confirm ownership of the email address.
4.  **Completion:** Once confirmed, the user is considered registered. They can now log in and begin the Listing Claim process to become a `Creator`.

4.2 User Authentication (Login)

This workflow describes how a registered user signs in.

1.  **Credentials:** The user provides their registered email address and password.
2.  **Validation:** The system validates the credentials against the stored user data.
3.  **Session:** Upon success, the system issues a JWT to manage the user's session, consistent with Supabase Auth standards.
4.  **Failure:** Upon failure, a generic "Invalid credentials" error is displayed.

4.3 Password Reset

This workflow is for registered users who have forgotten their password.

1.  **Initiation:** The user provides their registered email address on the "Forgot Password" page.
2.  **Token Generation:** The system generates a unique, time-sensitive password reset token and sends it to the user's email address.
3.  **Redirection:** The user clicks the link in the email, which directs them to a secure page to set a new password.
4.  **Completion:** The user enters and confirms a new password. Upon submission, the old password is invalidated, and the new password becomes active.

4.4 Creator Offboarding (Account Deactivation)

This workflow defines how a `Creator` can deactivate their account.

1.  **Initiation:** The `Creator` navigates to their Studio settings and requests deactivation.
2.  **Confirmation:** The user must confirm this action through a modal dialog that clearly explains the consequences.
3.  **Execution (Non-Destructive):**
    *   The `Creator` user account is marked as `inactive` and can no longer be logged into.
    *   The associated `Listing` reverts to the `Unclaimed` state and remains in the directory.
    *   All `Products` owned by the `Creator` are marked as `archived` or `inactive` and are no longer visible or for sale in the marketplace.
    *   This process is a soft-delete to preserve community data and allow for potential reactivation through an Operator-led process.

4.5 Operator Account Lifecycle

`Operator` accounts are internal administrative accounts and are not self-service.

*   **Creation & Management:** `Operator` accounts are provisioned, managed, and decommissioned directly by a system administrator via secure, internal-only mechanisms (e.g., a secured CLI or direct database interaction).

⸻

5. State Machines

5.1 Listing State Machine

A Listing can exist in several states, which control its visibility and interactivity.

**Core States:**
*   `Unclaimed` → `Claimed`

**Operational States (for Claimed Listings):**
*   `Live` (Default for Claimed)
*   `Under Review`
*   `Unavailable`

**State Transitions & Rules:**

*   **Listing (Unclaimed)**
    *   Appears in Directory.
    *   Card routes to the Claim flow ONLY.
    *   Has no public detail page.

*   **Listing (Claimed)**
    *   Owned by a Creator and has an associated Studio.
    *   Default status is `Live`.

*   **`Listing.status` Field Contract:** <!-- Satisfies Artifact #1 -->
    *   The `Listing.status` field is the source of truth for a Listing's public state.
    *   All UI routing and component rendering MUST branch based on the value of this field.

*   **Operational State Rules:** <!-- Satisfies Artifact #1 -->
    *   **Live:** The default, fully interactive state. The public destination is enabled.
    *   **Under Review:** An operational state used during Operator review. Cards in this state MUST be either hidden from public view or rendered in a disabled state. They MUST NOT be interactive.
    *   **Unavailable:** An operational state indicating temporary or permanent deactivation. Cards in this state MUST be either hidden from public view or rendered in a disabled state. They MUST NOT be interactive.

⸻

4.2 Creator State Machine

Not Registered
   ↓ register during claim
Creator (Basic)
   ↓ upgrade
Creator (Pro)
   ↓ downgrade (end of paid period)
Creator (Basic)

Creator (Basic)
	•	Free tier
	•	Studio page active
	•	Limited products
	•	No Mini-site features

Creator (Pro)
	•	Paid tier
	•	Mini-site mode active
	•	Share Kit enabled
	•	Spotlight and advanced controls unlocked

⸻

4.3 Mini-site Mode State

Studio Page (Basic Mode)
        ↓ Pro upgrade
Mini-site (Pro Mode)
        ↓ downgrade (paid period ends)
Studio Page (Basic Mode)

Important rules:
	•	URL remains constant
	•	Mode controls features only
	•	Pro features persist until paid period ends
	•	After expiry, Pro links disable gracefully

⸻

4.4 Verification State (Independent)

Unverified
     ↓ verification check
Verified

Rules:
	•	Verification is optional
	•	Not tier-dependent
	•	Badge reflects mechanism-backed truth only

⸻

5. Permissions Matrix (Simplified)

Actor / State	Browse	Claim	Studio Access	Publish Products	Mini-site Controls	Enforcement
Visitor	✓	✗	✗	✗	✗	✗
Customer	✓	✗	✗	✗	✗	✗
Creator Basic	✓	✓	✓	Limited	✗	✗
Creator Pro	✓	✓	✓	Full	✓	✗
Operator	✓	✗	✗	✗	✗	✓


⸻

6. Invalid States (Must Never Occur)
	•	Mini-site enabled without Pro tier
	•	Verified badge without verification mechanism
	•	Unclaimed listing with public Studio page
	•	Operator appearing as “Admin” in public UI
	•	Creator without an associated Listing

Any occurrence is a critical defect.

⸻

7. Governance Rule

If a feature or UI flow:
	•	Introduces a new actor
	•	Skips a state
	•	Collapses two states into one

This document must be updated first, or the change is invalid.

⸻

End of User Model & State Machine

:::
