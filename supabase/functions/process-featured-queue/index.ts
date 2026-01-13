import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Stripe } from "https://esm.sh/stripe@14.10.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ''
const supabaseServiceKey = Deno.env.get("PRIVATE_SUPABASE_SERVICE_ROLE_KEY") ?? ''
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
        // 1. Expire Finished & Stalled
        await supabase.rpc('expire_finished_slots')
        await supabase.rpc('expire_stalled_actions')

        const logs: string[] = [] // Debug Logs

        // 2a. Reconcile 'requires_action' (3DS Completed by User)
        // Use Bounded, Concurrency-Safe RPC
        const { data: reconciliationTasks, error: recError } = await supabase.rpc('claim_reconciliation_tasks', { p_limit: 10 })

        if (recError) logs.push(`Reconcile RPC Error: ${recError.message}`)

        if (reconciliationTasks) {
            logs.push(`Reconcile Tasks Found: ${reconciliationTasks.length}`)
            for (const task of reconciliationTasks) {
                try {
                    logs.push(`Processing Task: ${task.rec_id} PI: ${task.rec_stripe_pi}`)
                    const pi = await stripe.paymentIntents.retrieve(task.rec_stripe_pi)
                    let status = 'requires_action'
                    if (pi.status === 'succeeded') status = 'active'
                    else if (pi.status === 'canceled') status = 'payment_failed'
                    // Note: 'requires_payment_method' also maps to failed usually, but sticking to simple mapping for now

                    logs.push(`Stripe Status: ${pi.status} -> DB Status: ${status}`)

                    if (status !== 'requires_action') {
                        await supabase.rpc('reconcile_and_finalize', {
                            p_queue_id: task.rec_id,
                            p_status: status,
                            p_stripe_pi_id: pi.id
                        })

                        // [FIX] Atomic Email Idempotency Gate
                        const shouldNotify = await supabase.rpc('attempt_notification_update', {
                            p_queue_id: task.rec_id,
                            p_new_status: status
                        })

                        logs.push(`Notification Gate: ${shouldNotify.data}`)

                        if (shouldNotify.data === true) {
                            if (status === 'active') {
                                await sendEmail(task.rec_stripe_cust, "You are Featured!", "Payment Succeeded. You are live.")
                            } else if (status === 'payment_failed') {
                                await sendEmail(task.rec_stripe_cust, "Payment Failed", "Your payment failed. Please try again.")
                            }
                        }
                    }
                } catch (e) {
                    console.error("Action Reconcile Error", e)
                    logs.push(`Action Reconcile Error: ${e.message}`)
                }
            }
        } else {
            logs.push("No Reconcile Tasks Found or Null")
        }

        // 2b. Cleanup Stuck Processing (Reconciliation)
        const { data: stuckRows } = await supabase.rpc('cleanup_stuck_processing')
        if (stuckRows) {
            for (const row of stuckRows) {
                if (!row.stripe_payment_intent_id) {
                    // Safe Revert if no PI known. 
                    await supabase.rpc('reconcile_and_finalize', {
                        p_queue_id: row.queue_id,
                        p_status: 'pending_ready'
                    })
                } else {
                    // Reconcile known PI
                    const pi = await stripe.paymentIntents.retrieve(row.stripe_payment_intent_id)
                    let status = 'payment_failed'
                    if (pi.status === 'succeeded') status = 'active'
                    else if (pi.status === 'requires_action' || pi.status === 'requires_capture') status = 'requires_action'

                    await supabase.rpc('reconcile_and_finalize', {
                        p_queue_id: row.queue_id,
                        p_status: status,
                        p_stripe_pi_id: pi.id
                    })

                    // [FIX] Atomic Email Idempotency Gate
                    const shouldNotify = await supabase.rpc('attempt_notification_update', {
                        p_queue_id: row.queue_id,
                        p_new_status: status
                    })

                    if (shouldNotify.data === true) {
                        if (status === 'active') {
                            await sendEmail(row.stripe_customer_id, "You are Featured!", "Payment Succeeded. You are live.")
                        }
                    }
                }
            }
        }

        // 3. Claim & Promote
        const { data: tasks, error: claimError } = await supabase.rpc('claim_promotion_tasks', { p_limit: 10 })
        if (claimError) throw claimError

        const results = []

        for (const task of (tasks || [])) {
            try {
                // Idempotency Key: Critical for Crash Safety
                // Uses queue_id and CURRENT attempt count (which increments only on verified failure)
                const idempotencyKey = `featured_queue:${task.queue_id}:attempt:${task.promotion_attempt}`

                // Charge
                const pi = await stripe.paymentIntents.create({
                    amount: task.price_cents,
                    currency: 'aud',
                    customer: task.stripe_customer_id,
                    payment_method: task.payment_method_id,
                    off_session: true,
                    confirm: true,
                    metadata: { queue_id: task.queue_id }
                }, {
                    idempotencyKey
                })

                // Determine Outcome
                let newStatus = 'payment_failed'
                if (pi.status === 'succeeded') newStatus = 'active'
                else if (pi.status === 'requires_action' || pi.status === 'requires_capture') newStatus = 'requires_action'
                else if (pi.status === 'requires_payment_method') newStatus = 'payment_failed'

                // Finalize
                await supabase.rpc('reconcile_and_finalize', {
                    p_queue_id: task.queue_id,
                    p_status: newStatus,
                    p_stripe_pi_id: pi.id
                })

                results.push({ queue_id: task.queue_id, result: newStatus })

                // [FIX] Atomic Email Idempotency Gate
                const shouldNotify = await supabase.rpc('attempt_notification_update', {
                    p_queue_id: task.queue_id,
                    p_new_status: newStatus
                })

                if (shouldNotify.data === true) {
                    if (newStatus === 'active') {
                        await sendEmail(task.stripe_customer_id, "You are Featured!", "Payment Succeeded. You are live.")
                    } else if (newStatus === 'requires_action') {
                        await sendEmail(task.stripe_customer_id, "Action Required", "Please confirm payment to go live.")
                    }
                }

            } catch (err) {
                console.error('Charge Error', err)
                // Card Declined or Stripe Error
                await supabase.rpc('reconcile_and_finalize', {
                    p_queue_id: task.queue_id,
                    p_status: 'payment_failed'
                })
                results.push({ queue_id: task.queue_id, error: err.message })
            }
        }

        return new Response(JSON.stringify({ success: true, results, logs }), {
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

// Helper for Email
async function sendEmail(customerId: string, subject: string, html: string) {
    // In real impl, fetch email from Customer ID via DB or Stripe
    // Here we skip for brevity of the robust loop logic
    console.log(`[Email Mock] To: ${customerId}, Subject: ${subject}`)
}
