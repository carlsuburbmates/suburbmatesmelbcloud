import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { claimListing } from '@/app/actions/claim-listing';

/**
 * Specialized callback for claims.
 * This is hit after the user clicks the magic link.
 * It reads the pending claim data from cookies and executes the claim.
 */
export async function GET(request: Request) {
    const { origin } = new URL(request.url);
    const supabase = await createClient();

    // 1. Ensure user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.redirect(`${origin}/auth/login`);
    }

    // 2. Read pending claim data from cookies
    const cookieStore = await cookies();
    const listingId = cookieStore.get('pending_claim_id')?.value;
    const abn = cookieStore.get('pending_claim_abn')?.value;

    if (!listingId || !abn) {
        // Data lost or session expired
        return NextResponse.redirect(`${origin}/directory?error=claim_timeout`);
    }

    // 3. Construct FormData to reuse existing server action
    const formData = new FormData();
    formData.append('listingId', listingId);
    formData.append('abn', abn);

    // 4. Clear cookies immediately to prevent double-calls
    cookieStore.delete('pending_claim_id');
    cookieStore.delete('pending_claim_abn');

    // 5. Execute Claim
    // We can directly call the action or implement the core logic if needed.
    // Calling the action is best for DRY.
    try {
        const result = await claimListing(formData);

        if (result?.error) {
            return NextResponse.redirect(`${origin}/claim/${listingId}?error=${encodeURIComponent(result.error)}`);
        }

        // Success: Redirect to onboarding (handled by server action if it doesn't throw)
        return NextResponse.redirect(`${origin}/studio/onboarding/${listingId}`);
    } catch (e) {
        // server action might redirect, which is an 'error' in this try/catch block for Next.js
        // We need to handle the redirect specifically if we were using it in a Route Handler,
        // but since we are in a GET route, and claimListing redirects...
        // Wait, server action 'redirect' throws an error.

        // Actually, if it redirects, Next.js handles it.
        throw e;
    }
}
