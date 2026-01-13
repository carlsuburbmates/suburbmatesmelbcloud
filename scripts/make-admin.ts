
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address.');
        console.log('Usage: npx tsx scripts/make-admin.ts <email>');
        process.exit(1);
    }

    console.log(`Promoting ${email} to Operator...`);

    // 1. Check if user exists in users_public
    const { data: user, error: findError } = await supabase
        .from('users_public')
        .select('*')
        .eq('email', email)
        .single();

    if (findError || !user) {
        console.error(`User with email ${email} not found in users_public.`);
        console.log('Please sign up independently at /auth/login first.');
        process.exit(1);
    }

    // 2. Update Role
    const { error: updateError } = await supabase
        .from('users_public')
        .update({ role: 'operator' })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating user role:', updateError.message);
        process.exit(1);
    }

    console.log(`✅ Success! ${email} is now an Operator.`);
    console.log('You may need to sign out and sign back in for changes to take effect.');
}

makeAdmin();
