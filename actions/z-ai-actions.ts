'use server';

import { streamText, generateText } from 'ai';
import { zai, zaiModel } from '@/lib/ai/z-ai-provider';

/**
 * A reusable Server Action for streaming responses from Z.ai.
 * This can be used for chat interfaces, auto-generation, or background tasks.
 */
export async function generateZaiResponse(messages: any[]) {
  try {
    const result = await streamText({
      model: zai(zaiModel),
      messages: messages,
      temperature: 0.7,
    });

    // Return the stream directly for use with useChat or RSC
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Z.ai Generation Error:', error);
    throw new Error('Failed to generate response from Z.ai');
  }
}

/**
 * Example of a discrete task action (non-streaming)
 * Useful for "Generate Summary" or "Categorize Listing" buttons
 */
export async function runZaiAutomation(prompt: string) {
  'use server';
  
  try {
    const { text } = await generateText({
      model: zai(zaiModel),
      prompt: prompt,
    });
    
    return { success: true, data: text };
  } catch (error) {
    return { success: false, error: 'Automation failed' };
  }
}
