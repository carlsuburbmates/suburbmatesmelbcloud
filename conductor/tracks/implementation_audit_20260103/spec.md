# Specification: Evidence-based Implementation Audit

## 1. Overview

The goal of this track is to produce a comprehensive audit report that enumerates what is CURRENTLY implemented in the SuburbMates codebase and documented in the SSOT (Single Source of Truth) files. This audit will serve as the foundation for generating three authoritative artifacts:
1. A state machine and UI copy table.
2. The progression logic for the Creator Studio Dashboard.
3. The data contract for Directory and Marketplace cards.

The audit will focus on the user experiences for **Anonymous Users**, **Authenticated Users (non-creators)**, and **Creator Users**, and will cover the core entities of **Listings**, **Products**, and **Creator Accounts**.

## 2. Functional Requirements

### 2.1. Hard Rules
- **No Assumptions:** The audit must not make any assumptions. If a feature or state cannot be proven from code or documentation, it must be reported as "NOT FOUND".
- **Evidence-Based:** Every claim in the final report must be backed by evidence, including the file path, line numbers, and a short, relevant code snippet.
- **Canonical Terminology:** The audit must use the project's canonical terminology (e.g., Studio, Studio Page, Pro Mini-site).
- **Identify Forbidden Terms:** The audit must identify and list any forbidden terms (e.g., "profile", "vendor") found in the public or creator-facing UI.
- **Reporting Only:** The audit will only report what currently exists. It will not propose or implement any fixes.

### 2.2. Scope of Inspection
The audit must cover the following areas:
- **Repo Code:**
  - `app/` routes (Next.js app router)
  - `components/*`
  - All user-facing copy (labels, headings, buttons)
  - Navigation components (`Header`, `BottomNavBar`)
  - `Listing` and `Product` card components
  - `Claim flow` components/routes (if any)
  - `Studio dashboard` routes/components
  - Any configuration or constants defining statuses, tiers, badges, or categories.
  - Middleware and authentication guards.
- **SSOT Docs:**
  - All files under `docs/SSOT/`.
  - Specific focus on: `CANONICAL_TERMINOLOGY.md`, `PUBLIC_UX_CONTRACT.md`, `PRODUCT_CONSTITUTION.md`, `USER_MODEL_AND_STATE_MACHINE.md`, `CREATOR_STUDIO_SPEC.md`, `MINI_SITE_ENGINE_SPEC.md`.

### 2.3. Deliverable Format
The final output must be a single Markdown report with the following sections:
1. **Route Inventory:** An evidence-backed table of all application routes.
2. **Component Inventory:** An evidence-backed summary of key components and their conditional rendering logic.
3. **Current State Variables & Flags:** An evidence-backed enumeration of all state fields and their usage.
4. **UI Copy Extract:** An evidence-backed table of all user-facing strings, including a dedicated section for "FORBIDDEN TERM VIOLATIONS".
5. **State/Flow Behavior:** An evidence-backed description of user flows for Listings, Products, Claim Flow, and the Studio Dashboard.
6. **Gaps vs SSOT:** An evidence-backed list of discrepancies between the SSOT documents and the implemented code.

## 3. Out of Scope
- Implementing any changes or fixes based on the audit's findings.
- Analyzing performance, security (beyond what is explicitly in the SSOT), or code style.
- Making any assumptions about functionality that is not explicitly present in the code or docs.
