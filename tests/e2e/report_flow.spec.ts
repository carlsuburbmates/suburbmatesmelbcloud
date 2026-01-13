import { test, expect } from '@playwright/test';

test.describe('Public Report Flow', () => {

    test('User can report a listing from the details page', async ({ page }) => {
        // 1. Navigate to Directory
        await page.goto('/directory');

        // 2. Find and click a listing (any listing)
        // Note: ListingCards are wrapped in Links. We use that as the selector.
        const listingCard = page.getByRole('link').filter({ hasText: /View Studio|Claim Profile/ }).first();
        await expect(listingCard).toBeVisible();
        await listingCard.click();

        // 3. Verify on Listing Page (either standard or pro profile)
        await expect(page).toHaveURL(/\/listing\/.+|\/u\/.+/);

        // 4. Click "Report" (Flag icon)
        // Adjust selector based heavily on known UI (e.g., text or icon)
        const reportButton = page.getByRole('button', { name: /report|flag/i }).first();
        await expect(reportButton).toBeVisible();
        await reportButton.click({ force: true });

        // 5. Verify Modal appears
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText('Report this listing')).toBeVisible();

        // 6. Fill Form
        // Assuming a select for reason and textarea for details
        await page.getByRole('combobox').click();
        await page.getByRole('option').first().click(); // Select first reason

        await page.getByPlaceholder(/details|additional info/i).fill('Automated Test: Reporting this listing for verification.');

        // 7. Submit
        await page.getByRole('button', { name: /submit|send/i }).click();

        // 8. Verify Success Toast
        await expect(page.getByText(/Report Submitted/i)).toBeVisible();
    });

});
