import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

test.describe.serial('Studio Advanced Features', () => {

    test('Basic Tier: Should be gated from Design Studio', async ({ page }) => {
        const { data: listing } = await supabase
            .from('listings')
            .select('id')
            .eq('slug', 'e2e-test-studio')
            .single();

        if (!listing) throw new Error('Seeded listing not found');

        // Downgrade to Basic
        await supabase
            .from('listings')
            .update({ tier: 'Basic' })
            .eq('id', listing.id);

        await page.goto('/studio/design');

        // "Unlock Design Studio"
        await expect(page.locator('body')).toContainText('Unlock Design Studio');
        await expect(page.getByRole('link', { name: /Upgrade/i })).toBeVisible();
    });

    test('Pro Tier: Should access Vibe Tuner and Public Site', async ({ page }) => {
        const { data: listing } = await supabase
            .from('listings')
            .select('id')
            .eq('slug', 'e2e-test-studio')
            .single();

        if (!listing) throw new Error('Seeded listing not found');

        // Upgrade to Pro
        const { error: updateError, data: updated } = await supabase
            .from('listings')
            .update({ tier: 'Pro' })
            .eq('id', listing.id)
            .select()
            .single();

        if (updateError) console.error('DB Update Error:', updateError);

        await page.goto('/studio/design');

        await expect(page.getByText('Visual Theme')).toBeVisible();

        // Change Theme - SSOT 'Editorial'
        await page.getByRole('button', { name: 'Editorial' }).click();
        await page.getByRole('button', { name: 'Save Changes' }).click();

        await expect(page.getByText('Mini-site updated!')).toBeVisible();

        // Public Site Verification
        await page.goto('/u/e2e-test-studio');
        // Editorial uses 'bg-stone-100'
        await expect(page.locator('main')).toHaveClass(/bg-stone-100/);
    });

    test('Public Access: Mini-site should be viewable by guests', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.goto('/u/e2e-test-studio');
        await expect(page.locator('h1')).toBeVisible();
        await context.close();
    });

});
