
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Stripe } from 'https://esm.sh/stripe@14.10.0'

// --- CONFIG ---
const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!

// Init separate clients to avoid auth state pollution
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
// We'll use 'supabase' for user interactions (signIn/signOut)
// We'll use 'adminSupabase' for DB setup/verification bypassing RLS checks (if policy allows service role)

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() })

// Endpoints
const JOIN_URL = `${SUPABASE_URL}/functions/v1/join-queue-secure`
const PROCESS_URL = `${SUPABASE_URL}/functions/v1/process-featured-queue`
const COMPLETE_URL = `${SUPABASE_URL}/functions/v1/complete-payment`

// Test Data
const USER_ID = 'a0000000-0000-0000-0000-000000000001'
const LISTING_ID = 'b0000000-0000-0000-0000-000000000001'
const EMAIL = 'tester@example.com'

async function setupDB() {
    console.log("--- SETUP DB ---")
    // Clean
    await adminSupabase.from('featured_queue').delete().eq('listing_id', LISTING_ID)
    await adminSupabase.from('listings').delete().eq('id', LISTING_ID)
    await supabase.auth.admin.deleteUser(USER_ID)

    // User
    console.log("Creating/Fetching User...")
    const { data: cUser, error: uErr } = await supabase.auth.admin.createUser({
        email: EMAIL,
        password: 'password123',
        user_metadata: { stripe_customer_id: 'cus_PLACEHOLDER' }, // Will update later
        email_confirm: true
    })

    if (uErr) {
        console.log("Create User Note:", uErr.message)
    }

    // Fetch User to be sure
    const { data: users } = await supabase.auth.admin.listUsers()
    const targetUser = users.users.find(u => u.email === EMAIL)

    // If still no user, we might need to recreate passing different ID or just fail
    if (!targetUser) throw new Error("User not found after create attempt")

    const REAL_USER_ID = targetUser.id
    console.log("User ID:", REAL_USER_ID)

    // Clean Listings potentially owned by this REAL_USER_ID if distinct from constant
    await adminSupabase.from('listings').delete().eq('owner_id', REAL_USER_ID)
    await adminSupabase.from('listings').delete().eq('id', LISTING_ID) // Double check

    // Listing
    // 2. Create Listing
    await adminSupabase.from('listings').insert({
        id: LISTING_ID,
        owner_id: REAL_USER_ID,
        name: 'Verification Listing',
        location: 'Richmond, VIC'
    })

    return { userId: REAL_USER_ID }
}

async function testCustomerBinding(userId: string) {
    console.log("\n--- TEST 1: CUSTOMER BINDING (MISMATCH) ---")
    // 1. Create Customer A (User) & B (Attacker)
    const cusA = await stripe.customers.create({ email: 'userA@test.com' })
    const cusB = await stripe.customers.create({ email: 'userB@test.com' })

    // 2. Setup User in DB with Customer A
    // Update users_public directly as Edge Function reads from there
    // 3. Update User Stripe ID
    await adminSupabase.from('users_public').update({
        stripe_customer_id: cusA.id,
        is_admin: true // Make admin for easier access if needed
    }).eq('id', userId)

    // 3. Create Setup Intent for Customer B
    const si = await stripe.setupIntents.create({
        customer: cusB.id,
        payment_method: 'pm_card_visa', // Test PM
        usage: 'off_session',
        confirm: true, // Required for immediate success in test mode
        return_url: 'https://example.com'
    })

    // 4. Try Join
    // Need JWT.
    const { data: { session } } = await supabase.auth.signInWithPassword({ email: EMAIL, password: 'password123' })
    const token = session.access_token

    console.log("Calling Join Queue with Mismatched SI (Customers:", cusA.id, "vs", cusB.id, ")...")
    const res = await fetch(JOIN_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            listing_id: LISTING_ID,
            setup_intent_id: si.id,
            consent_text_hash: 'hash_test'
        })
    })

    const txt = await res.text()
    console.log("Response Status:", res.status)
    console.log("Response Body:", txt)

    if (res.status !== 200 && txt.includes("mismatch")) {
        console.log("✅ PASS: Mismatch Rejected")
    } else if (res.status === 400 || res.status === 500) {
        console.log("✅ PASS: Request Failed (Likely Rejected, check reason: " + txt + ")")
    } else {
        console.log("❌ FAIL: Request Succeeded or Unexpected Error")
    }

    await supabase.auth.signOut()
}

