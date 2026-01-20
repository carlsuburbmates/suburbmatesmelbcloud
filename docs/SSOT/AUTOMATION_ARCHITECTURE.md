# Automation Architecture

**Status:** SSOT - AUTHORITATIVE  
**Last Updated:** January 2026  
**Scope:** Complete automation system (Database + AI + Cron)  
**Related Docs:** 
- `OPERATOR_AND_ADMIN_AUTOMATION.md` (database triggers/functions)
- `AI_AUTOMATION.md` (Z.ai integration)
- `SCHEMA_MAP.md` (database schema)

---

## Overview

SuburbMates is designed as a **solo-operator platform**. Automation is not optional—it's the core operating model. This document defines the complete automation architecture across three layers:

1. **Database Layer** - Triggers & Functions (PostgreSQL/Supabase)
2. **Application Layer** - Server Actions & Webhooks (Next.js)
3. **AI Layer** - Intelligent automation & content moderation (Z.ai)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTOMATION LAYERS                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  User Actions   │ (Claim listing, add product, purchase Pro)
└────────┬────────┘
         │
         ├──────────────────────────────────────────────────┐
         │                                                   │
         v                                                   v
┌────────────────────┐                          ┌────────────────────┐
│  DATABASE LAYER    │                          │  APPLICATION LAYER │
│  (Triggers)        │                          │  (Server Actions)  │
├────────────────────┤                          ├────────────────────┤
│ • Validate tier    │                          │ • Process payments │
│ • Enforce limits   │                          │ • Send emails      │
│ • Check taxonomy   │                          │ • Update tiers     │
│ • Auto-create user │                          │ • Call AI          │
└────────┬───────────┘                          └────────┬───────────┘
         │                                               │
         │                                               v
         │                                      ┌────────────────────┐
         │                                      │   AI LAYER (Z.ai) │
         │                                      ├────────────────────┤
         │                                      │ • Moderate content │
         │                                      │ • Categorize       │
         │                                      │ • Generate text    │
         │                                      │ • Extract data     │
         │                                      └────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────┐
│  SCHEDULED JOBS (Cron)                                   │
├─────────────────────────────────────────────────────────┤
│ • process_daily_queue() - Featured FIFO rotation        │
│ • expire_finished_slots() - Clean expired placements    │
│ • cleanup_stuck_processing() - Recover stuck tasks      │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Database Layer Automation

**Purpose:** Immediate, atomic enforcement that cannot be bypassed by API calls.

### 1.1 Triggers (Real-time Validation)

| Trigger Name | Table | Event | Purpose | Migration File |
|--------------|-------|-------|---------|----------------|
| `on_auth_user_created` | `auth.users` | INSERT | Auto-create `users_public` profile | `20260108000000_consolidate_identity_taxonomy.sql` |
| `check_product_limit_trigger` | `products` | INSERT | Enforce tier limits (Basic: 3, Pro: 10) | `20260102000002_create_products.sql` |
| `listings_check_category_type` | `listings` | INS/UPD | Enforce "business" categories only | `20260103000002_taxonomy_triggers_and_rpc.sql` |
| `products_check_category_type` | `products` | INS/UPD | Enforce "product" categories only | `20260103000002_taxonomy_triggers_and_rpc.sql` |
| `listing_tags_check_limit` | `listing_tags` | INSERT | Max 5 tags per listing | `20260103000002_taxonomy_triggers_and_rpc.sql` |
| `product_tags_check_limit` | `product_tags` | INSERT | Max 5 tags per product | `20260103000002_taxonomy_triggers_and_rpc.sql` |

**Implementation Pattern:**

```sql
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  current_tier listing_tier;
  max_limit INTEGER;
BEGIN
  SELECT tier INTO current_tier FROM listings WHERE id = NEW.listing_id;
  
  IF current_tier = 'Basic' THEN max_limit := 3;
  ELSIF current_tier = 'Pro' THEN max_limit := 10;
  ELSE max_limit := 3;
  END IF;

  SELECT COUNT(*) INTO current_count FROM products WHERE listing_id = NEW.listing_id;

  IF current_count >= max_limit THEN
    RAISE EXCEPTION 'Product limit reached for % tier. Limit is %.', current_tier, max_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_product_limit_trigger
BEFORE INSERT ON products
FOR EACH ROW EXECUTE FUNCTION check_product_limit();
```

