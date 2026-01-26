# Page Completeness Audit - Session Handoff Prompt

## Context

You are continuing work on **SuburbMates Melbourne**, a Next.js 16 local directory/marketplace connecting Melbourne digital creators with local buyers. The previous session implemented:

1. **Dynamic sitemap** (`app/sitemap.ts`) - generates URLs for all routes
2. **robots.txt** (`app/robots.ts`) - excludes private routes
3. **Route Registry** (`lib/routes.ts`) - Single Source of Truth for routes
4. **Sitemap Validation Tests** (`tests/e2e/sitemap_validation.spec.ts`) - verifies URLs return 200
5. **Route Validation Script** (`scripts/validate-routes.ts`) - CI validation

**The Problem Identified:** Current tests only validate that routes return HTTP 200. They do NOT validate:
- Pages have complete content (not placeholders)
- Required sections exist per SSOT specs
- Buttons and forms are functional
- Workflows are implemented end-to-end

---

## Your Task

Create a comprehensive **Page Completeness Audit System** with three deliverables:

### Deliverable 1: Page Completeness Checklist (`docs/SSOT/PAGE_COMPLETENESS_CHECKLIST.md`)

Create a markdown document defining "complete" for each route. Use this structure per page:

```markdown
## /route-path

### Required Elements
- [ ] Element 1 (data-testid="xxx")
- [ ] Element 2

### Required Content
- [ ] Heading: "Expected Text"
- [ ] Section: Description

### Forbidden Content
- [ ] No "TODO" text
- [ ] No "Coming Soon"
- [ ] No Lorem Ipsum

### Interactive Elements
- [ ] Button: "Label" → navigates to /path
- [ ] Form: submits to action

### Data Dependencies
- [ ] Requires: listings from Supabase
- [ ] Empty state: "No results found"
```

---

### Deliverable 2: Playwright Content Tests (`tests/e2e/page_completeness.spec.ts`)

Extend E2E tests with content assertions. Example structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Page Completeness Audit', () => {

  test('Homepage has all required sections', async ({ page }) => {
    await page.goto('/');
    
    // Required sections
    await expect(page.locator('section#hero')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // No placeholder content
    await expect(page.getByText(/TODO/i)).not.toBeVisible();
    await expect(page.getByText(/lorem ipsum/i)).not.toBeVisible();
    await expect(page.getByText(/coming soon/i)).not.toBeVisible();
    
    // Interactive elements work
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('test');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/q=test/);
  });

  // ... tests for each route
});
```

---

### Deliverable 3: Placeholder Audit Script (`scripts/audit-placeholders.ts`)

Create a script that scans all pages for incomplete content:

```typescript
// Scans for:
// - TODO comments in source files
// - Placeholder text patterns (Lorem, TBD, Coming Soon)
// - Empty components (<div></div>)
// - Disabled buttons without reason
// - Missing data-testid attributes
// - Images with placeholder src
// - Links to "#" or unimplemented routes

// Output:
// - Summary of issues per file
// - Severity ratings (critical, warning, info)
// - Exit code 1 if critical issues found
```

---

## Page Analysis (Current State)

### Complete Pages ✅
| Route | Status | Notes |
|-------|--------|-------|
| `/` | Complete | Hero, categories, CTAs all present |
| `/directory` | Complete | Search, filters, grid working |
| `/marketplace` | Complete | Search, filters, product grid |
| `/about` | Complete | Full manifesto content |
| `/pricing` | Complete | 3 tiers, Stripe integration |
| `/trust` | Complete | Trust signals, verification info |
| `/listing/[id]` | Complete | Gallery, contact, products |
| `/product/[id]` | Complete | Detail, seller card, enquiry |
| `/u/[slug]` | Complete | Pro mini-site with theming |

### Partial/Placeholder Pages ⚠️
| Route | Status | Issues |
|-------|--------|--------|
| `/faq` | Partial | Only 4 FAQs, minimal styling, doesn't match brand |
| `/legal/privacy` | Placeholder | Only 3 sections, comment says "More privacy..." |
| `/legal/terms` | Placeholder | Only 4 sections, comment says "More terms..." |

### Untested Routes 🚫
| Route | Test Coverage |
|-------|---------------|
| `/cart` | None |
| `/checkout` | None |
| `/orders/[id]` | None |
| `/studio/promote` | None |
| `/studio/verification` | None |
| `/studio/orders` | None |
| `/studio/share` | None |
| `/admin/*` | None |

---

## SSOT Requirements Summary

### Every Public Page Must Have:
1. **Identity** (Who is this?) - Clear heading, branding
2. **Proof** (Why trust this?) - Verification badges, social proof
3. **Action** (What can I do?) - Clear CTAs

### Forbidden Patterns:
- Fake social proof (made-up reviews/ratings)
- Urgency countdowns
- Dark patterns
- Decorative elements without meaning
- "TODO" or placeholder text visible to users

### Required Labels (Truth UI):
- "Featured placement" (not "Top Rated" or "Best")
- "Sold by [Creator]" on products
- "ABN Verified" only if actually verified
- "Updated [Month YYYY]" freshness label

---

## Files to Reference

| File | Purpose |
|------|---------|
| `lib/routes.ts` | Route registry (SSOT) |
| `app/sitemap.ts` | Sitemap generation |
| `tests/e2e/public_routes.spec.ts` | Existing route tests to extend |
| `docs/SSOT/DESIGN_PHILOSOPHY.md` | Design requirements |
| `docs/SSOT/FRONTEND_OVERVIEW.md` | Component specs |
| `docs/SSOT/CREATOR_STUDIO_SPEC.md` | Studio page requirements |
| `docs/SSOT/CORE_ENTITIES.md` | Data model |

---

## Expected Output

After completing this task, running the following should work:

```bash
# 1. Check for placeholder content in source files
npm run audit:placeholders

# 2. Run page completeness E2E tests
npm run test:e2e -- page_completeness

# 3. Validate routes exist
npm run validate:routes
```

All three should pass for a "complete" codebase.

---

## Validation Criteria

Your implementation is complete when:

1. [ ] `PAGE_COMPLETENESS_CHECKLIST.md` covers all 27 sitemap URLs
2. [ ] Playwright tests exist for each page's required elements
3. [ ] Audit script detects placeholder content in `/faq`, `/legal/*`
4. [ ] npm scripts added: `audit:placeholders`, `test:completeness`
5. [ ] Running audit against current codebase shows known issues
6. [ ] No false positives (legitimate content not flagged)

---

## Commands to Start

```bash
# Verify current state
npm run validate:routes
npm run build

# Check existing tests
npm run test:e2e -- --list

# Read key files
cat lib/routes.ts
cat docs/SSOT/DESIGN_PHILOSOPHY.md
```
