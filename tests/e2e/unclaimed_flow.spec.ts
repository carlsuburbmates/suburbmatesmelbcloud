import { test, expect } from '@playwright/test';

test('Unclaimed Listing - Search and Routing Flow', async ({ page }) => {
    // 1. Navigate to Directory
    await page.goto('http://localhost:3000/directory');

    // 2. Search for the seeded listing (Unclaimed)
    const searchInput = page.getByPlaceholder('Search keywords');
    await searchInput.fill('Fitzroy Branding');
    await page.keyboard.press('Enter');

    // 3. Verify Card appears
    // Expect "Fitzroy Branding Studio" and "Unclaimed" badge
    const card = page.getByRole('article').filter({ hasText: 'Fitzroy Branding Studio' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('Unclaimed');

    // 4. Click the card -> Should route to Claim page
    await card.click();

    // 5. Verify URL and Claim CTA
    await expect(page).toHaveURL(/\/claim\/.+/); // Regex to match /claim/[uuid]
    await expect(page.getByText('Is this you?')).toBeVisible();
    // OR whatever specific text represents the Claim Page header
});
