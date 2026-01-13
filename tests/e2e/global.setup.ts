import { test as setup, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('authenticate and seed', async ({ page, request }) => {
    // 1. Init Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.warn('Skipping Global Setup: Missing Supabase Env Vars');
        return;
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 2. Define Test User
    const email = 'e2e_test_user@suburbmates.com';
    const password = 'TestPassword123!';

    // 3. Create/Reset User
    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users.users.find(u => u.email === email);

    if (!existingUser) {
        const { error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });
        if (createError) console.error('Error creating test user:', createError);
    }

    // 4. Perform Login via SDK (Bypass UI Magic Link)
    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError || !authData.session) {
        console.error('SDK Login failed:', loginError);
        return;
    }

    // 4b. Seed Listing for Test User (Required for Studio Access)
    // First, clean up any zombie listings with our test slug (from previous failed runs/different users)
    const testSlug = 'e2e-test-studio';
    await supabase.from('listings').delete().eq('slug', testSlug);

    const { data: existingListing } = await supabase
        .from('listings')
        .select('id')
        .eq('owner_id', authData.session.user.id)
        .single();

    if (!existingListing) {
        // Fetch a category first
        const { data: category } = await supabase.from('categories').select('id').limit(1).single();

        if (category) {
            const { error: insertError } = await supabase.from('listings').insert({
                owner_id: authData.session.user.id,
                name: 'E2E Test Studio',
                slug: testSlug,
                category_id: category.id,
                status: 'claimed',
                tier: 'Basic',
                location: 'Melbourne, VIC'
            });
            if (insertError) {
                console.error('Failed to seed listing:', insertError);
            } else {
                console.log('Seeded E2E Test Listing');
            }
        } else {
            console.warn('Could not seed listing: No categories found');
        }
    }

    // 5. Inject Session into Browser Context
    // We use the localStorage method which is standard for supabase-js client side
    // And Cookies for Middleware/Server side
    const projectRef = supabaseUrl.split('.')[0].split('//')[1] || 'suburbmates';
    const tokenName = `sb-${projectRef}-auth-token`;
    const sessionString = JSON.stringify(authData.session);

    await page.goto('/'); // Navigate to a page to set localStorage

    await page.evaluate(({ key, value }) => {
        localStorage.setItem(key, value);
    }, { key: tokenName, value: sessionString });

    // Set Cookie for Middleware
    await page.context().addCookies([{
        name: tokenName,
        value: sessionString,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
    }]);

    // 6. Save storage state
    const authDir = path.dirname(authFile);
    if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

    await page.context().storageState({ path: authFile });
});