### 1.2 RPC Functions (Complex Operations)

#### Search Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `search_listings()` | Full-text search with council/category filters | `TABLE (listings)` |
| `search_products()` | Product search with filters | `TABLE (products)` |

#### Featured Queue Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `check_queue_availability()` | Check if council has free slots (max 5) | `INTEGER` (available count) |
| `join_queue()` | Add listing to FIFO queue | `UUID` (queue entry ID) |
| `process_daily_queue()` | Expire old slots, promote pending | `TABLE (actions)` |
| `activate_queued_item()` | Manually activate a pending item | `VOID` |
| `expire_finished_slots()` | Clean up expired entries | `VOID` |

#### Monetization Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `claim_promotion_tasks()` | Background job to process queue actions | `TABLE (tasks)` |
| `reconcile_and_finalize()` | Reconcile Stripe payment with queue entry | `VOID` |
| `cleanup_stuck_processing()` | Recover stuck/failed tasks | `INTEGER` (count fixed) |

#### Utility Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `get_my_role()` | Get current user's role | `app_role` |
| `upsert_tag()` | Create or update tag by name | `UUID` (tag ID) |
| `handle_new_user()` | Initialize user profile (called by trigger) | `VOID` |

**Example: FIFO Queue Processing**

```sql
CREATE OR REPLACE FUNCTION public.process_daily_queue()
RETURNS TABLE (
    action_type text,       -- 'expired' or 'promoted'
    listing_id uuid,
    listing_name text,
    owner_email text,
    council_name text,
    new_end_date timestamptz
)
LANGUAGE plpgsql AS $$
DECLARE
    r_expired RECORD;
    r_next RECORD;
BEGIN
    -- 1. Expire active items past their end date
    FOR r_expired IN
        SELECT fq.id, fq.listing_id, fq.council_name, l.name, u.email
        FROM featured_queue fq
        JOIN listings l ON fq.listing_id = l.id
        JOIN users_public up ON l.owner_id = up.id
        JOIN auth.users u ON up.id = u.id
        WHERE fq.status = 'active' AND fq.ends_at < now()
    LOOP
        UPDATE featured_queue SET status = 'expired' WHERE id = r_expired.id;
        
        -- Return expiry event
        RETURN NEXT (SELECT 'expired', r_expired.listing_id, ...);
        
        -- 2. Promote next in line (FIFO)
        SELECT fq.id, fq.listing_id, l.name, u.email INTO r_next
        FROM featured_queue fq
        JOIN listings l ON fq.listing_id = l.id
        JOIN users_public up ON l.owner_id = up.id
        JOIN auth.users u ON up.id = u.id
        WHERE fq.council_name = r_expired.council_name
        AND fq.status = 'pending'
        ORDER BY fq.requested_at ASC LIMIT 1;
        
        IF FOUND THEN
            UPDATE featured_queue
            SET status = 'active',
                started_at = now(),
                ends_at = now() + interval '30 days'
            WHERE id = r_next.id;
            
            UPDATE listings
            SET featured_until = now() + interval '30 days'
            WHERE id = r_next.listing_id;
            
            -- Return promotion event
            RETURN NEXT (SELECT 'promoted', r_next.listing_id, ...);
        END IF;
    END LOOP;
END;
$$;
```

---

## 2. Scheduled Jobs (Cron)

**⚠️ CRITICAL:** Cron jobs are NOT defined in migrations. They must be configured manually in Supabase Dashboard.

### Required Cron Jobs

| Job Name | Schedule | Function Called | Purpose |
|----------|----------|-----------------|---------|
| `daily_queue_rotation` | `0 0 * * *` (Midnight UTC) | `process_daily_queue()` | Expire old Featured slots, promote next in queue |
| `cleanup_expired_slots` | `0 1 * * *` (1am UTC) | `expire_finished_slots()` | Archive expired queue entries |
| `recover_stuck_tasks` | `0 */6 * * *` (Every 6 hours) | `cleanup_stuck_processing()` | Reset stuck background jobs |

### Setup Instructions

**Via Supabase Dashboard:**

