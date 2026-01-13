import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Stripe } from "https://esm.sh/stripe@14.10.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ''
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { listing_id, setup_intent_id, consent_text_hash } = await req.json()
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Auth')

        // 1. Get User from Auth Header (Important: use Anon Key client with Auth context or Service Key + verify JWT?)
        // Best practice: Pass JWT to `getUser`.
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) throw new Error('Unauthorized')

        // 2. Verify Listing Ownership
        const { data: listing } = await supabase
            .from('listings')
            .select('owner_id')
            .eq('id', listing_id)
            .single()

        if (!listing || listing.owner_id !== user.id) {
            throw new Error('Not owner of listing')
        }

        // 3. Verify Stripe Customer (Blocker A)
        // Fetch user's stripe_customer_id from DB
        const { data: userData } = await supabase
            .from('users_public')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

        if (!userData?.stripe_customer_id) throw new Error('User has no Stripe Customer')

        // 4. Verify SetupIntent (Blocker A)
        const setupIntent = await stripe.setupIntents.retrieve(setup_intent_id)

        if (setupIntent.status !== 'succeeded') {
            throw new Error('SetupIntent not succeeded')
        }

        if (setupIntent.customer !== userData.stripe_customer_id) {
            throw new Error('SetupIntent customer mismatch')
        }

        // 5. Call Secure RPC to Insert
        // We use service role client (global `supabase`) because RPC is Security Definer but we verified everything.
        const { data: pos, error: rpcError } = await supabase.rpc('insert_verified_queue_entry', {
            p_listing_id: listing_id,
            p_setup_intent_id: setupIntent.id,
            p_payment_method_id: setupIntent.payment_method as string,
            p_stripe_customer_id: userData.stripe_customer_id,
            p_consent_hash: consent_text_hash
        })

        if (rpcError) throw rpcError

        return new Response(JSON.stringify({ success: true, position: pos }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
