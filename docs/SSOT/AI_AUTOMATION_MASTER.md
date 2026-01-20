# AI & Automation Architecture (Master Document)

**Status:** ACTIVE
**Last Updated:** January 2026
**Authority:** `docs/SSOT/CANONICAL_TERMINOLOGY.md`
**Parent Docs:** `docs/SSOT/OPERATOR_AND_ADMIN_AUTOMATION.md`, `docs/AI_AUTOMATION.md`

This is the **Single Source of Truth** for AI implementation, automation, and operational logic within SuburbMates. All other documents must align with this hierarchy.

---

## 1. Canonical Terminology

All AI, Automation, and Ops documentation **MUST** use these terms. See `CANONICAL_TERMINOLOGY.md` for details.

| Legacy Term (BANNED) | Canonical Term (REQUIRED) | Context |
|--------------------|-------------------|---------|
| vendor | **Creator** | Owner of a Listing/Product |
| business owner | **Creator** | (See above) |
| business profile | **Listing** | A Directory entry |
| vendor dashboard | **Studio Page** | Public destination for Creator |
| pro profile | **Mini-site** | Pro feature of Studio |
| admin panel | **Operator Dashboard** | Internal platform owner interface |
| user account | **Customer** | Buyer of products |
| account | **Customer** | (See above) |

**Core Entities:**
- **Listing:** A directory entry (unclaimed or claimed).
- **Product:** A digital item sold by a Creator.
- **Studio Page:** The public destination for a claimed Creator.
- **Mini-site:** Pro mode of Studio Page.
- **Marketplace:** The public destination for browsing all Products.
- **Creator Dashboard:** (See Studio Page).
- **Operator Dashboard:** Internal tools for platform management.

---

## 2. AI Architecture (Unified Pipeline)

### 2.1. Configuration

**File:** `lib/ai/z-ai-provider.ts`

All AI requests in SuburbMates route through **Vercel AI SDK** configured for **Z.ai**.

```typescript
import { createOpenAI } from '@ai-sdk/openai';

export const zai = createOpenAI({
  apiKey: process.env.Z_AI_API_KEY,
  baseURL: process.env.Z_AI_BASE_URL || 'https://api.z.ai/api/paas/v4',
});

export const zaiModel = 'glm-4-flash';
```

**Environment Variables:**

| Variable | Required | Description |
|----------|----------|-------------|
| `Z_AI_API_KEY` | ✅ Yes | Z.ai platform API key |
| `Z_AI_BASE_URL` | ❌ No | Override default endpoint |

### 2.2. Usage Patterns

#### Pattern 1: Streaming Chat (Frontend)

**Use case:** Interactive chat interfaces, real-time AI responses.

**File:** `app/api/chat/route.ts`

```typescript
import { streamText } from 'ai';
import { zai, zaiModel } from '@/lib/ai/z-ai-provider';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: zai(zaiModel),
    messages,
  });
  
  return result.toTextStreamResponse();
}
```

**Client Component:**

```typescript
'use client';
import { useChat } from '@ai-sdk/react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat'
  });
  
  return (
    <form onSubmit={handleSubmit}>
      {messages.map(m => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
      <input value={input} onChange={handleInputChange} />
    </form>
  );
}
```

#### Pattern 2: Server Actions (Streaming)

**Use case:** Real-time generation in Server Components.

**File:** `actions/z-ai-actions.ts`

```typescript
'use server';
import { streamText } from 'ai';
import { zai, zaiModel } from '@/lib/ai/z-ai-provider';

export async function generateZaiResponse(messages: any[]) {
  try {
    const result = await streamText({
      model: zai(zaiModel),
      messages,
      temperature: 0.7,
    });
    
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Z.ai Generation Error:', error);
    throw new Error('Failed to generate response from Z.ai');
  }
}
```

#### Pattern 3: Discrete Tasks (Non-Streaming)

**Use case:** Background automation, one-off generation tasks.

**File:** `actions/z-ai-actions.ts` (and `lib/ai/copilot.ts`)

The "Operator Copilot" uses the same underlying SDK (`lib/ai/z-ai-provider.ts`) via `generateText`, ensuring all AI requests are routed through Z.ai.

```typescript
'use server';
import { generateText } from 'ai';
import { zai, zaiModel } from '@/lib/ai/z-ai-provider';

export async function runZaiAutomation(prompt: string) {
  try {
    const { text } = await generateText({
      model: zai(zaiModel),
      prompt,
    });
    
    return { success: true, data: text };
  } catch (error) {
    return { success: false, error: 'Automation failed' };
  }
}
```

**Example Usage:**

```typescript
// Auto-generate listing description
const result = await runZaiAutomation(
  `Summarize this business in 2 sentences: ${userInput}`
);

if (result.success) {
  await updateListing({ description: result.data });
}
```

#### Pattern 4: Structured JSON Output

**Use case:** Categorization, validation, data extraction.

**File:** `lib/ai/seo.ts` (SEO Agent) and `lib/ai/triage.ts` (Safety Agent)

```typescript
'use server';
import { generateObject } from 'ai';
import { zai, zaiModel } from '@/lib/ai/z-ai-provider';
import { z } from 'zod';

export async function categorizeListing(description: string) {
  const result = await generateObject({
    model: zai(zaiModel),
    schema: z.object({
      category: z.string(),
      confidence: z.number(),
      tags: z.array(z.string()),
    }),
    prompt: `Categorize this business: ${description}`,
  });
  
  return result.object;
}
```