1. Navigate to Database → Cron Jobs
2. Click "Create a new cron job"
3. Enter job details:
   ```sql
   select cron.schedule(
     'daily_queue_rotation',
     '0 0 * * *',
     $$SELECT * FROM process_daily_queue()$$
   );
   ```

**Via SQL (if pg_cron enabled):**

```sql
-- Enable extension (one-time)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule jobs
SELECT cron.schedule('daily_queue_rotation', '0 0 * * *', 
  $$SELECT * FROM process_daily_queue()$$);

SELECT cron.schedule('cleanup_expired_slots', '0 1 * * *', 
  $$SELECT * FROM expire_finished_slots()$$);

SELECT cron.schedule('recover_stuck_tasks', '0 */6 * * *', 
  $$SELECT * FROM cleanup_stuck_processing()$$);
```

**Verification:**

```sql
-- List all cron jobs
SELECT * FROM cron.job;

-- View cron job history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## 3. Application Layer Automation

**Purpose:** Business logic that requires external API calls, email sending, or complex workflows.

### 3.1 Stripe Webhooks

**File:** `app/api/stripe/webhook/route.ts`

| Event | Action | Side Effects |
|-------|--------|--------------|
| `checkout.session.completed` | Identify subscription vs product purchase | Update user tier, create queue entry, send email |
| `customer.subscription.created` | Activate Pro tier | `users_public.stripe_subscription_status = 'active'` |
| `customer.subscription.updated` | Sync subscription status | Update tier if status changes |
| `customer.subscription.deleted` | Downgrade to Basic | Set tier to Basic, hide Pro mini-site |
| `invoice.payment_succeeded` | Confirm renewal | Log payment, send receipt email |
| `invoice.payment_failed` | Send warning email | Mark subscription at risk |
| `account.updated` (Connect) | Update Creator's Stripe status | `users_public.stripe_account_id` updated |

**Implementation Pattern:**

```typescript
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    // ... more handlers
  }
  
  return new Response('OK', { status: 200 });
}
```

### 3.2 Email Automation

**File:** `lib/email.ts`

All emails triggered by system events:

| Trigger | Email Function | Template |
|---------|---------------|----------|
| User signs up | `sendWelcomeEmail()` | Welcome + next steps |
| Listing claimed | `sendListingClaimedEmail()` | Studio access granted |
| Listing approved | `sendListingApprovedEmail()` | Public visibility confirmed |
| Listing rejected | `sendListingRejectedEmail()` | Reason + fix instructions |
| Pro activated | `sendProActivatedEmail()` | Feature list + CTA |
| Pro expires | `sendProExpiredEmail()` | Downgrade notice |
| Payment failed | `sendPaymentFailedEmail()` | Update billing details |
| Featured active | `sendFeaturedActiveEmail()` | Slot live notification |
| Featured queued | `sendFeaturedQueuedEmail()` | Reserved spot confirmation |
| Report received | `sendReportReceivedEmail()` | Acknowledgment |
| Warning issued | `sendEnforcementWarningEmail()` | Official warning |
| Account suspended | `sendEnforcementSuspensionEmail()` | Suspension notice |
| Account terminated | `sendEnforcementEvictionEmail()` | Final notice |

**Integration with Cron:**

```typescript
// Called by external cron job processor or webhook
export async function processDailyQueueNotifications() {
  const { data } = await supabase.rpc('process_daily_queue');
  
  for (const event of data) {
    if (event.action_type === 'expired') {
      await sendFeaturedExpiryNotice(event.owner_email, ...);
    } else if (event.action_type === 'promoted') {
      await sendFeaturedActiveEmail(event.owner_email, ...);
    }
  }
}
```

---

## 4. AI Layer Automation (Phase 5)

**Status:** Infrastructure ready, workflows not yet implemented.

### 4.1 Current Capabilities

**Provider:** `lib/ai/z-ai-provider.ts` (Z.ai via Vercel AI SDK)

```typescript
import { zai, zaiModel } from '@/lib/ai/z-ai-provider';
import { generateText, generateObject } from 'ai';

// Text generation
const { text } = await generateText({
  model: zai(zaiModel),
  prompt: 'Summarize this business...',
});

