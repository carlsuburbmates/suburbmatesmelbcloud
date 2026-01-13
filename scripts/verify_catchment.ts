import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyCatchment() {
    console.log("🧪 Verifying Catchment Logic...");

    // 1. Create Test Owner
    const { data: user } = await supabase.auth.signUp({
        email: `test_catchment_${Date.now()}@example.com`,
        password: 'Password123!',
    });
    const userId = user.user?.id;
    if (!userId) throw new Error("Failed to create user");

    // 2. Create Listings in SAME Council (City of Yarra)
    // Richmond -> City of Yarra
    // Collingwood -> City of Yarra
    const { data: listingA, error: errA } = await supabase.from('listings').insert({
        name: 'Listing Richmond',
        location: 'Richmond',
        category_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', // Web Design
        tier: 'Basic',
        status: 'claimed',
        owner_id: userId
    }).select().single();
    if (errA) console.error("Error inserting Listing A:", errA);

    const { data: listingB, error: errB } = await supabase.from('listings').insert({
        name: 'Listing Collingwood',
        location: 'Collingwood', // Same Council
        category_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
        tier: 'Basic',
        status: 'claimed',
        owner_id: userId
    }).select().single();
    if (errB) console.error("Error inserting Listing B:", errB);

    // 3. Search for "Richmond"
    console.log("🔍 Searching for 'Richmond'...");
    const { data: results, error: searchError } = await supabase.rpc('search_listings', {
        location_filter: 'Richmond'
    });

    if (searchError) {
        console.error("RPC Error:", searchError);
        return;
    }

    console.log(`✅ Found ${results?.length} results.`);

    // 4. Verify we got BOTH
    const foundRichmond = results?.find((l: any) => l.name === 'Listing Richmond');
    const foundCollingwood = results?.find((l: any) => l.name === 'Listing Collingwood');

    if (foundRichmond && foundCollingwood) {
        console.log("🎉 SUCCESS: Found BOTH Richmond and Collingwood listings when searching for 'Richmond'!");
        console.log("   This confirms the Council Catchment logic (City of Yarra) is working.");
    } else {
        console.error("❌ FAILURE: Did not find both listings.");
        console.log("Results:", results?.map((r: any) => r.name));
    }

    // Cleanup
    await supabase.from('listings').delete().eq('owner_id', userId);
    await supabase.auth.admin.deleteUser(userId);
}

verifyCatchment();
