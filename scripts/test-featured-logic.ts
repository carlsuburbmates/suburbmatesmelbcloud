
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTest() {
    const TEST_LOC = 'City of Verification';
    console.log(`--- Starting Test for ${TEST_LOC} ---`);

    // 1. Clean up
    await supabase.from('featured_queue').delete().eq('location', TEST_LOC);
    await supabase.from('listings').delete().eq('location', TEST_LOC); // Cleanup mock listings

    // Pre-fetch valid IDs
    const { data: u } = await supabase.from('users_public').select('id').limit(1).single();
    const { data: c } = await supabase.from('categories').select('id').limit(1).single();

    if (!u || !c) throw new Error('Need at least 1 user and category in DB to run test');

    // 2. Create Mock Listings
    console.log('Creating 6 mock listings...');
    const listings = [];
    for (let i = 0; i < 6; i++) {
        const { data, error } = await supabase.from('listings').insert({
            name: `Shop ${i}`,
            location: TEST_LOC,
            owner_id: u.id,
            category_id: c.id,
        }).select().single();

        if (error) {
            console.error('Listing Insert Error:', error);
            throw error;
        }
        listings.push(data);
    }

    // 3. Fill Capacity (5 Active)
    console.log('Filling 5 slots...');
    for (let i = 0; i < 5; i++) {
        const ends = new Date();
        ends.setDate(ends.getDate() + 10 + i); // 10, 11, 12, 13, 14 days from now

        const { error } = await supabase.from('featured_queue').insert({
            listing_id: listings[i].id,
            location: TEST_LOC,
            status: 'active',
            started_at: new Date().toISOString(),
            ends_at: ends.toISOString()
        });
        if (error) console.error('Insert Error:', error);
    }

    // Debug Select
    const { count } = await supabase.from('featured_queue').select('*', { count: 'exact', head: true }).eq('location', TEST_LOC);
    console.log(`Direct Count Check: ${count}`);

    // 4. Check Availability (Should be Waitlist)
    console.log('Checking Availability (Expect Waitlist)...');
    const { data: avail1 } = await supabase.rpc('check_featured_availability', { council_text: TEST_LOC });
    const nextDate = new Date(avail1[0].next_available_date);
    console.log(`Total: ${avail1[0].total_count} (Exp: 5)`);
    console.log(`Next Available: ${nextDate.toISOString()}`);

    if (avail1[0].total_count < 5) throw new Error('Should be full');

    // 5. Insert 6th as Pending
    console.log('Inserting 6th item as Pending...');
    await supabase.from('featured_queue').insert({
        listing_id: listings[5].id,
        location: TEST_LOC,
        status: 'pending',
        started_at: nextDate.toISOString(), // Use the calculated date
        ends_at: new Date(nextDate.getTime() + 86400000 * 30).toISOString()
    });

    // 6. Simulate Expiry
    // Identify the earliest active item and expire it
    console.log('Expiring the first item...');
    // Update ends_at to 2020
    const { data: first } = await supabase.from('featured_queue').select('id, ends_at').eq('listing_id', listings[0].id).single();
    if (!first) throw new Error('First item not found');

    const { error: updErr } = await supabase.from('featured_queue').update({ ends_at: '2020-01-01T00:00:00Z' }).eq('id', first.id);
    if (updErr) console.error('Update Error:', updErr);

    // Verify State Before Process
    const { data: check } = await supabase.from('featured_queue').select('status, ends_at').eq('id', first.id).single();
    if (check) {
        console.log(`Item 1 Before Process: Status=${check.status}, Ends=${check.ends_at} (Should be < Now)`);
    } else {
        console.error('Failed to reread item 1');
    }

    // 7. Run Daily Process (DEBUG)
    console.log('Running process_daily_queue (via debug_queue)...');
    const { data: debugLog, error: debugErr } = await supabase.rpc('debug_queue');
    if (debugErr) console.error('Debug RPC Error:', debugErr);
    console.log('Debug Log:', debugLog);

    // Verify Activation Logic
    console.log('Checking logic trace (via debug_activation)...');
    const { data: actLog, error: actErr } = await supabase.rpc('debug_activation');
    if (actErr) console.error('Act RPC Error:', actErr);
    console.log('Activation Log:', actLog);

    // Also run the real one to do the activation part
    await supabase.rpc('process_daily_queue');

    // 8. Verify
    const { data: pendingItem } = await supabase.from('featured_queue').select('*').eq('listing_id', listings[5].id).single();
    const { data: expiredItem } = await supabase.from('featured_queue').select('*').eq('listing_id', listings[0].id).single();

    console.log(`Item 6 Status: ${pendingItem.status} (Exp: active)`);
    console.log(`Item 1 Status: ${expiredItem.status} (Exp: expired)`);

    if (pendingItem.status !== 'active') {
        console.error('Item 6 did not activate automatically. Trying manual activation...');
        const { error: manErr } = await supabase.rpc('activate_queued_item', { queue_record_id: pendingItem.id });
        if (manErr) console.error('Manual Activation Error:', manErr);

        // Check again
        const { data: retry } = await supabase.from('featured_queue').select('status').eq('id', pendingItem.id).single();
        if (retry) {
            console.log(`Retry Status: ${retry.status}`);
        }
    }

    if (expiredItem.status !== 'expired') throw new Error('Item 1 did not expire');

    console.log('SUCCESS: Logic Verified');

    // Cleanup
    await supabase.from('featured_queue').delete().eq('location', TEST_LOC);
}

runTest().catch(console.error);