// Structured output
const result = await generateObject({
  model: zai(zaiModel),
  schema: z.object({ category: z.string(), confidence: z.number() }),
  prompt: 'Categorize this listing...',
});
```

### 4.2 Planned AI Workflows

#### Auto-Triage (Content Moderation)

**Trigger:** Listing submitted or updated  
**Flow:**

```
1. User submits listing description
2. Server Action calls runZaiAutomation():
   "Analyze this business description for prohibited content:
    - Illegal services
    - Explicit content
    - Misleading claims
    Return JSON: { safe: boolean, reason: string, confidence: number }"
3. If safe && confidence > 0.8: Auto-approve
4. If unsafe: Flag for manual review + send warning email
5. If confidence < 0.8: Queue for operator review
```

**Implementation (not yet built):**

```typescript
export async function autoTriageListing(listingId: string) {
  const listing = await getListing(listingId);
  
  const result = await generateObject({
    model: zai(zaiModel),
    schema: z.object({
      safe: z.boolean(),
      reason: z.string(),
      confidence: z.number(),
      suggestedCategory: z.string().optional(),
    }),
    prompt: `Analyze this business for safety and compliance:
    Name: ${listing.name}
    Description: ${listing.description}
    Category: ${listing.category}
    
    Check for: illegal services, explicit content, misleading claims, spam.
    Return safety verdict with confidence score (0-1).`,
  });
  
  if (result.object.safe && result.object.confidence > 0.8) {
    await approveListing(listingId);
  } else if (!result.object.safe) {
    await flagListing(listingId, result.object.reason);
    await sendListingRejectedEmail(owner.email, listing.name, result.object.reason);
  } else {
    await queueForManualReview(listingId);
  }
}
```

#### Auto-Categorization

**Trigger:** User creates listing without selecting category  
**Flow:**

```
1. User enters business name + description
2. AI suggests category from canonical list
3. User confirms or overrides
4. Saved with high confidence flag
```

#### Auto-Description Enhancement

**Trigger:** User requests AI help in Creator Studio  
**Flow:**

```
1. User clicks "Improve Description" button
2. AI analyzes existing description
3. Returns 2-3 improved versions
4. User selects preferred version
```

#### Spam Detection

**Trigger:** Multiple listings from same owner in short time  
**Flow:**

```
1. Detect pattern (3+ listings in 1 hour)
2. AI analyzes for duplicate/spam content
3. Auto-suspend if spam score > 0.9
4. Send warning email + operator notification
```

### 4.3 Integration with Database Layer

**Pattern:** AI decisions trigger database updates via Server Actions.

```typescript
// AI Layer (analysis)
const { safe } = await runZaiAutomation("Is this listing safe?");

// Application Layer (business logic)
if (!safe) {
  // Database Layer (atomic update via trigger-protected tables)
  await supabase
    .from('listings')
    .update({ is_flagged: true })
    .eq('id', listingId);
}
```

---

## 5. Error Handling & Recovery

### 5.1 Database Triggers

**Behavior:** Triggers raise exceptions that rollback transactions.

```sql
-- Example: Product limit exceeded
RAISE EXCEPTION 'Product limit reached for % tier. Limit is %.', current_tier, max_limit;
```

**Handling in Application:**

```typescript
try {
  await supabase.from('products').insert(newProduct);
} catch (error) {
  if (error.message.includes('Product limit reached')) {
    return { success: false, error: 'Upgrade to Pro for more products' };
  }
}
```

### 5.2 Webhook Failures

**Stripe Retry Policy:** Automatic retries with exponential backoff (1h, 2h, 4h, 8h, 16h, 24h).

**Our Handling:**

```typescript
export async function POST(req: Request) {
  try {
    const event = stripe.webhooks.constructEvent(...);
    await handleEvent(event);
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    // Log to audit_logs table
    await logWebhookError(err);
    // Return 500 to trigger Stripe retry
    return new Response('Webhook Error', { status: 500 });
  }
}
```

### 5.3 Cron Job Failures

**Detection:**

```sql
-- Check for failed cron runs
SELECT * FROM cron.job_run_details 
WHERE status = 'failed' 
ORDER BY start_time DESC;
```

**Recovery:**

```sql
-- Manually run failed job
SELECT * FROM process_daily_queue();
```

### 5.4 AI Failures

**Pattern:** Graceful degradation to manual workflow.

```typescript
export async function autoTriageListing(listingId: string) {
  try {
    const result = await runZaiAutomation(prompt);
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.error('AI triage failed:', error);
    // Fallback: Queue for manual review
    await queueForManualReview(listingId);
  }
}
```

---

## 6. Testing Automation

### 6.1 Database Triggers

```sql
-- Test product limit trigger
BEGIN;
  INSERT INTO products (listing_id, name, price, category_id)
  VALUES ('listing-uuid', 'Test Product 1', 10.00, 'category-uuid');
  -- Repeat 3x for Basic tier
  -- 4th insert should RAISE EXCEPTION
