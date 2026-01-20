import { generateText } from 'ai';
import { zai } from '@/lib/ai/z-ai-provider';

interface CopilotContext {
    pendingTriageCount: number;
    totalUsers: number;
    activeListings: number;
    recentSignups: number; // Last 24h
}

export async function chatWithCopilot(messages: any[], context: CopilotContext) {
    if (!process.env.Z_AI_API_KEY) {
        return "Critical: Z_AI_API_KEY is missing. I cannot think.";
    }

    try {
        const systemPrompt = `
        You are "Operator Copilot" (Chief of Staff) for SuburbMates (a local directory platform).
        Your goal is to help solo operator manage platform efficiently.

        Current System Status:
        - Pending Listings (Triage Queue): ${context.pendingTriageCount}
        - Active Listings: ${context.activeListings}
        - Total Users: ${context.totalUsers}
        - Recent Signups (24h): ${context.recentSignups}

        Instructions:
        1. Be concise, professional, but friendly (like a smart executive assistant).
        2. If asked "What should I do?", prioritize Triage if count > 0.
        3. You can draft content, answer ops questions, or analyze stats.
        4. Keep answers short (max 3-4 sentences) unless asked for a draft.

        Format: Markdown.
        `;

        const { text } = await generateText({
            model: zai('glm-4-flash'),
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.3,
        });

        return text;

    } catch (error: any) {
        console.error('Copilot Error:', error);
        return `Error: ${error.message}`;
    }
}
