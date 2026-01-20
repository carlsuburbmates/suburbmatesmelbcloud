-- ============================================================
-- Phase 4: Stripe Connect Payouts - Data Contract
-- Purpose: Add payout columns to orders + audit_logs table
-- ============================================================

-- 1. Add payout columns to orders table
-- These track the actual money flow for reconciliation
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS platform_fee_cents INTEGER,
ADD COLUMN IF NOT EXISTS seller_earnings_cents INTEGER,
ADD COLUMN IF NOT EXISTS seller_stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_application_fee_id TEXT,
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending';

COMMENT ON COLUMN public.orders.platform_fee_cents IS 'Platform fee (6%) deducted from sale in cents';
COMMENT ON COLUMN public.orders.seller_earnings_cents IS 'Amount transferred to seller in cents';
COMMENT ON COLUMN public.orders.seller_stripe_account_id IS 'Seller Connect account ID for payout routing';
COMMENT ON COLUMN public.orders.stripe_application_fee_id IS 'Stripe application fee ID for reconciliation';
COMMENT ON COLUMN public.orders.payout_status IS 'Payout routing status: pending, routed, failed';

-- 2. Create audit_logs table for compliance/debugging
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    actor_id UUID,
    actor_type TEXT DEFAULT 'system',
    details JSONB DEFAULT '{}',
    idempotency_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_logs_idempotency ON public.audit_logs(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- RLS: Only service role can write, operators can read
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role bypass (implicit) + operators read
CREATE POLICY "Operators can read audit logs"
ON public.audit_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users_public
        WHERE id = auth.uid() AND role = 'operator'
    )
);

-- 3. Index for orders payout queries
CREATE INDEX IF NOT EXISTS idx_orders_payout_status ON public.orders(payout_status);
CREATE INDEX IF NOT EXISTS idx_orders_seller_stripe_account ON public.orders(seller_stripe_account_id);

-- ============================================================
-- Verification queries (run after migration):
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'orders';
-- SELECT * FROM pg_tables WHERE tablename = 'audit_logs';
-- ============================================================
