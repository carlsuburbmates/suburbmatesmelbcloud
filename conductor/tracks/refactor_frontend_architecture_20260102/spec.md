# Track Specification: Refactor Frontend Architecture and UI

## 1. Overview

This track aims to refactor the existing frontend architecture and user interface elements of the SuburbMates Melbourne web application. The primary goal is to achieve full alignment with the authoritative SSOT (Single Source of Truth) documentation, addressing identified divergences in terminology, technical architecture, and specific UI/UX patterns.

## 2. Motivation

The current `reference only` prototype, while visually inspiring, deviates significantly from the project's established SSOT documentation. These inconsistencies lead to potential confusion, technical debt, and hinder future development efforts. Aligning with the SSOT will ensure consistency, maintainability, and scalability.

## 3. Scope of Work

This refactoring will encompass the following key areas:

### 3.1 Architectural Migration

*   **From:** CDN-based React/Babel in `reference only` HTML file.
*   **To:** Proper Next.js App Router project structure, leveraging TypeScript and React components.
*   **Action:**
    *   Initialize a new Next.js project (if not already done, though implied by existing structure).
    *   Extract HTML and CSS from the `reference only` file and convert them into reusable React components.
    *   Integrate these components into the Next.js App Router structure.

### 3.2 Terminological Alignment (Code and UI)

*   **Objective:** Ensure all user-facing and code-level terminology aligns with `CANONICAL_TERMINOLOGY.md`.
*   **Action:**
    *   Replace forbidden terms (e.g., "Profile", "Membership") with canonical terms (e.g., "Studio Page", "Mini-site", "Tiers"). This applies to component names, props, and UI text.

### 3.3 UI/UX Pattern Correction

*   **Objective:** Implement UI/UX patterns as prescribed by `DESIGN_SYSTEM_APPLICATION.md` and `PUBLIC_UX_CONTRACT.md`.
*   **Action:**
    *   **Navigation:** Replace the existing floating action button (FAB) navigation with a thumb-friendly bottom navigation bar, adhering to mobile-first ergonomics.
    *   **Modals/Overlays:** Ensure that filters and informational modals (e.g., "Protocol", "Tiers") align with the specified interaction patterns (e.g., bottom sheets for filters, if explicitly defined as such).
    *   **Card Structure:** Ensure directory listing cards, featured cards, Pro cards, Basic cards, and unclaimed cards conform to the structural and badging rules.

## 4. Non-Goals

*   Implementation of full backend API integrations (initial phase focuses on frontend structure and static data where necessary).
*   Adding new features not described in the `reference only` prototype or the SSOT documents.
*   Comprehensive database schema migration (this track focuses on frontend aspects).

## 5. Definition of Done

This track will be considered complete when:

*   The frontend is running within a Next.js App Router project structure.
*   All visual elements from the `reference only` prototype are reproduced as React components within the Next.js structure.
*   All user-facing and code-level terminology aligns strictly with `CANONICAL_TERMINOLOGY.md`.
*   UI/UX patterns (especially navigation and modals) comply with `DESIGN_SYSTEM_APPLICATION.md` and `PUBLIC_UX_CONTRACT.md`.
*   All unit and E2E tests for refactored components pass and meet code coverage requirements.
*   The project passes all linting and type-checking rules.
*   The web app functions correctly on mobile devices.