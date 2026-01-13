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
        const { queue_id } = await req.json()
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Auth')

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !user) throw new Error('Unauthorized')

        // 1. Get Queue Entry & Verify Owner
        const { data: queueEntry } = await supabase
            .from('featured_queue')
            .select('*, listings(owner_id)')
            .eq('id', queue_id)
            .single()

        // @ts-ignore
        if (!queueEntry || queueEntry.listings.owner_id !== user.id) {
            throw new Error('Not owner')
        }

        if (queueEntry.status !== 'requires_action') {
            throw new Error('Payment does not require action')
        }

        if (!queueEntry.stripe_payment_intent_id) {
            throw new Error('No Payment Intent found')
        }

        // 2. Retrieve PI
        const pi = await stripe.paymentIntents.retrieve(queueEntry.stripe_payment_intent_id)

        // 3. Return Client Secret
        return new Response(JSON.stringify({ client_secret: pi.client_secret }), {
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
