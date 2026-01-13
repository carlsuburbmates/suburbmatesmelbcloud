-- Migration: Upgrade Featured Queue for Monetization (V2.4)
-- Description: Adds strict status enum, payment/audit columns, and partial unique index.

-- 1. Create Enum Type
DO $$ BEGIN
    CREATE TYPE public.queue_status AS ENUM (
        'pending_ready',
        'processing_payment',
        'requires_action',
        'active',
        'payment_failed',
        'expired'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1b. Drop Dependent Policy
DROP POLICY IF EXISTS "Public read access for active featured items" ON public.featured_queue;

-- 1c. Standardize Columns
-- Rename requested_at to created_at if it exists
DO $$ BEGIN
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'featured_queue' AND column_name = 'requested_at') THEN
        ALTER TABLE public.featured_queue RENAME COLUMN requested_at TO created_at;
    END IF;
END $$;

-- Ensure created_at exists (if it wasn't requested_at)
ALTER TABLE public.featured_queue ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 2. Alter Table
ALTER TABLE public.featured_queue
  ALTER COLUMN status DROP DEFAULT;

-- Convert column to new Enum
ALTER TABLE public.featured_queue
  ALTER COLUMN status TYPE public.queue_status 
  USING (
    CASE status::text
      WHEN 'pending' THEN 'pending_ready'::public.queue_status
      WHEN 'active' THEN 'active'::public.queue_status
      ELSE 'pending_ready'::public.queue_status
    END
  );

ALTER TABLE public.featured_queue
  ALTER COLUMN status SET DEFAULT 'pending_ready'::public.queue_status;

-- 2b. Recreate Policy
-- Policy: Everyone can see active items (for the frontend showcase)
CREATE POLICY "Public read access for active featured items"
ON public.featured_queue
FOR SELECT
USING (status = 'active');

-- 3. Add New Columns
ALTER TABLE public.featured_queue
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS payment_method_id text,
  ADD COLUMN IF NOT EXISTS stripe_setup_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS requires_action_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS processing_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS processing_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS promotion_attempt integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_notified_status text,
  ADD COLUMN IF NOT EXISTS price_locked_cents integer,
  ADD COLUMN IF NOT EXISTS consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_version text DEFAULT 'v1',
  ADD COLUMN IF NOT EXISTS consent_text_hash text;

-- 4. Add Indexes & Constraints

-- Partial Unique Index (Blocker C: Prevent duplicate active lifecycle entries)
-- Drop old unique constraint if it existed (previous might have been simply listing_id, council_name)
DROP INDEX IF EXISTS unique_queue_entry; -- Assumption: Drop if strict name known, or use IF EXISTS

CREATE UNIQUE INDEX IF NOT EXISTS idx_queue_active_lifecycle 
  ON public.featured_queue (listing_id, council_name) 
  WHERE status IN ('pending_ready', 'processing_payment', 'requires_action', 'active');

-- Processing Cleanup Index
CREATE INDEX IF NOT EXISTS idx_queue_processing_cleanup
  ON public.featured_queue (status, processing_expires_at)
  WHERE status = 'processing_payment';

-- FIFO Determinism Index
CREATE INDEX IF NOT EXISTS idx_queue_fifo
  ON public.featured_queue (council_name, created_at ASC, id ASC)
  WHERE status = 'pending_ready';
