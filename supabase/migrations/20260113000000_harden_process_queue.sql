-- Migration: Harden Process Queue (Poller & Idempotency)

-- 1. RPC: Claim Reconciliation Tasks (Bounded, Concurrency Safe)
CREATE OR REPLACE FUNCTION public.claim_reconciliation_tasks(p_limit integer DEFAULT 10)
 RETURNS TABLE(
    id bigint, 
    stripe_payment_intent_id text, 
    stripe_customer_id text, 
    last_notified_status queue_status
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.featured_queue
    SET processing_expires_at = now() + interval '5 minutes' -- Temporary lock for processing
    WHERE id IN (
        SELECT fq.id
        FROM public.featured_queue fq
        WHERE fq.status = 'requires_action'
          AND (fq.requires_action_expires_at > now()) -- Only valid checking window
          AND fq.stripe_payment_intent_id IS NOT NULL
          AND (fq.processing_expires_at IS NULL OR fq.processing_expires_at < now()) -- Not currently being processed
        ORDER BY fq.created_at ASC
        LIMIT p_limit
        FOR UPDATE SKIP LOCKED
    )
    RETURNING 
        featured_queue.id, 
        featured_queue.stripe_payment_intent_id, 
        featured_queue.stripe_customer_id, 
        featured_queue.last_notified_status;
END;
$function$;

-- 2. RPC: Atomic Notification Update (Idempotency Gate)
CREATE OR REPLACE FUNCTION public.attempt_notification_update(p_queue_id bigint, p_new_status queue_status)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_updated boolean;
BEGIN
    WITH updated_rows AS (
        UPDATE public.featured_queue
        SET last_notified_status = p_new_status
        WHERE id = p_queue_id 
          AND (last_notified_status IS DISTINCT FROM p_new_status)
        RETURNING 1
    )
    SELECT EXISTS(SELECT 1 FROM updated_rows) INTO v_updated;
    
    RETURN v_updated;
END;
$function$;
