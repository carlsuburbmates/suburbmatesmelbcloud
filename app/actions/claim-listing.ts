'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/email';
import { cookies } from 'next/headers';

// Schema for Claim Submission
const ClaimSchema = z.object({
    listingId: z.string().uuid(),
    abn: z.string().length(11, 'ABN must be 11 digits'),
    // Add more fields if needed (e.g., Contact Name, Phone)
});

// ABN Luhn Algorithm Check
function validateABN(abn: string): boolean {
    if (abn.length !== 11) return false;

    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const digits = abn.split('').map(Number);

    // Subtract 1 from the first digit
    digits[0] -= 1;

    const sum = digits.reduce((acc, digit, index) => {
        return acc + digit * weights[index];
    }, 0);

    return sum % 89 === 0;
}

export async function claimListing(formData: FormData) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 2. Validation (Pre-auth validation)
    const rawData = {
        listingId: formData.get('listingId'),
        abn: formData.get('abn')?.toString().replace(/\D/g, ''), // Strip non-digits
    };

    const validation = ClaimSchema.safeParse(rawData);
    if (!validation.success) {
        return { error: 'Invalid Input: ' + validation.error.errors[0].message };
    }

    const { listingId, abn } = validation.data;

    if (!user) {
        // PERMANENT FIX: Persist claim data in cookies for after auth
        const cookieStore = await cookies();
        cookieStore.set('pending_claim_id', listingId, { maxAge: 60 * 10 }); // 10 mins
        cookieStore.set('pending_claim_abn', abn, { maxAge: 60 * 10 });

        // Redirect to login with a specific callback path
        redirect(`/auth/login?next=/auth/callback/claim`);
    }

    // 3. ABN Check (Auto-Luhn)
    if (!validateABN(abn)) {
        return { error: 'Invalid ABN Checksum. Please check your number.' };
    }

    // 4. Listing Status Check
    const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('status, name')
        .eq('id', listingId)
        .single();

    if (listingError || !listing) {
        return { error: 'Listing not found.' };
    }

    if (listing.status === 'claimed') {
        return { error: 'This listing is already claimed.' };
    }

    // 5. Execute Claim (Transition S0 -> S1)
    // We need to link the User record to the Listing.
    // Assuming 'owner_id' on listings table is the foreign key to users_public(id).

    // AI Triage Check (Inline)
    // We can't really check content here as claiming doesn't change content much
    // unless we validate the listing content *already* in DB or implied by the claim.
    // However, ABN claim establishes verification. 
    // Let's set to 'safe' if verified, or 'pending' if we want manual review of the connection.
    // For now, let's keep 'pending' for manual review OR 'safe' if we trust ABN logic.
    // Given Solo Operator, let's auto-approve claims as 'safe' if ABN passes, 
    // relying on subsequent content updates to trigger flags.

    const triage_status = 'safe'; // ABN validated = Safe Claim

    const { error: updateError } = await supabase
        .from('listings')
        .update({
            status: 'claimed',
            owner_id: user.id,
            abn: abn,
            triage_status: triage_status,
        })
        .eq('id', listingId);

    if (updateError) {
        return { error: 'Failed to claim listing: ' + updateError.message };
    }


    // 6. Role Promotion (Visitor -> Creator)
    const { data: userData } = await supabase
        .from('users_public')
        .select('role')
        .eq('id', user.id)
        .single();

    if (userData?.role === 'visitor') {
        await supabase
            .from('users_public')
            .update({ role: 'creator' })
            .eq('id', user.id);
    }

    // 7. Notification (Welcome / Claim)
    if (user.email) {
        // Use listing name
        const { sendListingClaimedEmail } = await import('@/lib/email');
        const listingName = (await supabase.from('listings').select('name').eq('id', listingId).single()).data?.name || 'Your Listing';
        await sendListingClaimedEmail(user.email, listingName);
    }

    // 8. Redirect
    revalidatePath(`/listing/${listingId}`);
    redirect(`/studio/onboarding/${listingId}`);
}
