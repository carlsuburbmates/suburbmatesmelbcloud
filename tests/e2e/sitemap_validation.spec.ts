import { test, expect } from '@playwright/test';

/**
 * Sitemap Validation Tests
 * 
 * These tests crawl the dynamically generated sitemap.xml and verify:
 * 1. Sitemap is accessible and valid XML
 * 2. robots.txt points to sitemap
 * 3. All static URLs in sitemap return 200
 * 4. Protected routes are properly excluded
 * 5. Dynamic routes (listings, products) are valid
 */

test.describe('Sitemap & Robots.txt Validation', () => {

    test('robots.txt is accessible and references sitemap', async ({ request }) => {
        const response = await request.get('/robots.txt');
        expect(response.ok()).toBeTruthy();
        
        const text = await response.text();
        
        // Should contain sitemap reference
        expect(text).toContain('Sitemap:');
        expect(text).toMatch(/sitemap\.xml/i);
        
        // Should block private routes
        expect(text).toContain('/studio/');
        expect(text).toContain('/admin/');
        expect(text).toContain('/api/');
    });

    test('sitemap.xml is accessible and valid XML structure', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        expect(response.ok()).toBeTruthy();
        
        const xml = await response.text();
        
        // Should be valid XML with urlset
        expect(xml).toContain('<?xml');
        expect(xml).toContain('<urlset');
        expect(xml).toContain('</urlset>');
        
        // Should contain at least some URLs
        expect(xml).toContain('<url>');
        expect(xml).toContain('<loc>');
    });

    test('sitemap contains required static pages', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        const xml = await response.text();
        
        // Extract all URLs from sitemap
        const urls = extractUrlsFromSitemap(xml);
        
        // Required static pages that MUST be in sitemap
        const requiredPages = [
            '/',
            '/directory',
            '/marketplace',
            '/about',
            '/pricing',
            '/faq',
            '/trust',
            '/legal/privacy',
            '/legal/terms',
        ];
        
        for (const page of requiredPages) {
            const found = urls.some(url => url.endsWith(page) || url.endsWith(page + '/'));
            expect(found, `Missing required page in sitemap: ${page}`).toBeTruthy();
        }
    });

    test('sitemap excludes protected routes', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        const xml = await response.text();
        
        // These routes should NEVER appear in sitemap
        const excludedPatterns = [
            '/studio',
            '/admin',
            '/api/',
            '/auth/',
            '/checkout',
            '/cart',
            '/claim/',
            '/orders/',
        ];
        
        for (const pattern of excludedPatterns) {
            expect(xml, `Protected route found in sitemap: ${pattern}`).not.toContain(`<loc>${pattern}`);
            // Also check with full URL pattern
            expect(xml).not.toMatch(new RegExp(`<loc>[^<]*${pattern.replace('/', '\\/')}[^<]*<\\/loc>`));
        }
    });

    test('all static sitemap URLs return 200', async ({ request }) => {
        const sitemapResponse = await request.get('/sitemap.xml');
        const xml = await sitemapResponse.text();
        const urls = extractUrlsFromSitemap(xml);
        
        // Filter to static pages only (no dynamic IDs)
        const staticUrls = urls.filter(url => 
            !url.includes('/listing/') && 
            !url.includes('/product/') && 
            !url.includes('/u/') &&
            !url.includes('/articles/') &&
            !url.includes('?category=')
        );
        
        console.log(`Testing ${staticUrls.length} static URLs...`);
        
        const failures: string[] = [];
        
        for (const url of staticUrls) {
            // Convert absolute URL to relative for request
            const relativePath = new URL(url).pathname;
            const response = await request.get(relativePath);
            
            if (!response.ok()) {
                failures.push(`${relativePath} returned ${response.status()}`);
            }
        }
        
        if (failures.length > 0) {
            console.error('Failed URLs:', failures);
        }
        
        expect(failures, `${failures.length} URLs failed`).toHaveLength(0);
    });

    test('dynamic listing URLs in sitemap are valid', async ({ request }) => {
        const sitemapResponse = await request.get('/sitemap.xml');
        const xml = await sitemapResponse.text();
        const urls = extractUrlsFromSitemap(xml);
        
        // Filter to listing pages
        const listingUrls = urls.filter(url => url.includes('/listing/'));
        
        console.log(`Found ${listingUrls.length} listing URLs in sitemap`);
        
        // Test each listing URL (or first 10 to keep test fast)
        const urlsToTest = listingUrls.slice(0, 10);
        
        for (const url of urlsToTest) {
            const relativePath = new URL(url).pathname;
            const response = await request.get(relativePath);
            
            // Should return 200 (found) not 404
            expect(response.ok(), `Listing ${relativePath} returned ${response.status()}`).toBeTruthy();
        }
    });

    test('dynamic product URLs in sitemap are valid', async ({ request }) => {
        const sitemapResponse = await request.get('/sitemap.xml');
        const xml = await sitemapResponse.text();
        const urls = extractUrlsFromSitemap(xml);
        
        // Filter to product pages
        const productUrls = urls.filter(url => url.includes('/product/'));
        
        console.log(`Found ${productUrls.length} product URLs in sitemap`);
        
        // Test each product URL (or first 10)
        const urlsToTest = productUrls.slice(0, 10);
        
        for (const url of urlsToTest) {
            const relativePath = new URL(url).pathname;
            const response = await request.get(relativePath);
            
            expect(response.ok(), `Product ${relativePath} returned ${response.status()}`).toBeTruthy();
        }
    });

    test('mini-site URLs (/u/[slug]) in sitemap are valid', async ({ request }) => {
        const sitemapResponse = await request.get('/sitemap.xml');
        const xml = await sitemapResponse.text();
        const urls = extractUrlsFromSitemap(xml);
        
        // Filter to mini-site pages
        const miniSiteUrls = urls.filter(url => url.includes('/u/'));
        
        console.log(`Found ${miniSiteUrls.length} mini-site URLs in sitemap`);
        
        for (const url of miniSiteUrls) {
            const relativePath = new URL(url).pathname;
            const response = await request.get(relativePath);
            
            expect(response.ok(), `Mini-site ${relativePath} returned ${response.status()}`).toBeTruthy();
        }
    });

    test('sitemap URL count is within Google limits', async ({ request }) => {
        const sitemapResponse = await request.get('/sitemap.xml');
        const xml = await sitemapResponse.text();
        const urls = extractUrlsFromSitemap(xml);
        
        // Google limit is 50,000 URLs per sitemap
        expect(urls.length).toBeLessThan(50000);
        
        // Log current count for monitoring
        console.log(`Sitemap contains ${urls.length} URLs (limit: 50,000)`);
        
        // Warn if approaching limit (80%)
        if (urls.length > 40000) {
            console.warn('WARNING: Sitemap approaching Google limit. Consider splitting.');
        }
    });

    test('sitemap has valid lastmod dates', async ({ request }) => {
        const sitemapResponse = await request.get('/sitemap.xml');
        const xml = await sitemapResponse.text();
        
        // Extract lastmod values
        const lastmodMatches = xml.match(/<lastmod>(.*?)<\/lastmod>/g) || [];
        
        expect(lastmodMatches.length).toBeGreaterThan(0);
        
        for (const match of lastmodMatches.slice(0, 10)) {
            const dateStr = match.replace(/<\/?lastmod>/g, '');
            const date = new Date(dateStr);
            
            // Should be a valid date
            expect(date.toString()).not.toBe('Invalid Date');
            
            // Should not be in the future
            expect(date.getTime()).toBeLessThanOrEqual(Date.now() + 60000); // 1 min buffer
        }
    });

});

/**
 * Helper function to extract URLs from sitemap XML
 */
function extractUrlsFromSitemap(xml: string): string[] {
    const matches = xml.match(/<loc>(.*?)<\/loc>/g) || [];
    return matches.map(match => match.replace(/<\/?loc>/g, ''));
}