---

## 3. Automation Architecture (Ops & Admin)

This section covers **database-layer automation**. For comprehensive overview, see `OPERATOR_AND_ADMIN_AUTOMATION.md`.

### 3.1. Safety Automations (Triggers)

Rules enforced **before** data is written to the database. Any violation raises an exception and rolls back the transaction.

| Trigger Name | Table | Event | Logic Enforced |
|--------------|-------|-------|----------------|
| `on_auth_user_created` | `auth.users` | INSERT | Auto-creates `users_public` profile |
| `check_product_limit_trigger` | `products` | INSERT | **Tier Limits:** Basic = 3, Pro = 10 |
| `listings_check_category_type` | `listings` | INSERT | **Taxonomy purity:** Business categories only |
| `products_check_category_type` | `products` | INSERT | **Taxonomy purity:** Product categories only |
| `listing_tags_check_limit` | `listing_tags` | INSERT | **Spam Prevention:** Max 5 tags |
| `product_tags_check_limit` | `product_tags` | INSERT | **Spam Prevention:** Max 5 tags |

**Example: Product Limit Enforcement**

```sql
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  current_tier listing_tier;
  max_limit INTEGER;
BEGIN
  SELECT tier INTO current_tier FROM listings WHERE id = NEW.listing_id;
  
  IF current_tier = 'Basic' THEN
    max_limit := 3;
  ELSIF current_tier = 'Pro' THEN
    max_limit := 10;
  ELSE
    max_limit := 3; -- Default safety fallback
  END IF;
  
  SELECT COUNT(*) INTO current_count FROM products WHERE listing_id = NEW.listing_id;
  
  IF current_count >= max_limit THEN
    RAISE EXCEPTION 'Product limit reached for % tier. Limit is %.', current_tier, max_limit;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3.2. Operational Automations (RPC Functions)

Functions powering core business logic.

| Function | Purpose | Returns |
|----------|---------|---------|
| `search_listings()` | Full-text search with filters | `TABLE (listings)` |
| `search_products()` | Product search | `TABLE (products)` |
| `check_queue_availability()` | Check free slots in council | `INTEGER` (count) |
| `join_queue()` | Add Listing to FIFO queue | `UUID` (queue entry ID) |
| `process_daily_queue()` | **CRON JOB:** Expire old, promote pending | `TABLE (featured_queue)` |
| `activate_queued_item()` | Manually activate pending item | `VOID` |
| `expire_finished_slots()` | Clean up expired entries | `VOID` |
| `claim_promotion_tasks()` | Background job processor | `TABLE (tasks)` |
| `reconcile_and_finalize()` | Match Stripe payment to queue | `VOID` |
| `cleanup_stuck_processing()` | Recover stuck tasks | `INTEGER` (count fixed) |

### 3.3. Scheduled Automations (Cron Jobs)

⚠️ **CRITICAL:** Cron jobs are **NOT** defined in migration files. They must be configured manually in Supabase Dashboard or via SQL after `pg_cron` extension is enabled.

| Job Name | Schedule | Function Called | Purpose |
|----------|----------|-----------------|---------|
| `daily_queue_rotation` | `0 0 * * *` | `process_daily_queue()` | Expire old Featured slots, promote next in queue |
| `cleanup_expired_slots` | `0 1 * * *` | `expire_finished_slots()` | Archive expired queue entries |
| `recover_stuck_tasks` | `0 */6 * * *` | `cleanup_stuck_processing()` | Reset stuck background jobs |

**Setup Instructions (Recommended):**

1. Navigate to **Database → Cron Jobs** in Supabase Dashboard.
2. Click **"Create a new cron job"**.
3. Enter details (e.g., `daily_queue_rotation`, `0 0 * * *`, `SELECT * FROM process_daily_queue()`).
4. Save and enable.

---

## 4. Agent Guidelines

### 4.1. AI Implementation

**Goal:** Unified AI pipeline via Z.ai and Vercel AI SDK.

- **Do Not:** Use generic `openai` fetch calls.
- **Do:** Use the helper at `lib/ai/z-ai-provider.ts` and actions in `actions/z-ai-actions.ts`.
- **Reference:** Full architecture details are in `docs/AI_AUTOMATION.md`.

### 4.2. MCP Tool Usage

**Goal:** Use installed MCP servers for external tool interactions instead of manual API calls.

- **Stripe:** Use MCP tools to check products/subscriptions.
- **Resend:** Use MCP to check email logs or domains.
- **Supabase:** Use MCP for quick schema inspection (read-only).
- **GitHub:** Use MCP to search code or check PRs.

---

## 5. Governance & Enforcement

- This document (`AI_AUTOMATION_MASTER.md`) overrides all others on naming.
- New terms must be added to `CANONICAL_TERMINOLOGY.md` before use.
- Any PR introducing forbidden terms must be rejected.
- QA must include a terminology check.

---

## 6. Related Documentation

- **`CANONICAL_TERMINOLOGY.md`** - Authoritative term definitions.
- **`OPERATOR_AND_ADMIN_AUTOMATION.md`** - Database-level automation deep dive.
- **`AUTOMATION_ARCHITECTURE.md`** - Complete automation system overview.
- **`api.md`** - Server Actions that call these functions.
