'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const DesignSchema = z.object({
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case (lowercase, numbers, hyphens)'),
    branding: z.object({
        theme: z.enum(['swiss', 'editorial', 'monochrome']),
        primaryColor: z.string().optional(),
        coverImage: z.string().optional(),
        logo: z.string().optional(),
    }),
    social_links: z.object({
        instagram: z.string().optional(),
        tiktok: z.string().optional(),
        website: z.string().optional(),
    }),
});

export async function updateDesign(listingId: string, formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Validate Ownership
    const { data: listing } = await supabase
        .from('listings')
        .select('id, tier')
        .eq('id', listingId)
        .eq('owner_id', user.id)
        .single();

    if (!listing) throw new Error('Listing not found or access denied');

    if (listing.tier !== 'Pro') {
        throw new Error('Upgrade to Pro to customize your mini-site.');
    }

    // Parse Data
    const result = DesignSchema.safeParse(formData);
    if (!result.success) {
        throw new Error(result.error.errors[0].message);
    }

    const { slug, branding, social_links } = result.data;

    // Check Slug Uniqueness if changed
    // (Ideally fetch current slug first, but simple try/catch on unique violation works too)

    try {
        const { error } = await supabase
            .from('listings')
            .update({
                slug,
                branding,
                social_links
            })
            .eq('id', listingId);

        if (error) {
            if (error.code === '23505') throw new Error('Slug is already taken.');
            throw error;
        }

        revalidatePath(`/u/${slug}`);
        revalidatePath(`/studio/design`);
        return { success: true };
    } catch (err: any) {
        return { error: err.message };
    }
}
