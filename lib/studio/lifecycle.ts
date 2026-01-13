import { Database } from "@/types/supabase";

export type StudioLifecycleStage = 'S0' | 'S1' | 'S2' | 'S3';

export interface LifecycleProgress {
    stage: StudioLifecycleStage;
    label: string;
    missing: string[];
}

export function calculateLifecycle(
    listing: Database['public']['Tables']['listings']['Row'],
    productCount: number
): LifecycleProgress {
    const missing: string[] = [];

    // S0 -> S1 Requirements (Minimum for Live)
    if (!listing.name) missing.push('Business Name');
    if (!listing.location) missing.push('Location');
    if (!listing.category_id) missing.push('Category');

    if (missing.length > 0) {
        return { stage: 'S0', label: 'Incomplete', missing };
    }

    // S3 (Pro-enabled)
    if (listing.tier === 'Pro') {
        return { stage: 'S3', label: 'Pro-enabled', missing: [] };
    }

    // S2 Requirements (Optimised) - From CREATOR_STUDIO_SPEC.md
    const hasDescription = listing.description && listing.description.length > 20;
    const hasProducts = productCount > 0;
    const hasContact = !!(listing.contact_email || listing.phone);
    const categoryConfirmed = !!listing.category_confirmed_at;
    const policyAccepted = !!listing.policy_accepted_at;

    const s2Missing: string[] = [];
    if (!hasDescription) s2Missing.push('Detailed Description');
    if (!hasProducts) s2Missing.push('At least one Product');
    if (!hasContact) s2Missing.push('Contact Method (Email or Phone)');
    if (!categoryConfirmed) s2Missing.push('Confirm Business Category');
    if (!policyAccepted) s2Missing.push('Accept Platform Policy');

    if (s2Missing.length === 0) {
        return { stage: 'S2', label: 'Optimised', missing: [] };
    }

    // If S1 criteria met but not S2
    return { stage: 'S1', label: 'Live (Basic)', missing: s2Missing };
}
