import { Database } from '@/types/supabase';

type Listing = Database['public']['Tables']['listings']['Row'] & {
    products?: { count: number }[];
};

export type StudioStage = 'S0' | 'S1' | 'S2' | 'S3';

/**
 * Calculates the current Studio Lifecycle Stage based on strict SSOT criteria.
 * @see docs/SSOT/CREATOR_STUDIO_SPEC.md#3a-studio-lifecycle-and-progression
 */
export function calculateStage(listing: Listing): StudioStage {
    // S3: Pro-enabled
    if (listing.tier === 'Pro') {
        return 'S3';
    }

    // S2 Logic: Optimised
    // Criteria: Description, Category, Location (via listing object), Contact info (via verification or check - simplified here), 1+ Product
    const hasDescription = !!listing.description && listing.description.length > 20;
    const hasCategory = !!listing.category_id;
    // Fix: Use 'location' property as per Supabase schema
    const hasLocation = !!listing.location;
    // Fix: Use 'phone' or 'contact_email' as per Supabase schema
    const hasContact = !!listing.phone || !!listing.contact_email;
    const hasProduct = (listing.products?.[0]?.count ?? 0) > 0;

    if (hasDescription && hasCategory && hasLocation && hasContact && hasProduct) {
        return 'S2';
    }

    // S1: Live (Basic)
    // Criteria: Mandatory fields (Name, Category, Location)
    // Fix: Use 'name' instead of 'title'
    if (!!listing.name && hasCategory && hasLocation) {
        return 'S1';
    }

    // Default: Incomplete
    return 'S0';
}

/**
 * Returns the next recommended action for the Creator based on their defined stage.
 */
export function getNextAction(stage: StudioStage, listingId: string) {
    switch (stage) {
        case 'S0':
            return {
                label: 'Complete Listing Details',
                href: '/studio/details',
                description: 'Add your basic business information to go live.'
            };
        case 'S1':
            return {
                label: 'Optimize Studio',
                href: '/studio/products',
                description: 'Add a product to unlock Featured Placement.'
            };
        case 'S2':
            return {
                label: 'Upgrade to Pro',
                href: '/pricing',
                description: 'Unlock Mini-site and Share Kit.'
            };
        case 'S3':
            return {
                label: 'Share Mini-site',
                href: '/studio/share',
                description: 'Distribute your new Pro page.'
            };
    }
}

/**
 * Checks if a specific feature is gated for the current listing.
 */
export function isFeatureUnlocked(listing: Listing, feature: 'mini_site' | 'share_kit' | 'featured_placement'): boolean {
    const stage = calculateStage(listing);

    switch (feature) {
        case 'mini_site':
        case 'share_kit':
            return stage === 'S3';
        case 'featured_placement':
            return stage === 'S2' || stage === 'S3';
    }
}
