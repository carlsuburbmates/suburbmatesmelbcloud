import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/auth/login');
    }

    const formData = await request.formData();
    const abn = formData.get('abn') as string;
    const listingId = formData.get('listingId') as string;

    if (!abn || !listingId) {
        // In a real app, we'd return a JSON error or redirect with error param
        return redirect('/studio/verification?error=invalid_submission');
    }

    // Basic ABN Format Validation (11 digits, spaces optional)
    const cleanAbn = abn.replace(/\s/g, '');
    if (!/^\d{11}$/.test(cleanAbn)) {
        return redirect('/studio/verification?error=invalid_abn_format');
    }

    // Verify Ownership
    const { data: listing } = await supabase
        .from('listings')
        .select('id')
        .eq('id', listingId)
        .eq('owner_id', user.id)
        .single();

    if (!listing) {
        return redirect('/studio?error=unauthorized');
    }

    // Update Listing
    // Note: We don't verify automatically in this MVP, we just save it.
    // Ideally this would trigger a background job or manual review queue.
    const { error } = await supabase
        .from('listings')
        .update({
            abn: cleanAbn,
            // In a real flow, we might set is_verified = false until manual check
            // For this MVP, we might auto-verify or leave as pending. 
            // The UI logic shows "Verified" badge if `listing.verified` is true.
            // Let's assume manual review is needed, so we don't set verified=true yet.
        })
        .eq('id', listing.id);

    if (error) {
        return redirect('/studio/verification?error=database_error');
    }

    return redirect('/studio/verification?onboarding=success');
}
