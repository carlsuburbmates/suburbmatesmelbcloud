# AI Automation & MCP Setup

**Status:** ACTIVE  
**Last Updated:** January 2026  
**Authority:** NON-AUTHORITATIVE (Reference implementation for `AGENTS.md` AI Automation section)

This document provides comprehensive technical details for AI automation infrastructure and Model Context Protocol (MCP) integration within the SuburbMates project.

---

## Overview

SuburbMates uses a **dual-layer AI architecture**:

1. **Application Layer (Z.ai):** User-facing AI features via Vercel AI SDK
2. **Development Layer (MCP):** AI coding assistants with direct tool access

### Critical Rules

⚠️ **NEVER use generic `openai` fetch calls in this codebase.**  
✅ **ALWAYS use the unified pipeline:** `lib/ai/z-ai-provider.ts` → `actions/z-ai-actions.ts`

This ensures:
- Centralized model configuration (easy to swap models)
- Consistent error handling
- Usage tracking and cost monitoring
- Type safety with Vercel AI SDK

---

## 1. Z.ai Integration (Application Layer)

### Architecture

```
User Request
    ↓
Server Action / API Route
    ↓
lib/ai/z-ai-provider.ts (Vercel AI SDK)
    ↓
Z.ai PaaS (OpenAI-compatible endpoint)
    ↓
GPT-4o (or configured model)
```

### Configuration

**File:** `lib/ai/z-ai-provider.ts`

```typescript
import { createOpenAI } from '@ai-sdk/openai';

export const zai = createOpenAI({
  apiKey: process.env.Z_AI_API_KEY,
  baseURL: process.env.Z_AI_BASE_URL || 'https://api.z.ai/api/paas/v4',
});

export const zaiModel = 'gpt-4o'; // Default model
```

**Environment Variables:**

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `Z_AI_API_KEY` | ✅ Yes | Z.ai platform API key | `zai_abc123...` |
| `Z_AI_BASE_URL` | ❌ No | Override default endpoint | `https://api.z.ai/api/paas/v4` |

**Where to add:**
- Production: `.env.local` (NEVER commit)
- Local: `.env.development.local`

---

### Usage Patterns

#### Pattern 1: Streaming Chat (Frontend)

**Use case:** Interactive chat interfaces, real-time AI responses

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

**Use case:** Real-time generation in Server Components

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

**Use case:** Background automation, one-off generation tasks

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

**Use case:** Categorization, validation, data extraction

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

### Testing Z.ai Integration

#### Development Testing Component

**File:** `components/studio/z-ai-tester.tsx` (if exists)

Drop into any page for quick connectivity verification:

```typescript
import { ZAiTester } from '@/components/studio/z-ai-tester';

export default function TestPage() {
  return <ZAiTester />;
}
```

#### Manual Testing

```bash
# 1. Ensure environment variables are set
cat .env.local | grep Z_AI

# 2. Start dev server
npm run dev

# 3. Test streaming endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

---

## 2. Model Context Protocol (MCP)

MCP gives AI coding assistants (OpenCode, Cursor, Claude Desktop) direct access to external tools during development.

### Configuration

**File:** `mcp.json` (project root)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "" }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "",
        "SUPABASE_SERVICE_ROLE_KEY": ""
      }
    },
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp"],
      "env": { "STRIPE_API_KEY": "" }
    },
    "nextjs": {
      "command": "npx",
      "args": ["-y", "mcp-handler"]
    }
  }
}
```

**Active Configuration:** `~/.config/opencode/mcp.json`

### Installed MCP Servers

| Server | Package | Purpose | Use Cases |
|--------|---------|---------|-----------|
| **GitHub** | `@modelcontextprotocol/server-github` | Repository analysis | Search code, review PRs, check issues |
| **Supabase** | `@supabase/mcp-server-supabase` | Database inspection | Read schema, run queries (read-only) |
| **Stripe** | `@stripe/mcp` | Payment management | Check products, prices, subscriptions |
| **Next.js** | `mcp-handler` | Project context | Understand app structure, routes |

**Note:** Resend, Mapbox, Playwright mentioned in AGENTS.md may be added in future.

### Environment Variables for MCP

MCP servers read from your `.env.local` file. Required variables:

```bash
# GitHub
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_...

# Supabase (for schema inspection only)
NEXT_PUBLIC_SUPABASE_URL=https://nhkmhgbbbcgfbudszfqj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh... # Read-only recommended

# Stripe
STRIPE_SECRET_KEY=sk_test_...
```

**Security Note:** MCP tools run locally in your development environment. They have the same access as your terminal.

### Using MCP Tools

AI assistants with MCP support can:

```plaintext
# Example MCP interactions (invisible to user)
Assistant: [Uses @stripe/mcp] Check current Pro tier price
MCP: $20.00 AUD (price_1SoikRClBfLESB1n5bYWi4AD)