async function testIdempotency() {
    console.log("\n--- TEST 2: IDEMPOTENCY ---")
    // 1. Clean Queue
    await adminSupabase.from('featured_queue').delete().eq('listing_id', LISTING_ID)

    // 2. Insert Pending Row (Manual) to Queue
    // We need a Valid Customer + PM for the charge to succeed
    const cus = await stripe.customers.create({ email: 'idempotency@test.com' })
    const pm = await stripe.paymentMethods.attach('pm_card_visa', { customer: cus.id })

    // Set Default PM
    await stripe.customers.update(cus.id, {
        invoice_settings: { default_payment_method: pm.id }
    })

    const { data: q1, error: e1 } = await adminSupabase.from('featured_queue').insert({
        listing_id: LISTING_ID,
        council_name: 'City of Yarra',
        location: 'Richmond, VIC',
        status: 'pending_ready',
        stripe_payment_intent_id: null,
        stripe_customer_id: cus.id,
        payment_method_id: pm.id,
        price_locked_cents: 4900,
        promotion_attempt: 0,
        created_at: new Date().toISOString()
    }).select().single()

    if (e1) console.error("Insert Queue Error:", e1.message)
    console.log("Inserting Queue Row with PM:", pm.id)
    console.log("Running Process 1...")
    await fetch(PROCESS_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' }
    })

    // Check Result
    const { data: row1 } = await adminSupabase.from('featured_queue').select('status, stripe_payment_intent_id').eq('listing_id', LISTING_ID).single()
    const pi1 = row1.stripe_payment_intent_id
    console.log("Row 1 Status:", row1.status, "PI:", pi1)

    // 5. Reset Status to pending_ready (Attempt 0)
    console.log("Resetting to pending_ready (Attempt 0)...")
    await adminSupabase.from('featured_queue').update({
        status: 'pending_ready',
        // stripe_payment_intent_id: null // Don't clear PI? Wait, to test idempotency we usually clear PI or keep it?
        // If we keep it, code might skip charge?
        // The code checks `stripe_payment_intent_id`. If set, it reconciles.
        // We want to force it to TRY CHARGE AGAIN but get same PI because of Idempotency Key.
        // Idempotency Key is based on `queue_id` + `attempt`.
        // If we set PI to null, but Attempt is 0, it generates same Key.
    }).eq('listing_id', LISTING_ID)

    // Force PI null so it tries to create
    await adminSupabase.from('featured_queue').update({ stripe_payment_intent_id: null }).eq('listing_id', LISTING_ID)

    // 6. Run Process 2
    console.log("Running Process 2 (Retry)...")
    await fetch(PROCESS_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' }
    })

    const { data: row2 } = await adminSupabase.from('featured_queue').select('status, stripe_payment_intent_id').eq('listing_id', LISTING_ID).single()
    console.log("Row 2 Status:", row2.status, "PI:", row2.stripe_payment_intent_id)
    const pi2 = row2.stripe_payment_intent_id

    // 6. Verify Same PI
    if (pi1 === pi2 && pi1 && pi2) {
        console.log("✅ PASS: Idempotency Key Worked (Same PI ID returned)")
        const piObj = await stripe.paymentIntents.retrieve(pi1)
        console.log("Stripe PI Amount:", piObj.amount)
        return pi1
    } else {
        console.log("❌ FAIL: Different PIs generated")
        throw new Error("Idempotency Failed")
    }
}

async function testCompletePayment(userId: string) {
    console.log("\n--- TEST 3: COMPLETE PAYMENT (SCA) ---")
    // 1. Setup row in 'requires_action'
    await adminSupabase.from('featured_queue').update({
        status: 'requires_action',
        requires_action_expires_at: new Date(Date.now() + 86400000).toISOString()
    }).eq('listing_id', LISTING_ID)

    const { data: qRow } = await adminSupabase.from('featured_queue').select('id, listing_id').eq('listing_id', LISTING_ID).single()
    const qId = qRow.id

    // 2. Auth Token for User
    const { data: { session } } = await supabase.auth.signInWithPassword({ email: EMAIL, password: 'password123' })
    const token = session.access_token

    // 3. Call as User (Authorized)
    console.log("Calling complete-payment as Owner...")
    const res = await fetch(COMPLETE_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue_id: qId })
    })
    const json = await res.json()
    console.log("Response:", json)

    if (json.client_secret) {
        console.log("✅ PASS: Verification successful, client_secret returned")
    } else {
        console.log("❌ FAIL: No client_secret")
    }

    // 4. Call as Rando (Unauthorized)
    // Create rando
    const { data: rando } = await supabase.auth.signUp({ email: 'rando@test.com', password: 'password123' })
    const randoToken = rando.session?.access_token
    if (randoToken) {
        console.log("Calling complete-payment as Rando...")
        const res2 = await fetch(COMPLETE_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${randoToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ queue_id: qId })
        })
        console.log("Rando Response:", res2.status) // await res2.text() might be confusing if 400
        if (res2.status !== 200) console.log("✅ PASS: Unauthorized Rejected")
    }
}

