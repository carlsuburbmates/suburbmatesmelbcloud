import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import Stripe from 'stripe';
import {
    sendProActivatedEmail,
    sendPaymentFailedEmail,
    sendProExpiryUpcomingEmail,
    sendProExpiredEmail
} from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return new NextResponse('Webhook Error: Missing Signature or Secret', { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createAdminClient();

    try {
        switch (event.type) {
            // ----------------------------------------------------
            // 1. Checkout Completed (Pro Subscription Started)
            // ----------------------------------------------------
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.supabase_user_id;

                if (!userId) {
                    console.error('Checkout Session missing userId metadata');
                    break;
                }

                if (session.mode === 'subscription') {
                    const subscriptionId = session.subscription as string;
                    const customerId = session.customer as string;

                    await supabase
                        .from('users_public')
                        .update({
                            stripe_customer_id: customerId,
                            stripe_subscription_status: 'active',
                        })
                        .eq('id', userId);

                    const { data: listings } = await supabase
                        .from('listings')
                        .select('id')
                        .eq('owner_id', userId)
                        .limit(1);

                    if (listings && listings.length > 0) {
                        await supabase
                            .from('listings')
                            .update({ tier: 'Pro' })
                            .eq('id', listings[0].id);
                    }

                    const { data: userData } = await supabase.auth.admin.getUserById(userId);
                    if (userData?.user?.email) {
                        await sendProActivatedEmail(userData.user.email);
                    }
                } else if (session.mode === 'payment' && session.metadata?.purchase_type === 'product_sale') {
                    // ============================================================
                    // D4.3: PRODUCT SALE WEBHOOK HANDLING (Phase 4 - Connect Payouts)
                    // Purpose: Idempotently mark order as paid + record payout routing
                    // Evidence: Phase 4 Destination Charges - webhook tracks payout state
                    // ============================================================
                    const orderId = session.metadata?.order_id;
                    const paymentIntentId = session.payment_intent as string | null;
                    const idempotencyKey = `webhook_checkout_${session.id}`;

                    if (!orderId) {
                        console.error('[Product Sale] Missing order_id in session metadata');
                        break;
                    }

                    // Idempotency check: Only update if order is still pending
                    // Note: orders table not in generated Supabase types yet - using 'as any' cast
                    const { data: existingOrder } = await (supabase as any)
                        .from('orders')
                        .select('id, status, customer_id, seller_id, platform_fee_cents, seller_earnings_cents, seller_stripe_account_id')
                        .eq('id', orderId)
                        .single();

                    if (!existingOrder) {
                        console.error(`[Product Sale] Order not found: ${orderId}`);
                        break;
                    }

                    // Idempotent: Skip if already paid
                    if (existingOrder.status === 'paid') {
                        console.log(`[Product Sale] Order ${orderId} already marked as paid (idempotent skip)`);
                        break;
                    }

                    // Extract application fee from payment intent for reconciliation
                    let applicationFeeId: string | null = null;
                    if (paymentIntentId) {
                        try {
                            const paymentIntent: any = await stripe.paymentIntents.retrieve(paymentIntentId);
                            applicationFeeId = paymentIntent.application_fee || null;
                        } catch (e) {
                            console.warn(`[Product Sale] Failed to fetch payment intent ${paymentIntentId}:`, e);
                        }
                    }

                    // Mark order as paid + record payout routing
                    // Note: orders table not in generated Supabase types yet - using 'as any' cast
                    const { error: updateError } = await (supabase as any)
                        .from('orders')
                        .update({
                            status: 'paid',
                            stripe_checkout_session_id: session.id,
                            stripe_payment_intent_id: paymentIntentId,
                            stripe_application_fee_id: applicationFeeId,
                            payout_status: 'routed',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', orderId)
                        .eq('status', 'pending'); // Double-check idempotency

                    if (updateError) {
                        console.error(`[Product Sale] Failed to update order ${orderId}:`, updateError);
                        break;
                    }

                    console.log(`[Product Sale] Order ${orderId} marked as paid, payout routed to ${existingOrder.seller_stripe_account_id}`);

                    // Write audit log for order_paid event (idempotent)
                    await (supabase as any).from('audit_logs').insert({
                        event_type: 'order_paid',
                        entity_type: 'orders',
                        entity_id: orderId,
                        actor_id: session.customer as string,
                        actor_type: 'customer',
                        details: {
                            payment_intent_id: paymentIntentId,
                            total_cents: existingOrder.total_cents,
                            platform_fee_cents: existingOrder.platform_fee_cents,
                            seller_earnings_cents: existingOrder.seller_earnings_cents,
                        },
                        idempotency_key: `${idempotencyKey}_order_paid`,
                    }).onConflict('idempotency_key').ignore();

                    // Write audit log for payout_routed event (idempotent)
                    await (supabase as any).from('audit_logs').insert({
                        event_type: 'payout_routed',
                        entity_type: 'orders',
                        entity_id: orderId,
                        actor_id: existingOrder.seller_id,
                        actor_type: 'seller',
                        details: {
                            destination_account_id: existingOrder.seller_stripe_account_id,
                            application_fee_id: applicationFeeId,
                            amount_cents: existingOrder.seller_earnings_cents,
                        },
                        idempotency_key: `${idempotencyKey}_payout_routed`,
                    }).onConflict('idempotency_key').ignore();

                    // Send confirmation email if email system exists
                    const customerId = existingOrder.customer_id;
                    if (customerId) {
                        const { data: customerData } = await supabase.auth.admin.getUserById(customerId);
                        if (customerData?.user?.email) {
                            // Note: sendOrderConfirmationEmail not yet implemented
                            // Will be added in future iteration when email templates are ready
                            console.log(`[Product Sale] Order ${orderId} paid - customer email: ${customerData.user.email}`);
                        }
                    }

                } else if (session.mode === 'payment' && session.metadata?.purchase_type === 'featured_placement') {
                    // Handle Featured Placement (FIFO)
                    const { data: listing } = await supabase
                        .from('listings')
                        .select('id, name, location')
                        .eq('owner_id', userId)
                        .single();

                    if (listing) {
                        try {
                            // 1. Get Availability & Dates from DB (Truth)
                            // @ts-ignore - RPC types not generated
                            const { data: availability, error: rpcError } = await supabase
                                .rpc('check_featured_availability' as any, { council_text: listing.location });

                            if (rpcError || !availability || availability.length === 0) {
                                throw new Error('Failed to check availability');
                            }

                            const { total_count, pending_count, next_available_date } = availability[0] as any;
                            const isFull = (Number(total_count) >= 5);
                            const status = isFull ? 'pending' : 'active';

                            // 2. Determine Dates
                            // Valid start date comes from RPC (next slot open)
                            const startedAt = new Date(next_available_date);
                            // Ensure we don't start in the past if slot is open now
                            if (startedAt < new Date()) {
                                startedAt.setTime(Date.now());
                            }

                            const endsAt = new Date(startedAt);
                            endsAt.setDate(endsAt.getDate() + 30); // fixed 30 day window

                            // 3. Insert into Queue
                            const { data: queueItem, error: insertError } = await supabase
                                .from('featured_queue')
                                .insert({
                                    listing_id: listing.id,
                                    location: listing.location,
                                    status: status,
                                    started_at: startedAt.toISOString(),
                                    ends_at: endsAt.toISOString(),
                                })
                                .select('id')
                                .single();

                            if (insertError) throw insertError;

                            // 4. CRITICAL: If Active, Sync to Listing Immediately
                            if (status === 'active' && queueItem) {
                                // @ts-ignore - RPC types not generated
                                await supabase.rpc('activate_queued_item', { queue_record_id: queueItem.id });
                                console.log(`[Autopilot] Synced Listing ${listing.id} to Featured (Active Now)`);
                            }

                            console.log(`[Autopilot] Featured Placement purchased for ${listing.name}. Status: ${status}`);

                            // 5. Send Email
                            const { data: userData } = await supabase.auth.admin.getUserById(userId);
                            if (userData?.user?.email) {
                                const { sendFeaturedActiveEmail, sendFeaturedQueuedEmail } = await import('@/lib/email');
                                const dateStr = startedAt.toLocaleDateString('en-AU');
                                const endDateStr = endsAt.toLocaleDateString('en-AU');

                                if (status === 'active') {
                                    await sendFeaturedActiveEmail(userData.user.email, listing.name, listing.location, endDateStr);
                                } else {
                                    await sendFeaturedQueuedEmail(userData.user.email, listing.name, listing.location, dateStr);
                                }
                            }

                        } catch (err: any) {
                            console.error('[Autopilot] Featured Logic Failed:', err);
                            // Fallback or retry? For now log error.
                        }
                    }
                }
                break;
            }

            // ----------------------------------------------------
            // 2. Invoice Payment Succeeded (Recurring Renewal)
            // ----------------------------------------------------
            // ----------------------------------------------------
            // 2. Subscription Updated (The Core Logic)
            // ----------------------------------------------------
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                // Metadata might need to be refetched if not present on the event object
                // But usually we can rely on stripe_customer_id mapping.
                const customerId = subscription.customer as string;
                const status = subscription.status;

                // Sync to Profile
                const { data: profile } = await supabase
                    .from('users_public')
                    .update({ stripe_subscription_status: status })
                    .eq('stripe_customer_id', customerId)
                    .select('id')
                    .single();

                if (profile) {
                    // Sync Listings Tier
                    // If active or trialing -> Pro
                    // If past_due, unpaid, canceled -> Basic
                    const targetTier = (status === 'active' || status === 'trialing') ? 'Pro' : 'Basic';

                    await supabase
                        .from('listings')
                        .update({ tier: targetTier })
                        .eq('owner_id', profile.id);

                    console.log(`[Autopilot] Synced User ${profile.id} to ${targetTier} (Status: ${status})`);
                } else {
                    console.warn(`[Autopilot] Profile not found for Customer ${customerId}`);
                }
                break;
            }

            // ----------------------------------------------------
            // 3. Invoice Payment Failed (Downgrade Trigger)
            // ----------------------------------------------------
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                // Mark as past_due immediately if not already handled by subscription.updated
                // (subscription.updated usually fires after this too)
                await supabase
                    .from('users_public')
                    .update({ stripe_subscription_status: 'past_due' })
                    .eq('stripe_customer_id', customerId);

                // We rely on the subscription.updated event (which usually follows) to sync the tier,
                // but we can double check here or just log.
                console.log(`[Autopilot] Payment failed for Customer ${customerId}`);

                // Send Failure Email
                const { data: profile } = await supabase
                    .from('users_public')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single();

                if (profile) {
                    const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
                    if (userData?.user?.email) {
                        await sendPaymentFailedEmail(userData.user.email);
                    }
                }
                break;
            }

            // ----------------------------------------------------
            // 4. Invoice Payment Succeeded (Recovery)
            // ----------------------------------------------------
            case 'invoice.payment_succeeded': {
                // subscription.updated usually handles the specific status transition to 'active',
                // so we might not need explicit logic here unless we want to send a "Thanks" email.
                // For now, logging.
                const invoice = event.data.object as Stripe.Invoice;
                console.log(`[Autopilot] Invoice ${invoice.id} paid.`);
                break;
            }

            // ----------------------------------------------------
            // 5. Subscription Deleted (Cancellation)
            // ----------------------------------------------------
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                const { data: profile } = await supabase
                    .from('users_public')
                    .update({ stripe_subscription_status: 'canceled' })
                    .eq('stripe_customer_id', customerId)
                    .select('id')
                    .single();

                if (profile) {
                    await supabase
                        .from('listings')
                        .update({ tier: 'Basic' })
                        .eq('owner_id', profile.id);

                    console.log(`[Autopilot] User ${profile.id} canceled. Downgraded to Basic.`);

                    // Send Expiry Email
                    const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
                    if (userData?.user?.email) {
                        await sendProExpiredEmail(userData.user.email);
                    }
                }
                break;
            }

            // ----------------------------------------------------
            // 6. Connect Account Updated
            // ----------------------------------------------------
            case 'account.updated': {
                const account = event.data.object as Stripe.Account;
                const userId = account.metadata?.supabase_user_id;

                if (userId && account.charges_enabled) {
                    console.log(`Connect Account ${account.id} enabled for user ${userId}`);
                }
                break;
            }
        }
    } catch (error: any) {
        console.error('Webhook processing failed:', error);
        return new NextResponse('Webhook Handler Error', { status: 500 });
    }

    return new NextResponse('Webhook Processed', { status: 200 });
}
