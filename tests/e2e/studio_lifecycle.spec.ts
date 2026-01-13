import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Use the authenticated state from global.setup
const authFile = 'playwright/.auth/user.json';

if (fs.existsSync(path.resolve(authFile))) {
    test.use({ storageState: authFile });
} else {
    console.warn('Auth file not found, test might fail if not skipped. Path:', path.resolve(authFile));
}

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

test.describe('Studio Lifecycle', () => {
    let supabase: any;
    let listingId: string;

    test.beforeAll(async () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase URL or Service Role Key missing');
        }

        supabase = createClient(supabaseUrl, serviceRoleKey);

        const checkSlug = 'e2e-test-studio';
        const { data } = await supabase.from('listings').select('id, owner_id').eq('slug', checkSlug).single();

        if (data) {
            listingId = data.id;
        } else {
            console.warn('Test listing e2e-test-studio not found. Test might fail.');
        }
    });

    test('Full Lifecycle: S0 -> S1 -> S2', async ({ page }) => {
        if (!listingId) test.skip();

        // Capture Console logs
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

        // 1. Force Downgrade to S0 (Incomplete)
        const { error } = await supabase.from('listings').update({ name: '', description: null, phone: null }).eq('id', listingId);
        if (error) console.error('Downgrade failed:', error);

        // 2. Verify S0 in Dashboard
        await page.goto('/studio');
        await expect(page.getByText('Complete Listing Details')).toBeVisible();

        // 3. S0 -> S1 (Fill Details)
        await page.getByRole('link', { name: /Complete/i }).click();
        await expect(page).toHaveURL(/\/studio\/details/);

        // Fill Form
        await page.fill('input[name="name"]', 'Recovered Studio Name');
        await page.fill('textarea[name="description"]', 'A valid description that is definitely longer than twenty characters to satisfy the S2 requirement.');
        await page.fill('input[name="phone"]', '0400111222');

        // Explicitly select a category (First option that is not empty)
        // Check if there are options
        const options = await page.locator('select[name="category_id"] option').count();
        if (options > 0) {
            // Select index 1 (assuming 0 might be placeholder)
            await page.selectOption('select[name="category_id"]', { index: 0 });
        }

        // Wait a bit
        await page.waitForTimeout(500);

        await page.click('button[type="submit"]');

        // Check for error message immediately
        const errorMsg = page.locator('.bg-red-50');
        if (await errorMsg.isVisible()) {
            console.log('Submission Error Displayed:', await errorMsg.textContent());
            throw new Error('Form submission error: ' + await errorMsg.textContent());
        }

        // 4. Verify S1 (Optimize Studio)
        try {
            await page.waitForURL(/\/studio\?onboarding=success/, { timeout: 30000 });
        } catch (e) {
            console.log('Navigation Failed. Current URL:', page.url());
            console.log('Page Text:', await page.innerText('body'));
            throw e;
        }

        await expect(page.getByText('Successfully Published')).toBeVisible();
        await expect(page.getByText('Optimize Studio')).toBeVisible();

        // 5. S1 -> S2 (Add Product)
        await page.getByRole('link', { name: /Optimize Studio/i }).click();
        await expect(page).toHaveURL(/\/studio\/products/);

        const addBtn = page.getByRole('link', { name: /Add Product/i }).or(page.getByRole('button', { name: /Add Product/i })).first();
        await addBtn.click();

        await page.fill('input[name="name"]', 'Test Product S2');
        await page.fill('textarea[name="description"]', 'A great product description');
        await page.fill('input[name="price"]', '50');

        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);

        await page.goto('/studio');
        await expect(page.getByText('Upgrade to Pro')).toBeVisible();
    });

});