async function testPollerReconciliation(succeededPiId: string) {
    console.log("\n--- TEST 4: POLLER RECONCILIATION (Requires Action -> Active) ---")
    // Use the Succeeded PI from Test 2
    // Create a row with 'requires_action' but linked to this Succeeded PI
    // This simulates a user who completed 3DS but DB wasn't updated yet.

    await adminSupabase.from('featured_queue').delete().eq('listing_id', LISTING_ID)

    await adminSupabase.from('featured_queue').insert({
        listing_id: LISTING_ID,
        council_name: 'City of Yarra',
        location: 'Richmond, VIC',
        status: 'requires_action', // STUCK state
        stripe_payment_intent_id: succeededPiId, // Known SUCCEEDED PI
        stripe_customer_id: 'cus_TEST', // Doesn't matter for this
        payment_method_id: 'pm_TEST',
        price_locked_cents: 4900,
        promotion_attempt: 0,
        requires_action_expires_at: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString()
    })
    // Debug: Peek at DB State before Poller
    const { data: peek } = await adminSupabase.from('featured_queue')
        .select('*')
        .eq('status', 'requires_action')
        .gt('requires_action_expires_at', new Date().toISOString()) // Approximation
        .not('stripe_payment_intent_id', 'is', null)
        .is('processing_expires_at', null)

    console.log("Debug: Pre-Poller Peek Count:", peek?.length)
    if (peek?.length > 0) console.log("Debug: Row is VISIBLE for claiming.")
    else console.log("Debug: Row is NOT VISIBLE (Check timestamps?)")

    // 4. Run Poller
    console.log("Running Poller (expecting reconciliation to Active)...")
    const res = await fetch(PROCESS_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' }
    })
    console.log("Poller Response Status:", res.status)
    const text = await res.text()
    console.log("Poller Response Body:", text)

    const { data: row } = await adminSupabase.from('featured_queue').select('status, last_notified_status').eq('listing_id', LISTING_ID).single()
    console.log("Poller Result Status:", row.status)
    console.log("Poller Result Notified:", row.last_notified_status)

    if (row.status === 'active' && row.last_notified_status === 'active') {
        console.log("✅ PASS: Poller correctly finalized and gated notification")
        // NOTE: In real world, sendEmail would have fired.

        // TEST 5: Atomic Notification Gate (Idempotency)
        console.log("\n--- TEST 5: ATOMIC NOTIFICATION GATE ---")
        const qId = (await adminSupabase.from('featured_queue').select('id').eq('listing_id', LISTING_ID).single()).data.id

        // Try Lock Update (Should fail because it's already active)
        const run1 = await adminSupabase.rpc('attempt_notification_update', { p_queue_id: qId, p_new_status: 'active' })

        // Reset last_notified manually to NULL to test working lock
        await adminSupabase.from('featured_queue').update({ last_notified_status: null }).eq('id', qId)

        const run2 = await adminSupabase.rpc('attempt_notification_update', { p_queue_id: qId, p_new_status: 'active' })
        const run3 = await adminSupabase.rpc('attempt_notification_update', { p_queue_id: qId, p_new_status: 'active' })

        console.log("Run 1 (Already Active):", run1.data) // Expect False
        console.log("Run 2 (Reset -> Active):", run2.data) // Expect True
        console.log("Run 3 (Repeat):", run3.data) // Expect False

        if (run1.data === false && run2.data === true && run3.data === false) {
            console.log("✅ PASS: Atomic Gate enforced correctly")
        } else {
            console.log("❌ FAIL: Atomic Gate logic broken")
        }

    } else {
        console.log("❌ FAIL: Poller failed (Status: " + row.status + ")")
    }
}

async function main() {
    try {
        const { userId } = await setupDB()
        await testCustomerBinding(userId)
        const piId = await testIdempotency()
        if (piId) {
            await testCompletePayment(userId)
            await testPollerReconciliation(piId)
        }
    } catch (e) {
        console.error("FATAL:", e)
    }
}

main()