ROLLBACK;
```

### 6.2 Webhook Testing (Local)

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test event
stripe trigger checkout.session.completed
```

### 6.3 Cron Job Testing

```sql
-- Run manually
SELECT * FROM process_daily_queue();

-- Verify results
SELECT * FROM featured_queue WHERE status = 'expired';
SELECT * FROM featured_queue WHERE status = 'active';
```

### 6.4 AI Testing

```typescript
// Test in development
const result = await runZaiAutomation("Is 'illegal drugs' a safe business name?");
console.log(result); // Should return { safe: false, ... }
```

---

## 7. Monitoring & Observability

### 7.1 Database Metrics

```sql
-- Check trigger execution count
SELECT schemaname, tablename, count(*) as trigger_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
GROUP BY schemaname, tablename;

-- Check RPC function calls
SELECT proname, calls, total_time, avg_time
FROM pg_stat_user_functions
WHERE schemaname = 'public'
ORDER BY calls DESC;
```

### 7.2 Application Metrics

**File:** `lib/audit-logs.ts` (if implemented)

```typescript
await logAction({
  action: 'listing_auto_approved',
  user_id: userId,
  metadata: { listing_id, ai_confidence: 0.95 },
});
```

### 7.3 Cron Job Monitoring

```sql
-- Recent job runs
SELECT jobname, status, start_time, end_time, 
       (end_time - start_time) as duration
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

### 7.4 AI Usage Tracking

**Z.ai Dashboard:** https://api.z.ai/dashboard (monitor usage, costs, errors)

---

## 8. Deployment Checklist

Before launch, verify:

### Database Layer
- [ ] All triggers present in production schema
- [ ] All RPC functions deployed
- [ ] Row Level Security policies active
- [ ] Indexes created for performance

### Cron Jobs
- [ ] `daily_queue_rotation` scheduled (midnight UTC)
- [ ] `cleanup_expired_slots` scheduled (1am UTC)
- [ ] `recover_stuck_tasks` scheduled (every 6 hours)
- [ ] Test manual run of each cron job
- [ ] Verify cron job history logging

### Webhooks
- [ ] Stripe webhook endpoint configured in Dashboard
- [ ] Webhook secret added to `.env.local`
- [ ] All event types handled (subscription, checkout, connect)
- [ ] Test webhook with Stripe CLI

### Email
- [ ] Resend API key active
- [ ] Domain verified in Resend
- [ ] Test all email templates
- [ ] Verify deliverability (check spam folders)

### AI
- [ ] Z.ai API key configured
- [ ] Test basic generation
- [ ] Monitor initial usage/costs
- [ ] Set up error alerts

### Monitoring
- [ ] Set up Sentry or error tracking
- [ ] Configure alerts for webhook failures
- [ ] Monitor cron job success rate
- [ ] Track AI usage and costs

---

## 9. Future Enhancements

### Phase 5 (Post-Launch)

1. **Advanced Auto-Triage**
   - Multi-pass analysis (safety + quality + categorization)
   - Learning from operator corrections
   - Confidence threshold adjustment

2. **Predictive Analytics**
   - Forecast Featured slot demand by council
   - Suggest optimal Featured placement timing
   - Predict listing quality/success

3. **Auto-Support Bot**
   - Handle common Creator questions via chat
   - Escalate complex issues to operator
   - Knowledge base integration

4. **Smart Notifications**
   - AI-summarized activity digests
   - Personalized Creator tips
   - Performance insights

---

## Related Documentation

- `OPERATOR_AND_ADMIN_AUTOMATION.md` - Detailed trigger/function reference
- `AI_AUTOMATION.md` - Z.ai integration guide
- `SCHEMA_MAP.md` - Database schema
- `api.md` - Server Actions & API Routes
- `platform-logic.md` - Business logic overview
