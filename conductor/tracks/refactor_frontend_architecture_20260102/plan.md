# Track Plan: Refactor Frontend Architecture and UI

## Track Description

Refactor Frontend Architecture and UI to Align with SSOT Documentation.

---

## Phase 1: Establish Next.js Project Structure

### Objective
Set up the foundational Next.js App Router project and integrate basic styling.

*   [x] Task: Move the existing `app/layout.tsx` and `app/page.tsx` into a more structured directory layout. [0da3d29]
*   [x] Task: Create a `components/` directory and subdirectories for `layout`, `ui`, `home`. [0f753b1]
*   [x] Task: Migrate global styles and Tailwind CSS configuration from `reference only` file to `styles/globals.css` and `tailwind.config.ts`. [6b47e2d]
*   [ ] Task: Conductor - User Manual Verification 'Establish Next.js Project Structure' (Protocol in workflow.md)

## Phase 2: Migrate Core UI Components

### Objective
Translate the main visual elements from the `reference only` HTML into reusable React components.

*   [ ] Task: Create `Header.tsx` component in `components/layout/`.
*   [ ] Task: Create `Hero.tsx` component in `components/home/`.
*   [ ] Task: Create `Directory.tsx` component for the directory listing in `components/home/`.
*   [ ] Task: Create `Marketplace.tsx` component for the marketplace section in `components/home/`.
*   [ ] Task: Create `InfoDock.tsx` component in `components/home/`.
*   [ ] Task: Create `Footer.tsx` component in `components/layout/`.
*   [ ] Task: Conductor - User Manual Verification 'Migrate Core UI Components' (Protocol in workflow.md)

## Phase 3: Implement SSOT-Compliant Navigation and Modals

### Objective
Refactor navigation and modal interactions to strictly adhere to SSOT UI/UX patterns.

*   [ ] Task: Replace the floating action button with a Bottom Navigation Bar component in `components/layout/`.
*   [ ] Task: Create a generic `Modal.tsx` component in `components/ui/` for info dock content.
*   [ ] Task: Create a `StudioPageModal.tsx` component in `components/directory/` for the quick view.
*   [ ] Task: Conductor - User Manual Verification 'Implement SSOT-Compliant Navigation and Modals' (Protocol in workflow.md)

## Phase 4: Terminological and Content Cleanup

### Objective
Perform a final audit and ensure all remaining terminology and hardcoded content aligns with SSOT.

*   [ ] Task: Review all components for hardcoded strings and replace them with SSOT-compliant terminology.
*   [ ] Task: Create a `constants.ts` file in `lib/` to store canonical strings.
*   [ ] Task: Conductor - User Manual Verification 'Terminological and Content Cleanup' (Protocol in workflow.md)