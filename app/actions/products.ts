'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { scanContent } from '@/lib/triage'; // Re-use triage logic? Or just skip for products for now.

const ProductSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.coerce.number().min(0),
    category_id: z.string().uuid(),
    image_url: z.string().optional(), // We'll handle upload client-side and pass URL? Or use bucket.
});

// Helper to get my listing
async function getMyListingId(supabase: any, userId: string) {
    const { data, error } = await supabase
        .from('listings')
        .select('id')
        .eq('owner_id', userId)
        .single();
    if (error || !data) return null;
    return data.id;
}

export async function createProduct(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    const listingId = await getMyListingId(supabase, user.id);
    if (!listingId) return { error: 'No listing found for this user.' };

    // Enforce Product Quotas
    const { data: listing } = await supabase
        .from('listings')
        .select('tier')
        .eq('id', listingId)
        .single();

    if (!listing) return { error: 'Listing not found.' };

    const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', listingId);

    const currentCount = count || 0;
    const tier = listing.tier || 'Basic';

    if (tier === 'Basic' && currentCount >= 3) {
        return { error: 'Basic plan limited to 3 products. Upgrade to add more.' };
    }

    if (tier === 'Pro' && currentCount >= 10) {
        return { error: 'Pro plan limited to 10 products.' };
    }

    const raw = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: formData.get('price'),
        category_id: formData.get('category_id'),
        image_url: formData.get('image_url'),
    };

    const validation = ProductSchema.safeParse(raw);
    if (!validation.success) return { error: validation.error.message };

    const { error } = await supabase.from('products').insert({
        listing_id: listingId,
        ...validation.data
    });

    if (error) return { error: error.message };
    revalidatePath('/studio/products');
    return { success: true };
}

export async function updateProduct(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    const listingId = await getMyListingId(supabase, user.id);
    if (!listingId) return { error: 'Unauthorized' };

    const productId = formData.get('id') as string;

    // Verify ownership of product indirectly via listing?
    // Or just update where id = productId AND business_id = listingId?
    // Faster.

    const raw = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: formData.get('price'),
        category_id: formData.get('category_id'),
        image_url: formData.get('image_url'),
    };

    const validation = ProductSchema.safeParse(raw);
    if (!validation.success) return { error: validation.error.message };

    const { error } = await supabase
        .from('products')
        .update({ ...validation.data, updated_at: new Date().toISOString() })
        .eq('id', productId)
        .eq('listing_id', listingId); // Security wrapper

    if (error) return { error: error.message };
    revalidatePath('/studio/products');
    return { success: true };
}

export async function deleteProduct(productId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    const listingId = await getMyListingId(supabase, user.id);
    if (!listingId) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('listing_id', listingId);

    if (error) return { error: error.message };
    revalidatePath('/studio/products');
    return { success: true };
}
