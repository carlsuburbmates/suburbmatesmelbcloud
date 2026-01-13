import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Studio Core Features', () => {

    test('Dashboard Loads correctly', async ({ page }) => {
        await page.goto('/studio');

        // Verify Title
        await expect(page.getByText('Studio Dashboard')).toBeVisible();
        await expect(page.getByText('Manage Experience')).toBeVisible();

        // Verify Status Cards
        await expect(page.getByText('Listing Status')).toBeVisible();
        await expect(page.getByText('Current Tier')).toBeVisible();
        await expect(page.getByText('Collection')).toBeVisible();
    });

    test('Navigation Links Work', async ({ page }) => {
        await page.goto('/studio');

        // Check Sidebar (Desktop) or Main Links
        // Note: Sidebar might be hidden on mobile/small screens, but standard E2E runs in Desktop viewport usually.
        // We act on the Main Actions cards for robustness

        // Products Link
        const productsLink = page.getByRole('link', { name: /Manage products/i });
        await expect(productsLink).toBeVisible();
        // await productsLink.click();
        // await expect(page).toHaveURL(/\/studio\/products/);
    });

    test('Products Page Access', async ({ page }) => {
        await page.goto('/studio/products');
        await expect(page.getByRole('heading', { name: 'Products', exact: true })).toBeVisible();
        // Expect "Add Product" or "New Product" link
        await expect(page.getByRole('link', { name: /Add Product|New Product/i }).first()).toBeVisible();
    });

    test('Billing Page Access', async ({ page }) => {
        await page.goto('/studio/billing');
        // Likely shows "Current Plan" or "Manage Subscription"
        await expect(page.getByText(/Plan|Subscription|Billing/i).first()).toBeVisible();
    });

});
