/**
 * Route Registry - Single Source of Truth for SuburbMates Routes
 * 
 * This file defines all application routes and is used by:
 * - app/sitemap.ts (generate sitemap)
 * - app/robots.ts (generate exclusions)
 * - tests/e2e/sitemap_validation.spec.ts (validate routes)
 * - scripts/validate-routes.ts (CI validation)
 * 
 * @module lib/routes
 */

export type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface StaticRoute {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
  /** Optional description for documentation */
  description?: string;
}

export interface DynamicRoute {
  /** Next.js route pattern, e.g., '/listing/[id]' */
  pattern: string;
  /** Supabase table to query */
  table: string;
  /** Column to use for URL parameter */
  paramColumn: string;
  /** Optional filter condition */
  filter?: {
    column: string;
    operator: 'eq' | 'neq' | 'is' | 'not.is';
    value: string | null;
  };
  priority: number;
  changeFrequency: ChangeFrequency;
  description?: string;
}

export interface ExcludedRoute {
  /** Path prefix to exclude from sitemap */
  path: string;
  /** Reason for exclusion */
  reason: 'authenticated' | 'api' | 'internal' | 'transactional';
}

/**
 * Static pages - manually defined routes with page.tsx files
 */
export const STATIC_ROUTES: StaticRoute[] = [
  // Core pages
  { path: '/', priority: 1.0, changeFrequency: 'daily', description: 'Homepage' },
  { path: '/directory', priority: 0.9, changeFrequency: 'daily', description: 'Listing directory' },
  { path: '/marketplace', priority: 0.9, changeFrequency: 'daily', description: 'Product marketplace' },
  
  // Informational pages
  { path: '/about', priority: 0.7, changeFrequency: 'monthly', description: 'About page' },
  { path: '/pricing', priority: 0.7, changeFrequency: 'monthly', description: 'Pricing page' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly', description: 'FAQ page' },
  { path: '/trust', priority: 0.6, changeFrequency: 'monthly', description: 'Trust & safety' },
  
  // Legal pages
  { path: '/legal/privacy', priority: 0.3, changeFrequency: 'yearly', description: 'Privacy policy' },
  { path: '/legal/terms', priority: 0.3, changeFrequency: 'yearly', description: 'Terms of service' },
];

/**
 * Dynamic pages - routes populated from database
 */
export const DYNAMIC_ROUTES: DynamicRoute[] = [
  {
    pattern: '/listing/[id]',
    table: 'listings',
    paramColumn: 'id',
    filter: { column: 'status', operator: 'eq', value: 'claimed' },
    priority: 0.8,
    changeFrequency: 'weekly',
    description: 'Individual listing pages',
  },
  {
    pattern: '/u/[slug]',
    table: 'listings',
    paramColumn: 'slug',
    filter: { column: 'slug', operator: 'not.is', value: null },
    priority: 0.8,
    changeFrequency: 'weekly',
    description: 'Pro user mini-sites',
  },
  {
    pattern: '/product/[id]',
    table: 'products',
    paramColumn: 'id',
    priority: 0.7,
    changeFrequency: 'weekly',
    description: 'Individual product pages',
  },
  {
    pattern: '/articles/[slug]',
    table: 'articles',
    paramColumn: 'slug',
    filter: { column: 'published_at', operator: 'not.is', value: null },
    priority: 0.6,
    changeFrequency: 'monthly',
    description: 'SEO articles',
  },
];

/**
 * Category filter routes - generated from categories table
 */
export const CATEGORY_ROUTES = {
  baseUrl: '/directory',
  queryParam: 'category',
  table: 'categories',
  filter: { column: 'type', operator: 'eq' as const, value: 'business' },
  priority: 0.7,
  changeFrequency: 'daily' as ChangeFrequency,
  description: 'Directory filtered by category',
};

/**
 * Routes to exclude from sitemap (blocked in robots.txt)
 */
export const EXCLUDED_ROUTES: ExcludedRoute[] = [
  // Authenticated areas
  { path: '/studio/', reason: 'authenticated' },
  { path: '/admin/', reason: 'authenticated' },
  
  // API routes
  { path: '/api/', reason: 'api' },
  
  // Auth flows
  { path: '/auth/', reason: 'internal' },
  
  // Transactional pages
  { path: '/checkout', reason: 'transactional' },
  { path: '/cart', reason: 'transactional' },
  { path: '/claim/', reason: 'transactional' },
  { path: '/orders/', reason: 'transactional' },
];

/**
 * Get all static route paths
 */
export function getStaticPaths(): string[] {
  return STATIC_ROUTES.map(route => route.path);
}

/**
 * Get all excluded path prefixes
 */
export function getExcludedPaths(): string[] {
  return EXCLUDED_ROUTES.map(route => route.path);
}

/**
 * Check if a path should be excluded from sitemap
 */
export function isExcludedPath(path: string): boolean {
  return EXCLUDED_ROUTES.some(route => path.startsWith(route.path));
}

/**
 * Get route by path (for static routes)
 */
export function getRouteByPath(path: string): StaticRoute | undefined {
  return STATIC_ROUTES.find(route => route.path === path);
}

/**
 * Route statistics for monitoring
 */
export function getRouteStats() {
  return {
    staticCount: STATIC_ROUTES.length,
    dynamicPatterns: DYNAMIC_ROUTES.length,
    excludedPrefixes: EXCLUDED_ROUTES.length,
    totalStaticPages: STATIC_ROUTES.length,
  };
}
