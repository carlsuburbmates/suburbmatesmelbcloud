#!/usr/bin/env npx ts-node
/**
 * Route Validation Script
 * 
 * Validates that all routes defined in lib/routes.ts have corresponding
 * page files in the app/ directory. Run this in CI to catch missing pages.
 * 
 * Usage:
 *   npx ts-node scripts/validate-routes.ts
 *   npm run validate:routes
 */

import fs from 'fs';
import path from 'path';
import { STATIC_ROUTES, EXCLUDED_ROUTES, getRouteStats } from '../lib/routes';

const APP_DIR = path.join(process.cwd(), 'app');

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    checkedRoutes: number;
    missingPages: number;
    validPages: number;
  };
}

function routeToPagePath(route: string): string {
  if (route === '/') {
    return 'page.tsx';
  }
  return `${route.slice(1)}/page.tsx`;
}

function checkPageExists(route: string): boolean {
  const pagePath = path.join(APP_DIR, routeToPagePath(route));
  return fs.existsSync(pagePath);
}

function validateRoutes(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let validPages = 0;

  console.log('\n🔍 Validating route registry against file system...\n');

  // Check all static routes have page files
  console.log('📄 Static Routes:');
  for (const route of STATIC_ROUTES) {
    const exists = checkPageExists(route.path);
    if (exists) {
      console.log(`  ✅ ${route.path}`);
      validPages++;
    } else {
      console.log(`  ❌ ${route.path} - MISSING PAGE FILE`);
      errors.push(`Missing page file for route: ${route.path}`);
    }
  }

  // Check that excluded routes directories exist (they should, they're protected areas)
  console.log('\n🚫 Excluded Routes (should exist as protected areas):');
  for (const route of EXCLUDED_ROUTES) {
    const dirPath = path.join(APP_DIR, route.path.replace(/^\//, '').replace(/\/$/, ''));
    const exists = fs.existsSync(dirPath);
    if (exists) {
      console.log(`  ✅ ${route.path} (${route.reason})`);
    } else {
      // This is a warning, not an error - the exclusion might be for a nested route
      console.log(`  ⚠️  ${route.path} - directory not found (may be intentional)`);
      warnings.push(`Excluded route directory not found: ${route.path}`);
    }
  }

  // Print stats
  const stats = getRouteStats();
  console.log('\n📊 Route Statistics:');
  console.log(`  Static routes: ${stats.staticCount}`);
  console.log(`  Dynamic patterns: ${stats.dynamicPatterns}`);
  console.log(`  Excluded prefixes: ${stats.excludedPrefixes}`);
  console.log(`  Valid pages: ${validPages}/${STATIC_ROUTES.length}`);

  const passed = errors.length === 0;

  if (passed) {
    console.log('\n✅ All route validations passed!\n');
  } else {
    console.log(`\n❌ Validation failed with ${errors.length} error(s)\n`);
    errors.forEach(err => console.error(`  ERROR: ${err}`));
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} warning(s):\n`);
    warnings.forEach(warn => console.warn(`  WARNING: ${warn}`));
  }

  return {
    passed,
    errors,
    warnings,
    stats: {
      checkedRoutes: STATIC_ROUTES.length,
      missingPages: errors.length,
      validPages,
    },
  };
}

// Run validation
const result = validateRoutes();

// Exit with error code if validation failed
if (!result.passed) {
  process.exit(1);
}
