
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncUsers() {
    console.log('Syncing users to users_public...');

    // 1. Fetch all Auth Users
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError || !authUsers) {
        console.error('Error fetching auth users:', authError?.message);
        return;
    }

    console.log(`Found ${authUsers.length} users in Auth. Checking users_public...`);

    for (const user of authUsers) {
        // 2. Check existence
        const { data: existing } = await supabase
            .from('users_public')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!existing) {
            console.log(`Syncing user: ${user.email}`);

            // 3. Upsert
            const { error: insertError } = await supabase
                .from('users_public')
                .insert({
                    id: user.id,
                    email: user.email,
                    // Default values
                    role: 'visitor',
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    avatar_url: user.user_metadata?.avatar_url
                });

            if (insertError) {
                console.error(`Failed to sync ${user.email}:`, insertError.message);
            }
        }
    }
    console.log('Sync complete.');
}

syncUsers();
