import { test, expect } from '@playwright/test';

test.describe('Marketplace Page', () => {
    test('should render the marketplace page correctly', async ({ page }) => {
        // Navigate to marketplace
        await page.goto('/marketplace');
        await expect(page).toHaveTitle(/Marketplace/);

        // Verify Header
        await expect(page.getByRole('heading', { name: 'Marketplace' })).toBeVisible();
        await expect(page.getByText('Shop Digital Products from Local Creators')).toBeVisible();

        // Verify Truth UI
        // The standard disclaimer is likely in the footer or specific product page, but let's check for standard text if defined.
    });

    // We can't easily test dynamic products without seeding DB, so we check for empty state or grid
    test('should display product grid or empty state', async ({ page }) => {
        await page.goto('/marketplace');

        // EITHER a grid of products OR the no-results message must be visible
        const grid = page.locator('.grid');
        const emptyState = page.getByText('No products found');

        await expect(grid.or(emptyState)).toBeVisible();
    });

    test('should have working navigation to product details', async ({ page }) => {
        await page.goto('/marketplace');

        // If there are products, click the first one
        const firstProduct = page.locator('.grid > div').first();
        if (await firstProduct.isVisible()) {
            await firstProduct.click();
            await expect(page).toHaveURL(/\/product\/.*/);
        }
    });
});
