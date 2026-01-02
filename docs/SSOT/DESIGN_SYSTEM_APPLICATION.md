# DESIGN_SYSTEM_APPLICATION.md  
Design System Application — SuburbMates

Status: LOCKED (SSOT)  
Authority Level: High (Subordinate only to Product Constitution & Canonical Terminology)  
Audience: Design, Product, Automation, Engineering  
Change Rule: Any change requires visual-regression and trust-impact review

---

## 1. Purpose

This document defines how design rules are applied, not what specific fonts or colors are used.

It exists to:
- Enforce premium, editorial quality
- Prevent “AI-template” sameness
- Keep UX consistent across Directory, Studio Page, Mini-site, and Studio
- Protect accessibility and performance

If visuals change but these rules are honored, the product remains correct.

---

## 2. Global Design Principles (Applied Everywhere)

### 2.1 Light-First, Editorial Lean
- Default presentation is light-first.
- Dark mode is optional and creator-controlled (Pro), never forced.
- Whitespace is a feature, not a gap.

### 2.2 Minimalism With Intent
- Fewer elements, clearer hierarchy.
- No decorative UI without functional meaning.
- Every element must earn its presence.

### 2.3 Credibility Over Novelty
- Avoid visual gimmicks.
- Avoid “growth UI” patterns.
- Calm, confident, legible layouts win.

---

## 3. Hierarchy System (Non-Negotiable)

### 3.1 Vertical Hierarchy
Pages must follow this order:

1. Identity (Who is this?)
2. Proof (Why trust this?)
3. Action (What can I do?)

This applies to:
- Directory cards
- Studio Pages
- Mini-sites
- Product pages

---

### 3.2 Text Hierarchy (Abstract Levels)
Use levels, not font names:

- Level 1: Page identity (name/title)
- Level 2: Section headers
- Level 3: Supporting labels
- Body: Descriptive text
- Meta: Legal/truth UI

Levels must be visually distinct at all sizes.

---

## 4. Spacing & Density Rules

### 4.1 Spacing Scale
- Use a modular scale (e.g., base unit × multiples).
- Spacing increases as you move down the hierarchy.
- No arbitrary spacing.

### 4.2 Density Modes
Two density modes are allowed:
- Comfortable (default)
- Compact (Pro option)

Density changes spacing only—never hierarchy.

---

## 5. Layout System

### 5.1 Mobile-First
- Vertical scroll is primary.
- Horizontal scrolling is reserved for intentional carousels only (e.g., pinned items).
- Desktop layouts may expand but must not add complexity.

### 5.2 Grid Discipline
- Align elements to a grid.
- Avoid staggered or masonry layouts unless strictly constrained.
- Consistency beats visual flair.

---

## 6. Cards (Preview Components)

### 6.1 Card Anatomy
All cards must include:
- Clear title
- One primary visual or icon
- One primary action

### 6.2 Card Behavior
- Cards are previews, never destinations.
- Entire card is tappable unless it causes ambiguity.
- Hover states are subtle and informational, not decorative.

---

## 7. Motion & Interaction

### 7.1 Motion Philosophy
- Motion communicates cause and effect, not delight for its own sake.
- No autoplay animations.
- No parallax as a default.

### 7.2 Allowed Motion
- Subtle fades
- Short transforms (e.g., expand/collapse)
- Scroll-based reveal only when it improves comprehension

### 7.3 Accessibility
- Respect reduced-motion preferences.
- Motion must never block interaction.

---

## 8. Color & Contrast (Abstract Rules)

### 8.1 Contrast
- Text must always meet accessibility contrast.
- Accent colors must never reduce legibility.
- Background shifts must auto-adjust text color.

### 8.2 Color Usage
- One accent color per Mini-site (Pro).
- Accent used for emphasis, not decoration.
- Neutral palette dominates.

(No specific colors are defined here by design.)

---

## 9. Media Rules

### 9.1 Aspect Ratios
- Avatars: 1:1
- Covers: 16:9
- Product visuals: consistent ratio per layout mode

### 9.2 Image Quality
- No stretched or distorted images.
- Crop framing must be visible to the user.
- Fallbacks must be neutral and branded, not generic.

---

## 10. Form & Input Design

### 10.1 Inputs
- Clear labels (no placeholder-only fields)
- Inline validation
- Predictable focus states

### 10.2 Error Handling
- Errors explain what happened and how to fix it.
- No blame language.
- No red-only signaling (color + text required).

---

## 11. Empty & Loading States

### 11.1 Empty States
- Must explain why it’s empty.
- Must explain what to do next.
- Never look like a bug.

### 11.2 Loading States
- Use skeletons or subtle indicators.
- Avoid spinners for long operations without context.

---

## 12. Consistency Across Surfaces

These rules apply equally to:
- Directory
- Studio Page (Basic)
- Mini-site (Pro)
- Creator Studio (private workspace)

Private surfaces may be denser but must never feel lower quality.

---

## 13. Forbidden Design Patterns

The following are not allowed:
- Neon or high-saturation gimmicks
- Fake “AI” visual tropes
- Over-styled dashboards
- Decorative gradients without meaning
- Copy-driven urgency visuals

Any appearance is a defect.

---

## 14. Governance

- This document defines application, not aesthetic taste.
- Fonts, colors, and brand tokens may evolve independently.
- Any change that alters hierarchy, spacing, motion, or density requires updating this document.

---

End of Design System Application