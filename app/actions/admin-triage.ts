'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { sendListingApprovedEmail, sendListingRejectedEmail } from '@/lib/email';
import { logAudit } from '@/lib/admin/audit';

async function checkOperator() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase
        .from('users_public')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'operator') {
        throw new Error('Forbidden: Operator Access Only');
    }
    return supabase;
}

export async function approveListing(listingId: string) {
    const supabase = await checkOperator();
    const adminSupabase = createAdminClient();

    // 1. Fetch current ABN and details
    const { data: currentListing } = await supabase
        .from('listings')
        .select('abn, name, slug, owner_id')
        .eq('id', listingId)
        .single();

    let isVerified = false;
    if (currentListing?.abn) {
        const { validateABN } = await import('@/lib/admin/abn');
        const abnCheck = validateABN(currentListing.abn);
        if (abnCheck.isValid) {
            isVerified = true;
            await logAudit({
                action: 'VERIFY_ABN_SUCCESS',
                targetId: listingId,
                targetType: 'listing',
                metadata: { abn: currentListing.abn }
            });
        } else {
            await logAudit({
                action: 'VERIFY_ABN_FAILURE',
                targetId: listingId,
                targetType: 'listing',
                metadata: { abn: currentListing.abn, reason: abnCheck.message }
            });
        }
    }

    // 2. Update Status and Verification
    const { data: listing, error } = await supabase
        .from('listings')
        .update({
            triage_status: 'safe',
            triage_reason: null,
            is_verified: isVerified
        })
        .eq('id', listingId)
        .select('name, slug, owner_id')
        .single();

    if (error) throw new Error(error.message);

    await logAudit({
        action: 'APPROVE_LISTING',
        targetId: listingId,
        targetType: 'listing',
        metadata: { isVerified }
    });

    // 2. Notify Owner
    if (listing && listing.owner_id) {
        const { data: userData } = await adminSupabase.auth.admin.getUserById(listing.owner_id);

        if (userData?.user?.email) {
            await sendListingApprovedEmail(userData.user.email, listing.name, listing.slug || listingId);
        }
    }

    revalidatePath('/admin/triage');
}

export async function flagListing(listingId: string, reason: string) {
    const supabase = await checkOperator();
    const adminSupabase = createAdminClient();

    // 1. Update Status
    const { data: listing, error } = await supabase
        .from('listings')
        .update({
            triage_status: 'flagged',
            triage_reason: reason
        })
        .eq('id', listingId)
        .select('name, owner_id')
        .single();

    if (error) throw new Error(error.message);

    await logAudit({
        action: 'FLAG_LISTING',
        targetId: listingId,
        targetType: 'listing',
        metadata: { reason }
    });

    // 2. Notify Owner
    if (listing && listing.owner_id) {
        const { data: userData } = await adminSupabase.auth.admin.getUserById(listing.owner_id);

        if (userData?.user?.email) {
            await sendListingRejectedEmail(userData.user.email, listing.name, reason);
        }
    }

    revalidatePath('/admin/triage');
}
