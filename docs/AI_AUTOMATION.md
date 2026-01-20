# AI Automation & MCP Setup

This document outlines the infrastructure for AI automation and Model Context Protocol (MCP) integration within the SuburbMates project.

## Overview

The project uses a dual-layer approach to AI:
1.  **Vercel AI SDK**: For application-level AI features (chat bots, auto-generation, listing helpers). This connects to **Z.ai** (via OpenAI compatibility).
2.  **MCP (Model Context Protocol)**: For local development assistance and future agentic capabilities. This connects to external tools (Stripe, Supabase, Resend, Mapbox).

---

## 1. Z.ai Integration (Application Layer)

We use the **Vercel AI SDK** (`ai`, `@ai-sdk/react`) to connect to the Z.ai PaaS. This allows us to use standard AI hooks and streaming responses while routing processing through our Z.ai infrastructure.

### Configuration
The provider is configured in `lib/ai/z-ai-provider.ts`.

**Environment Variables:**
```bash
Z_AI_API_KEY=your_z_ai_key_here
Z_AI_BASE_URL=https://api.z.ai/api/paas/v4
```

### Usage

#### A. Server Actions (Backend)
Use `actions/z-ai-actions.ts` for background tasks or server-side generation.
```typescript
import { generateZaiResponse } from '@/actions/z-ai-actions';

// Streaming response (for UI)
const stream = await generateZaiResponse(messages);

// Single text generation (for automation)
import { runZaiAutomation } from '@/actions/z-ai-actions';
const { data } = await runZaiAutomation("Summarize this listing...");
```

#### B. Chat UI (Frontend)
Use the standard API route `app/api/chat/route.ts` which proxies requests to Z.ai.
```typescript
import { useChat } from '@ai-sdk/react';

const { messages, input, handleInputChange } = useChat({
  api: '/api/chat'
});
```

#### C. Testing
A built-in tester component is available at `components/studio/z-ai-tester.tsx`. You can drop `<ZAiTester />` into any page to verify connectivity.

---

## 2. Model Context Protocol (MCP)

We use MCP to give AI coding assistants (like Cursor or Claude Desktop) direct access to our project's tools and data sources.

### Configuration File
The configuration lives at `~/.config/opencode/mcp.json` (or project root `mcp.json` for reference).

### Installed Servers

| Server | Package | Purpose |
| :--- | :--- | :--- |
| **GitHub** | `@modelcontextprotocol/server-github` | Repo analysis, searching code. |
| **Supabase** | `@supabase/mcp-server-supabase` | Database inspection, SQL execution. |
| **Stripe** | `@stripe/mcp` | Managing products, prices, and subscriptions. |
| **Resend** | `resend-mcp` | Checking email logs, managing contacts. |
| **Mapbox** | `@mapbox/mcp-server` | Geocoding, map tile management. |
| **Playwright**| `@playwright/mcp` | Browser automation and E2E testing. |
| **Next.js** | `mcp-handler` | Local project context. |

### setup

To use these servers, ensure your `.env.local` contains the necessary keys (`RESEND_API_KEY`, `STRIPE_SECRET_KEY`, etc.), as these are injected into the MCP configuration.

---

## 3. Automation Strategy (Phase 5)

This infrastructure is the foundation for Phase 5 (Ops Automation). Future workflows will follow this pattern:

1.  **Trigger:** Webhook (e.g., `listing.created`) or Admin Action.
2.  **Process:** Call `runZaiAutomation(prompt)`.
3.  **Action:** AI analyzes data and performs an action (e.g., "Approve Listing", "Send Email via Resend").

### Example Workflow: Auto-Triage
1.  User submits listing.
2.  Server Action calls Z.ai: *"Analyze this description for prohibited content."*
3.  Z.ai returns JSON verdict.
4.  App updates Supabase status to `active` or `flagged`.
