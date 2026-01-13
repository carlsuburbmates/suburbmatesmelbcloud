import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Note: This client uses the Service Role Key and should ONLY be used
// in secure Server Contexts (API Routes, Webhooks).
// NEVER expose this client to the browser.

export function createAdminClient() {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const sbServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!sbServiceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing. Cannot create Admin Client.');
    }

    return createClient<Database>(sbUrl, sbServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
