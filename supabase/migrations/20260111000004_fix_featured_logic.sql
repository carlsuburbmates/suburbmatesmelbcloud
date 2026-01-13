-- Migration: 20260111000004_fix_featured_logic.sql

-- 1. Helper: Check Availability
-- Logic:
-- If total (active + pending) < 5: Available Now.
-- Else: The start date is the ends_at of the Nth item (where N = pending_count + 1).
--      This effectively finds the 'next slot opening' that hasn't been claimed by a pending user.
CREATE OR REPLACE FUNCTION check_featured_availability(council_text text)
RETURNS TABLE (
  total_count bigint,
  pending_count bigint,
  next_available_date timestamptz
) LANGUAGE plpgsql AS $$
DECLARE
  v_total bigint;
  v_pending bigint;
  v_next timestamptz;
BEGIN
  -- Get Counts
  SELECT
    count(*),
    count(*) FILTER (WHERE status = 'pending')
  INTO v_total, v_pending
  FROM featured_queue
  WHERE location = council_text
  AND status IN ('active', 'pending')
  AND ends_at > now(); -- Ignore expired items that process_daily_queue hasn't cleaned yet

  -- Determine Date
  IF v_total < 5 THEN
    v_next := now();
  ELSE
    -- Find the ends_at of the item that will free up the slot for this new user
    -- We skip the first 'v_pending' items because they are already spoken for by the pending users
    SELECT ends_at INTO v_next
    FROM featured_queue
    WHERE location = council_text
    AND status IN ('active', 'pending')
    AND ends_at > now()
    ORDER BY ends_at ASC
    OFFSET v_pending
    LIMIT 1;
  END IF;

  RETURN QUERY SELECT v_total, v_pending, v_next;
END;
$$;

-- 2. Helper: Activate Item
CREATE OR REPLACE FUNCTION activate_queued_item(queue_record_id bigint)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_listing_id uuid;
  v_ends_at timestamptz;
BEGIN
  -- Get details
  SELECT listing_id, ends_at INTO v_listing_id, v_ends_at
  FROM featured_queue
  WHERE id = queue_record_id;

  IF v_listing_id IS NULL THEN
    RAISE EXCEPTION 'Queue item % not found', queue_record_id;
  END IF;

  -- Update Queue Status
  UPDATE featured_queue
  SET status = 'active'
  WHERE id = queue_record_id;

  -- CRITICAL: Update Listing to be Featured
  UPDATE listings
  SET featured_until = v_ends_at
  WHERE id = v_listing_id;
END;
$$;

-- 3. Cron: Process Queue
-- Returns a table of notification candidates to be handled by the calling system (Edge Function)
CREATE OR REPLACE FUNCTION process_daily_queue()
RETURNS TABLE (
  action_type text,
  listing_name text,
  location text,
  user_email text,
  ends_at timestamptz,
  queue_id bigint
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  r RECORD;
  v_loc text;
  v_active_count bigint;
BEGIN
  -- 1. EXPIRE ITEMS
  UPDATE featured_queue
  SET status = 'expired'
  WHERE status = 'active' AND ends_at < now();

  -- 2. IDENTIFY REMINDER CANDIDATES (3 days before expiry, not yet notified)
  FOR r IN
    SELECT q.id, q.location, q.ends_at, l.name, u.email
    FROM featured_queue q
    JOIN listings l ON q.listing_id = l.id
    JOIN auth.users u ON l.owner_id = u.id
    WHERE q.status = 'active'
    AND q.ends_at <= (now() + interval '3 days')
    AND q.reminder_sent = false
  LOOP
    action_type := 'reminder';
    listing_name := r.name;
    location := r.location;
    user_email := r.email;
    ends_at := r.ends_at;
    queue_id := r.id;
    
    -- Mark as sent so we don't return them again in the next cron run
    UPDATE featured_queue SET reminder_sent = true WHERE id = r.id;
    
    RETURN NEXT;
  END LOOP;

  -- 3. ACTIVATE PENDING ITEMS
  FOR v_loc IN
    SELECT DISTINCT q.location FROM featured_queue q WHERE q.status = 'pending'
  LOOP
    SELECT count(*) INTO v_active_count
    FROM featured_queue
    WHERE location = v_loc
    AND status = 'active';

    WHILE v_active_count < 5 LOOP
      SELECT q.id, l.name, u.email INTO r
      FROM featured_queue q
      JOIN listings l ON q.listing_id = l.id
      JOIN auth.users u ON l.owner_id = u.id
      WHERE q.location = v_loc
      AND q.status = 'pending'
      ORDER BY q.started_at ASC
      LIMIT 1;

      IF r.id IS NOT NULL THEN
        -- Recalculate Dates
        UPDATE featured_queue
        SET started_at = now(),
            ends_at = now() + interval '30 days'
        WHERE id = r.id;
        
        PERFORM activate_queued_item(r.id);
        
        -- Prepare Notification
        action_type := 'activation';
        listing_name := r.name;
        location := v_loc;
        user_email := r.email;
        ends_at := now() + interval '30 days';
        queue_id := r.id;
        
        v_active_count := v_active_count + 1;
        RETURN NEXT;
      ELSE
        EXIT;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;
