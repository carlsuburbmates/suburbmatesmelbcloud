# Implementation Plan: Evidence-based Implementation Audit

## Phase 1: Code and Document Analysis

- [x] **Task:** Systematically inspect all `app/` routes to build the Route Inventory. (640f4a3)
- [x] **Task:** Inspect all components in `components/*` to build the Component Inventory. (8f6f959)
- [x] **Task:** Analyze component props, database types (`types/supabase.ts`), and data-fetching logic (`lib/listings.ts`) to identify all State Variables & Flags. (5c24172)
- [x] **Task:** Extract all user-facing strings from components to create the UI Copy Extract and identify forbidden term violations. (da09207)
- [x] **Task:** Map the `onClick` and `href` logic in components to document the State/Flow Behavior for listings, products, and other user interactions. (94e04ae)
- [x] **Task:** Read all specified `docs/SSOT/*` documents to build a matrix of requirements. (352da9d)
- [ ] **Task:** Conductor - User Manual Verification 'Code and Document Analysis' (Protocol in workflow.md)

## Phase 2: Report Generation

- [ ] **Task:** Synthesize the findings from Phase 1 into a draft Markdown report.
- [ ] **Task:** Populate the "Route Inventory" section of the report.
- [ ] **Task:** Populate the "Component Inventory" section of the report.
- [ ] **Task:** Populate the "Current State Variables & Flags" section of the report.
- [ ] **Task:** Populate the "UI Copy Extract" and "FORBIDDEN TERM VIOLATIONS" sections of the report.
- [ ] **Task:** Populate the "State/Flow Behavior" section, explicitly stating "NOT FOUND" where applicable.
- [ ] **Task:** Cross-reference the analysis with the SSOT matrix to identify and document all gaps in the "Gaps vs SSOT" section.
- [ ] **Task:** Review the complete report to ensure every claim is evidence-backed and no assumptions have been made.
- [ ] **Task:** Conductor - User Manual Verification 'Report Generation' (Protocol in workflow.md)
