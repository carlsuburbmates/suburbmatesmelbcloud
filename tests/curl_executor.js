
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Config
const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")
const SUPABASE_KEY = Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/join-queue-secure`

const TEST_EMAIL = 'tester@example.com'
const TEST_PASSWORD = 'password123' 

// Initialize Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function runTests() {
  console.log("1. Authenticating...")
  const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  })

  if (loginError) {
    console.error("Login Failed:", loginError)
    // Try Sign Up if login fails (idempotent)
    const { data: upData, error: upError } = await supabase.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        options: {
            data: { stripe_customer_id: "cus_TmO9Xq5Jy2pZWv" } // Correct one for User
        }
    })
    if (upError) { 
        console.error("Signup Failed:", upError); 
        process.exit(1); 
    }
    console.log("Signed Up. Session:", !!upData.session)
    if (!upData.session) { console.log("Check email for confirmation... (Cannot proceed without verified email usually)"); }
    // If Email Confirm enabled, this blocks.
    // Assume auto-confirm or manual confirm via SQL.
  }
  
  const token = session?.access_token
  if (!token) {
      console.log("No Token available. Exiting.")
      return
  }

  console.log("2. Testing Check 1: Invalid Setup Intent")
  const res1 = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        listing_id: 'b0000000-0000-0000-0000-000000000001',
        setup_intent_id: 'si_INVALID',
        consent_text_hash: 'hash_123'
    })
  })
  console.log("Response 1:", await res1.text())

  console.log("3. Testing Check 2: Ownership Mismatch")
  // User (a000...) tries to join Listing (31f3...) which is owned by someone else
  const res2 = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        listing_id: '31f3c493-17a7-4436-b7c1-770eaff95561', // The Real Listing (Not owned by Tester)
        setup_intent_id: 'si_test_123',
        consent_text_hash: 'hash_123'
    })
  })
  console.log("Response 2:", await res2.text())

  console.log("4. Testing Check 3: Invalid Setup Intent (Stripe Reachability)")
  const res3 = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        listing_id: 'b0000000-0000-0000-0000-000000000001', // Correct Owner
        setup_intent_id: 'si_INVALID_TEST',
        consent_text_hash: 'hash_123'
    })
  })
  console.log("Response 3:", await res3.text())
}

runTests()
