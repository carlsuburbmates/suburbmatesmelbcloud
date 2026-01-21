import { createOpenAI } from '@ai-sdk/openai';

// Ensure we have the API key
const apiKey = process.env.Z_AI_API_KEY;
const baseURL = process.env.Z_AI_BASE_URL || 'https://api.z.ai/api/paas/v4';

if (!apiKey) {
  console.warn('Missing Z_AI_API_KEY environment variable');
}

// Create a custom OpenAI instance configured for Z.ai
// This allows the Vercel AI SDK to treat Z.ai just like OpenAI
export const zai = createOpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
});

// Helper to get the default model, easy to change globally later
export const zaiModel = 'glm-4.7'; // Canonical Z.ai model for general tasks (Zhipu GLM-4.7)
