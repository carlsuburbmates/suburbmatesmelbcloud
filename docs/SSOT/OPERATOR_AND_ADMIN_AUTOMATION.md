# OPERATOR_AND_ADMIN_AUTOMATION.md  
Operator & Admin Automation — SuburbMates

Status: LOCKED (SSOT)  
Authority Level: Medium–High (Subordinate to Product Constitution, Canonical Terminology, User Model, Public UX Contract, Creator Studio Spec, Mini-Site Engine Spec)  
Audience: Operator, Product, Automation  
Change Rule: Any change requires operator-load and false-positive review

---

## 1. Purpose

This document defines the internal operating system of SuburbMates:
- What the Operator controls
- What the system automates
- Where AI assists (and where it must not)
- How enforcement, verification, and disputes are handled

If a workflow increases manual load without reducing risk, it violates this spec.

---

## 2. Operator Dashboard (Internal Only)

### 2.1 Scope
The Operator Dashboard is the sole internal control surface.

It must support:
- Verification review
- Enforcement actions
- Flag triage
- Audit review
- System overrides (rare)

It must not expose:
- Creator content editing
- Product fulfilment
- Customer support tooling

---

## 3. Automation Bias (Solo-Operator Rule)

### 3.1 Mandatory Automation
Any workflow that is:
- Deterministic
- Repetitive
- Rule-based

Must be automated by default.

Manual review is reserved for:
- Edge cases
- Final enforcement actions
- Appeals

---

## 4. ABN Verification Automation

### 4.1 Creator Experience (Public/Studio)
- ABN verification is optional but encouraged
- Available to all Creators (Basic and Pro)
- Accessible anytime inside Studio → Verification
- Clear explanation of what “Verified” means (identity only)

---

### 4.2 Automated Verification Flow
VERIFIED
1. Creator submits ABN
2. System validates format + checksum
3. System performs authoritative lookup (GUID-based)
4. If match is valid:
   - Mark Creator as ABN verified
   - Apply Verified badge automatically
   - Log verification event
5. If ambiguous:
   - Flag for Operator review

---

### 4.3 Operator Review (Exception Only)
Operator may:
- Approve verification
- Reject verification
- Request clarification

Manual verification is exceptional, not default.

---

## 5. Enforcement & Moderation

### 5.1 Enforcement Focus
Enforcement exists to:
- Maintain platform credibility
- Prevent fraud
- Enforce Truth UI rules

It does not exist to resolve commercial disputes.

---

### 5.2 Enforcement Ladder (Authoritative)

1. Warn
   - Automated or manual
   - Non-public
   - Logged

2. Delist
   - Public visibility removed
   - Studio access retained
   - Logged

3. Suspend
   - Studio access disabled
   - Public page removed
   - Logged

4. Evict
   - Access termination
   - Final action
   - Human-confirmed only

Automation may recommend, but never execute eviction.

---

### 5.3 Automation vs Human Confirmation
| Action        | Automated | Human Required |
|---------------|-----------|----------------|
| Warn          | Yes       | No             |
| Delist        | Yes       | Optional       |
| Suspend       | Yes       | Optional       |
| Evict         | No        | Yes            |

---

## 6. AI as an Assistant (Strict Boundaries)

### 6.1 What AI May Do
AI may:
- Classify reports (fraud vs content vs spam)
- Flag suspicious patterns
- Suggest enforcement actions
- Summarize long histories for Operator review
- Detect Truth UI violations (claims, fake scale)

AI output is advisory only.

---

### 6.2 What AI Must Never Do
AI must never:
- Take enforcement actions
- Communicate directly with Creators or Customers
- Generate public-facing copy
- Invent facts or claims
- Override Operator decisions

AI is a copilot, not an authority.

---

## 7. Disputes & Refunds (Middleman Truth)

### 7.1 Platform Position
SuburbMates:
- Is not the merchant of record
- Does not handle refunds
- Does not arbitrate disputes

---

### 7.2 Public Support Lanes (Operational Meaning)

Purchase Help
- Redirects to Creator
- No Operator intervention

Report a Concern
- Platform integrity issues only
- Routed to enforcement triage

---

## 8. Flags, Reports & Triage

### 8.1 Report Intake
Reports may include:
- Fraud
- Misrepresentation
- Impersonation
- Policy violation

---

### 8.2 Automated Triage
System may:
- De-duplicate reports
- Score severity
- Escalate urgent cases

Operator handles only:
- High-severity
- Repeated
- Ambiguous cases

---

## 9. Audit & Logging (Non-Optional)

### 9.1 Logged Events
The system must log:
- Verification events
- Tier changes
- Enforcement actions
- AI recommendations
- Overrides

---

### 9.2 Operator Review
Audit logs must be:
- Immutable
- Time-stamped
- Searchable

Auditability is a trust requirement.

---

## 10. Invalid Operational States

- AI executing enforcement
- Operator editing Creator content directly
- Verification without audit trail
- Eviction without human confirmation
- Platform handling refunds

Any occurrence is a critical defect.

---

## 11. Governance Rule

Any change that:
- Increases Operator workload
- Expands AI authority
- Weakens auditability

Requires this document to be updated first.

---

End of Operator & Admin Automation