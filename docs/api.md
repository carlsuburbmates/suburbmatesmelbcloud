# API Documentation

**Status:** NON-AUTHORITATIVE - For implementation details, defer to `docs/SSOT/**`  
**Last Updated:** January 2026  
**Architecture:** Next.js 15 App Router with Server Actions + API Routes

---

## Overview

SuburbMates uses a hybrid API architecture:
- **Server Actions** for mutations and form submissions (preferred)
- **API Routes** for webhooks, external integrations, and streaming responses
- **Supabase RPC** for complex database queries

---

## Authentication

All authenticated endpoints expect a **Supabase Auth session** managed via cookies.

**Client-side:**
```typescript
import { createClient } from '@/utils/supabase/client';
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
```

**Server-side (Server Actions):**
```typescript
import { createClient } from '@/utils/supabase/server';
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

---

## Server Actions (Primary API)

Server Actions are located in `app/actions/` and are the **preferred method** for data mutations.

### Listing Management

#### `claimListing(formData: FormData)`

**Location:** `app/actions/claim-listing.ts`

**Purpose:** Claim an unclaimed listing with ABN validation

**Parameters:**
- `listingId`: UUID of the listing
- `abn`: 11-digit ABN (Luhn algorithm validated)

**Flow:**
1. Validates ABN using Luhn checksum
2. Checks listing is unclaimed
3. Links listing to authenticated user
4. Sets `is_verified = true` (if ABN valid)
5. Promotes user role to 'creator'
6. Sends "Listing Claimed" email
7. Redirects to `/studio/onboarding/[id]`

**Returns:** Redirect or error object

---

#### `updateListing(formData: FormData)`

**Location:** `app/actions/update-listing.ts`

**Purpose:** Update listing details (description, contact, etc.)

**Parameters:**
- `listingId`: UUID
- `name`: string
- `description`: string (optional)
- `phone`: string (optional)
- `contact_email`: string (optional)
- `website`: string (optional)
- `category_id`: UUID

**Validation:**
- User must be owner
- Category must be 'business' type

**Returns:** Success or error object

---

### Product Management

#### `createProduct(formData: FormData)`
#### `updateProduct(formData: FormData)`
#### `deleteProduct(productId: string)`

**Location:** `app/actions/products.ts`

**Purpose:** CRUD operations for digital products

**Validation:**
- User must own the listing
- Product category must be 'product' type
- Enforces product limits (Basic: 3, Pro: 10)

**Returns:** Product object or error

---

### Cart & Checkout

#### `addToCart(productId: string, quantity: number)`
#### `removeFromCart(cartItemId: string)`
#### `updateCartQuantity(cartItemId: string, quantity: number)`

**Location:** `app/actions/cart.ts`

**Purpose:** Shopping cart management

**Storage:** Persisted to `cart_items` table if authenticated, sessionStorage if guest

**Returns:** Updated cart state

---

### Admin Actions

#### `approveListingTriage(listingId: string)`
#### `flagListingTriage(listingId: string, reason: string)`

**Location:** `app/actions/admin-triage.ts`

**Purpose:** Triage queue management (Operator only)

**Authorization:** Requires `role = 'operator'`

**Flow:**
1. Updates `listings.triage_status` → 'safe' | 'flagged'
2. Sends email to listing owner
3. Logs action in `audit_logs`

---

#### `warnUser(userId: string, reason: string)`
#### `suspendUser(userId: string, reason: string, until: Date)`
#### `evictUser(userId: string, reason: string)`

**Location:** `app/actions/admin-users.ts`

**Purpose:** Enforcement ladder (Operator only)

**Flow:**
1. Updates `users_public` enforcement fields
2. Sends enforcement email
3. Logs action in `audit_logs`

---

### AI Actions

#### `generateZaiResponse(messages: Message[])`
#### `runZaiAutomation(prompt: string)`

**Location:** `app/actions/z-ai-actions.ts`

**Purpose:** AI-powered content generation and automation

**Provider:** Z.ai via Vercel AI SDK

**Usage:**
```typescript
// Streaming (for UI)
const stream = await generateZaiResponse([
  { role: 'user', content: 'Analyze this listing...' }
]);

