import OpenAI from 'openai';

// Initialize Z.AI
const openai = new OpenAI({
    apiKey: process.env.Z_AI_API_KEY || 'dummy-key',
    baseURL: 'https://api.z.ai/api/paas/v4',
});

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
You are the "Operator Copilot" (Chief of Staff) for SuburbMates (a local directory platform).
Your goal is to help the solo operator manage the platform efficiently.

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

        const response = await openai.chat.completions.create({
            model: 'glm-4-flash',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.3,
        });

        return response.choices[0].message.content || 'System Offline.';

    } catch (error: any) {
        console.error('Copilot Error:', error);
        return `Error: ${error.message}`;
    }
}
