'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { analyzeListingContent } from '@/lib/ai/triage';


const UpdateListingSchema = z.object({
    listingId: z.string().uuid(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    category_id: z.string().uuid(),
    description: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    contact_email: z.string().email().optional().or(z.literal('')),
    abn: z.string().optional(),
    location: z.string().min(1, 'Location (Council) is required'),
});

function isValidABN(abn: string): boolean {
    const cleanABN = abn.replace(/\s+/g, '');
    if (cleanABN.length !== 11 || !/^\d+$/.test(cleanABN)) return false;

    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    let sum = 0;

    for (let i = 0; i < 11; i++) {
        let digit = parseInt(cleanABN[i]);
        if (i === 0) digit -= 1;
        sum += digit * weights[i];
    }

    return sum % 89 === 0;
}

export async function updateListing(formData: FormData) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/auth/login');
    }

    // 2. Validation
    const rawData = {
        listingId: formData.get('listingId'),
        name: formData.get('name'),
        category_id: formData.get('category_id'),
        description: formData.get('description'),
        phone: formData.get('phone'),
        website: formData.get('website'),
        contact_email: formData.get('contact_email'),
        abn: formData.get('abn'),
        location: formData.get('location'),
    };

    const validation = UpdateListingSchema.safeParse(rawData);
    if (!validation.success) {
        return { error: 'Invalid Input: ' + validation.error.errors[0].message };
    }

    const { listingId, name, category_id, description, phone, website, contact_email, abn, location } = validation.data;

    // 3. Ownership Check (Critical)
    const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('owner_id')
        .eq('id', listingId)
        .single();

    if (listingError || !listing) {
        return { error: 'Listing not found.' };
    }

    if (listing.owner_id !== user.id) {
        return { error: 'Unauthorized: You do not own this listing.' };
    }

    // 3b. ABN Validation
    if (abn && !isValidABN(abn)) {
        return { error: 'Invalid ABN format. Please check and try again.' };
    }

    // 4. Triage Check (AI Agent)
    // We need the category name for the AI to triage effectively.
    // Fetch category name first (optimizable via join in ownership check above, but separate for clarity)
    const { data: category } = await supabase
        .from('categories')
        .select('name')
        .eq('id', category_id)
        .single();

    const categoryName = category?.name || 'Unknown';

    const triageResult = await analyzeListingContent(name, description || '', categoryName);
    const triage_status = triageResult.status;
    const triage_reason = triageResult.reason;

    // 5. Update
    const { error: updateError } = await supabase
        .from('listings')
        .update({
            name,
            category_id,
            description,
            phone,
            website,
            contact_email,
            abn,
            location,
            triage_status,
            triage_reason,
            updated_at: new Date().toISOString(),
        })
        .eq('id', listingId);

    if (updateError) {
        return { error: 'Update Failed: ' + updateError.message };
    }

    revalidatePath(`/studio/details`);
    revalidatePath(`/studio`); // Also revalidate dashboard to show new state

    return { success: true };
}