// Single response (for automation)
const result = await runZaiAutomation('Summarize: ...');
```

---

## API Routes

API Routes are located in `app/api/` and handle webhooks, external integrations, and streaming.

### Stripe Webhook

**Endpoint:** `POST /api/stripe/webhook`  
**Location:** `app/api/stripe/webhook/route.ts`

**Purpose:** Handle Stripe events for subscriptions, payments, and Connect accounts

**Events Handled:**

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Pro upgrade, Featured placement, Product sale |
| `customer.subscription.updated` | Tier sync (Pro/Basic) |
| `customer.subscription.deleted` | Downgrade to Basic |
| `invoice.payment_failed` | Send payment failed email |
| `account.updated` | Connect account status update |

**Security:** Validates webhook signature using `STRIPE_WEBHOOK_SECRET`

**Example Flow (Pro Upgrade):**
```
User completes Stripe Checkout
→ Webhook: checkout.session.completed
→ Update users_public.stripe_subscription_status = 'active'
→ Update listings.tier = 'Pro'
→ Send Pro Activated email
```

---

### Stripe Checkout Session

**Endpoint:** `POST /api/stripe/checkout`  
**Location:** `app/api/stripe/checkout/route.ts`

**Purpose:** Create Stripe Checkout session for subscriptions or one-time payments

**Request Body:**
```json
{
  "mode": "subscription" | "payment",
  "priceId": "price_xxx",
  "metadata": {
    "supabase_user_id": "uuid",
    "purchase_type": "pro_subscription" | "featured_placement" | "product_sale"
  }
}
```

**Returns:**
```json
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/..."
}
```

---

### Product Checkout

**Endpoint:** `POST /api/checkout`  
**Location:** `app/api/checkout/route.ts`

**Purpose:** Create marketplace checkout session (Stripe Connect destination charge)

**Request Body:**
```json
{
  "items": [
    { "productId": "uuid", "quantity": 1 }
  ]
}
```

**Flow:**
1. Validates products exist and are active
2. Fetches seller's Stripe Connect account ID
3. Calculates platform fee (6% or 8% based on tier)
4. Creates Checkout session with `payment_intent_data.destination`
5. Creates `orders` and `order_items` records (status: 'pending')
6. Returns session URL

**Returns:**
```json
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/..."
}
```

---

### AI Chat

**Endpoint:** `POST /api/chat`  
**Location:** `app/api/chat/route.ts`

**Purpose:** Streaming AI chat endpoint (Z.ai)

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Help me optimize my listing" }
  ]
}
```

**Returns:** Server-Sent Events (SSE) stream

**Usage (Client-side):**
```typescript
import { useChat } from '@ai-sdk/react';

const { messages, input, handleSubmit } = useChat({
  api: '/api/chat'
});
```

---

### Order Management

**Endpoint:** `GET /api/orders/[id]`  
**Location:** `app/api/orders/[id]/route.ts`

**Purpose:** Fetch order details

**Authorization:** Must be customer or seller of the order

**Returns:**
```json
{
  "id": "uuid",
  "status": "paid",
  "total_cents": 5000,
  "platform_fee_cents": 300,
  "seller_earnings_cents": 4700,
  "items": [
    {
      "product_id": "uuid",
      "product_name": "Template Pack",
      "quantity": 1,
      "price_cents": 5000
    }
  ],
  "created_at": "2026-01-21T00:00:00Z"
}
```

---

## Supabase RPC Functions

Direct database calls using Supabase RPC functions (defined in migrations).

### Search Functions

#### `search_listings()`

**Purpose:** Full-text search with ranking

**Parameters:**
```typescript
{
  search_query: string | null,
  category_filter: string | null,  // UUID
  limit_val: number,
  offset_val: number
}
```

**Returns:** Array of listings ranked by:
1. Featured (with `featured_until > now()`)
2. Pro (`tier = 'Pro'`)
3. Basic (`tier = 'Basic'`)
4. Unclaimed (`status = 'unclaimed'`)

Within each bucket: Verified > Non-verified

**Usage:**
```typescript
import { searchListings } from '@/lib/search';

const listings = await searchListings({
  query: 'web design',
  category: categoryId,
  limit: 20
});
```

---

#### `search_products()`

**Purpose:** Product search with seller metadata

**Parameters:**
```typescript
{
  search_query: string | null,
  category_filter: string | null,
  min_price: number | null,
  max_price: number | null,
  limit_val: number,
  offset_val: number
}
```

**Returns:** Array of products with listing metadata (seller name, verification status)

---

### Featured Queue Functions

#### `check_featured_availability(council_text: string)`

**Purpose:** Check FIFO queue capacity for a Council area

**Returns:**
```json
{
  "total_count": 5,
  "pending_count": 2,
  "next_available_date": "2026-02-15T00:00:00Z"
}
```

---

#### `activate_queued_item(queue_record_id: number)`

**Purpose:** Promote pending featured item to active

**Flow:**
1. Updates `featured_queue.status` → 'active'
2. Updates `listings.featured_until` → queue end date
3. Called by webhook or cron job

---

### Utility Functions

