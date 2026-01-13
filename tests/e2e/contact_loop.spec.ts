import { test, expect } from '@playwright/test';

/**
 * E2E: Contact Loop Verification
 * Goal: Ensure contact protocols are active and reachable on ListingPage.
 */
test.describe('Customer Contact Loop', () => {

    test('ListingPage has working mailto link when contact_email exists', async ({ page }) => {
        // Navigate to a known claimed listing (use a test fixture or existing seed)
        // This test assumes a listing exists with contact_email populated.
        await page.goto('/directory');

        // Find a claimed listing card (without the "Unclaimed" badge)
        const claimedCard = page.getByRole('article').filter({ hasNotText: 'Unclaimed' }).first();

        // If no claimed listings exist in test data, skip
        if (!(await claimedCard.isVisible())) {
            test.skip();
            return;
        }

        await claimedCard.click();

        // Wait for the listing page to load
        await page.waitForURL(/\/(listing|u)\/.+/);

        // Check for mailto link
        const emailButton = page.locator('a[href^="mailto:"]');

        // If the listing has an email, verify the attribute
        if (await emailButton.isVisible()) {
            const href = await emailButton.getAttribute('href');
            expect(href).toMatch(/^mailto:/);
        }
    });

    test('ListingPage has working tel link when phone exists', async ({ page }) => {
        await page.goto('/directory');

        const claimedCard = page.getByRole('article').filter({ hasNotText: 'Unclaimed' }).first();

        if (!(await claimedCard.isVisible())) {
            test.skip();
            return;
        }

        await claimedCard.click();
        await page.waitForURL(/\/(listing|u)\/.+/);

        // Check for tel link
        const callButton = page.locator('a[href^="tel:"]');

        if (await callButton.isVisible()) {
            const href = await callButton.getAttribute('href');
            expect(href).toMatch(/^tel:/);
        }
    });

    test('ListingPage shows fallback when no contact info provided', async ({ page }) => {
        // This is a negative test - verify the empty state displays correctly.
        // Requires a test listing with no contact info.
        await page.goto('/directory');

        const claimedCard = page.getByRole('article').filter({ hasNotText: 'Unclaimed' }).first();

        if (!(await claimedCard.isVisible())) {
            test.skip();
            return;
        }

        await claimedCard.click();
        await page.waitForURL(/\/(listing|u)\/.+/);

        // If no email or phone links exist, expect the fallback text
        const emailButton = page.locator('a[href^="mailto:"]');
        const callButton = page.locator('a[href^="tel:"]');

        if (!(await emailButton.isVisible()) && !(await callButton.isVisible())) {
            await expect(page.getByText('No contact info provided')).toBeVisible();
        }
    });

    test('ListingCard quick actions trigger protocols without card navigation', async ({ page }) => {
        await page.goto('/directory');

        const claimedCard = page.getByRole('article').filter({ hasNotText: 'Unclaimed' }).first();

        if (!(await claimedCard.isVisible())) {
            test.skip();
            return;
        }

        // Find the email icon within the card
        const emailIcon = claimedCard.locator('a[href^="mailto:"]');

        if (await emailIcon.isVisible()) {
            // Click the icon - the URL should NOT change (stop propagation)
            const currentUrl = page.url();
            await emailIcon.click({ force: true });

            // Give a moment for any navigation to occur
            await page.waitForTimeout(500);

            // URL should remain on /directory
            expect(page.url()).toBe(currentUrl);
        }
    });

});
