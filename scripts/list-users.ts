
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

async function listUsers() {
    console.log('Listing users...');

    // Check Auth Users (Source of Truth)
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Error checking auth users:', authError.message);
    } else {
        console.log('--- auth.users ---');
        console.table(authUsers.map(u => ({ id: u.id, email: u.email, confirmed_at: u.confirmed_at })));
    }

    // Select all users from users_public
    const { data: publicUsers, error: publicError } = await supabase
        .from('users_public')
        .select('id, email, full_name, role');

    if (publicError) {
        console.error('Error fetching public users:', publicError.message);
    } else {
        console.log('--- users_public ---');
        console.table(publicUsers || []);
    }
}

listUsers();