#### `get_my_role()`

**Purpose:** Get current user's role

**Returns:** `'visitor' | 'creator' | 'operator'`

**Usage:**
```typescript
const { data: role } = await supabase.rpc('get_my_role');
```

---

#### `upsert_tag(tag_name: string)`

**Purpose:** Create tag if doesn't exist, return tag ID

**Returns:** UUID of tag

---

## Response Formats

### Success Response (Server Actions)

```typescript
{
  success: true,
  data?: any
}
```

### Error Response (Server Actions)

```typescript
{
  error: string  // Human-readable error message
}
```

### API Route Success

```json
{
  "data": { ... }
}
```

### API Route Error

```json
{
  "error": "Error message"
}
```

Status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

**Current Status:** Not implemented

**Future:** Consider rate limiting for:
- `/api/chat` (AI calls)
- `/api/stripe/checkout` (prevent spam)
- Public search endpoints

---

## CORS

**Current Status:** Same-origin only

**Configuration:** No CORS headers set (Next.js default)

---

## Data Validation

### Zod Schemas

All server actions use Zod for validation:

```typescript
import { z } from 'zod';

const ClaimSchema = z.object({
  listingId: z.string().uuid(),
  abn: z.string().length(11, 'ABN must be 11 digits')
});

const validation = ClaimSchema.safeParse(data);
if (!validation.success) {
  return { error: validation.error.message };
}
```

---

## Testing

### Local Webhook Testing (Stripe)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy webhook secret to .env.local
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Test with sample event
stripe trigger checkout.session.completed
```

### API Route Testing

```bash
# Using curl
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"uuid","quantity":1}]}'
```

---

## Security Best Practices

### Server Actions

✅ **Always validate user authorization:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return { error: 'Unauthorized' };
}
```

✅ **Use RLS policies:** Supabase enforces row-level security automatically

✅ **Validate input with Zod:** Prevent injection attacks

❌ **Never trust client-side data:** Always revalidate on server

---

### API Routes

✅ **Validate webhook signatures:**
```typescript
const signature = req.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

✅ **Use admin client for privileged operations:**
```typescript
import { createAdminClient } from '@/utils/supabase/admin';
const supabase = createAdminClient();
```

✅ **Sanitize user input:** Use Zod, avoid raw SQL

---

## Example Workflows

### Claiming a Listing

```typescript
// 1. User submits claim form
<form action={claimListing}>
  <input name="listingId" value={listing.id} />
  <input name="abn" placeholder="12345678901" />
  <button type="submit">Claim Listing</button>
</form>

// 2. Server action validates ABN
const isValid = validateABN(abn);  // Luhn algorithm

// 3. Update database
await supabase
  .from('listings')
  .update({
    status: 'claimed',
    owner_id: user.id,
    is_verified: true,
    abn: abn
  })
  .eq('id', listingId);

// 4. Promote role
await supabase
  .from('users_public')
  .update({ role: 'creator' })
  .eq('id', user.id);

// 5. Send email
await sendListingClaimedEmail(user.email, listing.name);

// 6. Redirect
redirect(`/studio/onboarding/${listingId}`);
```

---

### Processing a Product Sale

```typescript
// 1. User clicks "Buy Now"
// → Creates Checkout session with Connect destination charge

// 2. Stripe Checkout completes
// → Webhook: checkout.session.completed

// 3. Update order status
await supabase
  .from('orders')
  .update({
    status: 'paid',
    stripe_payment_intent_id: paymentIntentId,
    payout_status: 'routed'
  })
  .eq('id', orderId);

// 4. Funds automatically route
// → Platform fee → Platform account
// → Net amount → Seller's Connect account

// 5. Send confirmation email
await sendOrderConfirmationEmail(customer.email, order);
```

---

## Migration to New Endpoints

**Deprecated Patterns:**
- ❌ Direct OpenAI API calls → Use `actions/z-ai-actions.ts`
- ❌ Client-side Stripe calls → Use `/api/stripe/checkout`
- ❌ Direct Supabase mutations in components → Use Server Actions

**Preferred Patterns:**
- ✅ Server Actions for mutations
- ✅ Supabase RPC for complex queries
- ✅ API Routes for webhooks only

---

## Additional Resources

- **SSOT Documentation:** `docs/SSOT/`
- **Agent Instructions:** `AGENTS.md`
- **Platform Logic:** `docs/platform-logic.md`
- **Schema Map:** `docs/SSOT/SCHEMA_MAP.md`
- **Stripe Integration:** `lib/stripe.ts`
- **Email Templates:** `lib/email.ts`

---

**For authoritative implementation details, always defer to the source code and SSOT documentation.**
