import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

test.describe.serial('Studio Lifecycle Regression', () => {

    test('Workflow 1.2: Revert to S1 when Product Limit breached (Deleting only product)', async ({ page }) => {
        // 1. Setup Data
        const { data: listing } = await supabase
            .from('listings')
            .select('id')
            .eq('slug', 'e2e-test-studio')
            .single();

        if (!listing) throw new Error('Seeded listing not found');

        // Ensure Category Exists
        let canId = '';
        const { data: cat } = await supabase.from('categories').select('id').eq('name', 'Regression Cat').single();
        if (cat) {
            canId = cat.id;
        } else {
            const { data: newCat, error } = await supabase.from('categories').insert({
                name: 'Regression Cat',
                type: 'product'
            }).select().single();
            if (error) throw error;
            canId = newCat.id;
        }

        // Clean Products
        await supabase.from('products').delete().eq('listing_id', listing.id);

        // Insert 1 Product
        const { error: insertError } = await supabase.from('products').insert({
            listing_id: listing.id,
            category_id: canId,
            name: 'Regression Test Product',
            price: 100
        });
        if (insertError) console.error('Product Insert Error:', insertError);

        // 2. Check S2 State (Wait for server cache to catch up?)
        // We force dynamic on ProductsPage, but Studio Dashboard?
        // Let's go to Products Page first to trigger dynamic fetch if needed.
        await page.goto('/studio/products');
        await expect(page.getByText('Regression Test Product')).toBeVisible();

        // 3. Delete It via UI
        await page.getByRole('link', { name: /Edit/i }).first().click();
        page.on('dialog', dialog => dialog.accept());
        await page.getByTitle('Delete Product').click();

        await expect(page.getByRole('heading', { name: 'Products', exact: true })).toBeVisible();
        await expect(page.getByText('Regression Test Product')).not.toBeVisible();

        // 4. Verify Studio Dashboard Regression
        await page.goto('/studio');
        await expect(page.getByText('Optimize Studio')).toBeVisible();
    });

});
