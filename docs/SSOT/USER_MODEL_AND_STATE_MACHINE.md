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
	•	Role confusion (e.g. “users vs vendors vs admins”)
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
A Listing is claimed and a Creator account is created.

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

4. State Machines

4.1 Listing State Machine

Listing (Unclaimed)
        ↓ claim
Listing (Claimed)

Listing (Unclaimed)
	•	Appears in Directory
	•	Card routes to Claim flow only
	•	No public detail page

Listing (Claimed)
	•	Owned by a Creator
	•	Has an associated Studio
	•	Public destination enabled

⸻

4.2 Creator State Machine

No Account
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
