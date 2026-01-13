import { test, expect } from '@playwright/test';

test.describe('Authentication & Onboarding Flow', () => {

    test('Login Page - Render & Magic Link Validations', async ({ page }) => {
        // 1. Visit Login
        await page.goto('/auth/login');
        await expect(page).toHaveTitle(/Login|Sign In/i);

        // 2. Check Form Elements
        const emailInput = page.locator('input#email');
        const submitBtn = page.getByRole('button', { name: /Send Magic Link/i });

        await expect(emailInput).toBeVisible();
        await expect(submitBtn).toBeVisible();

        // 3. Validation Interaction (Invalid Email)
        await emailInput.fill('invalid-email');
        // HTML5 validation might block submission, so we check validity or error message
        // Playwright can check validity state
        // await expect(emailInput).toHaveJSProperty('validity.valid', false);

        // 4. Valid Interaction
        await emailInput.fill('test-user@suburbmates.com.au');
        await submitBtn.click();

        // 5. Expect Success Message
        await expect(page.getByText('Check your email for the magic link!')).toBeVisible();

        // Visual
        await expect(page).toHaveScreenshot('login-success-state.png');
    });

    test('Register Page - Render Check', async ({ page }) => {
        await page.goto('/auth/register');

        // Register uses same form but different wrapper text
        await expect(page.getByRole('heading', { name: /Start your journey/i })).toBeVisible();

        const emailInput = page.locator('input#email');
        await expect(emailInput).toBeVisible();

        await expect(page).toHaveScreenshot('register-page.png');
    });

    // TODO: We cannot easily test full magic link flow E2E without an email inbox service.
    // Ideally we mock the backend response or use a specific test-mode supabase user.
    // For now, we verify the frontend "handoff" state.

    test('Protected Routes Redirect to Login', async ({ page }) => {
        const protectedPaths = ['/studio', '/studio/dashboard'];

        for (const path of protectedPaths) {
            await page.goto(path);
            // Should redirect to auth/login OR show a 403.
            // Adjust regex based on actual middleware behavior
            await expect(page).toHaveURL(/\/auth\/login/);
        }
    });

});
