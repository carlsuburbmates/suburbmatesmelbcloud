'use server';

export async function generateProductDescription(name: string, category: string): Promise<string> {
    // Mock AI for MVP
    // In a real app, this would call OpenAI or Gemini.

    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency

    const adjectives = ['premium', 'high-quality', 'essential', 'professional', 'custom-crafted'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];

    return `This ${adj} ${name} is perfect for your needs in ${category}. 
Designed with attention to detail and built to deliver outstanding results. 
Includes comprehensive support and documentation to ensure you get the most out of it.`;
}
