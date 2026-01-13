
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE env vars.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function audit() {
    console.log("--- Starting Fresh DB Audit ---");

    // 1. Check Identity Tables
    const { count: usersCount, error: usersErr } = await supabase.from('users_public').select('*', { count: 'exact', head: true });
    const { count: profilesCount, error: profilesErr } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    console.log(`[Identity] users_public: ${usersErr ? 'Error (' + usersErr.code + ')' : 'Exists (' + usersCount + ' rows)'}`);
    console.log(`[Identity] profiles:     ${profilesErr ? 'Error (' + profilesErr.code + ')' : 'EXISTS (' + profilesCount + ' rows) - WARNING'}`);

    if (profilesErr && profilesErr.code === '42P01') {
        console.log("  -> CONFIRMED: 'profiles' table does not exist.");
    }

    // 2. Check Content Tables
    const { count: listingsCount, error: listingsErr } = await supabase.from('listings').select('*', { count: 'exact', head: true });
    const { count: contentListingsCount, error: clErr } = await supabase.from('content_listings').select('*', { count: 'exact', head: true });

    console.log(`[Content] listings:         ${listingsErr ? 'Error' : 'Exists (' + listingsCount + ' rows)'}`);
    console.log(`[Content] content_listings: ${clErr ? 'Error (' + clErr.code + ')' : 'EXISTS - WARNING'}`);
    if (clErr && clErr.code === '42P01') {
        console.log("  -> CONFIRMED: 'content_listings' table does not exist.");
    }


    // 3. Check Service Definitions
    const { data: services, error: serviceErr } = await supabase.from('service_definitions').select('*');
    if (serviceErr) {
        console.log(`[Services] service_definitions: MSDING/ERROR (${serviceErr.message})`);
    } else {
        console.log(`[Services] service_definitions: Found ${services.length} rows.`);
        services.forEach(s => {
            console.log(`  - ${s.slug}: ${s.name} | $${s.price_aud / 100} | ${s.stripe_price_id}`);
        });
    }

    // 4. Check Products
    const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    console.log(`[Marketplace] products: ${productsCount} rows.`);

    console.log("--- Audit Complete ---");
}

audit();
