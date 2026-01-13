import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';

// Initialize Z.AI
const openai = new OpenAI({
    apiKey: process.env.Z_AI_API_KEY || 'dummy-key',
    baseURL: 'https://api.z.ai/api/paas/v4',
});

export async function generateSuburbSpotlight(suburb: string) {
    const supabase = await createClient();

    // 1. Fetch Data
    const { data: listings } = await supabase
        .from('listings')
        .select('name, category:categories(name), description, average_rating')
        .eq('suburb', suburb)
        .eq('status', 'claimed'); // Only active (claimed) listings

    if (!listings || listings.length < 3) {
        return { success: false, reason: 'Not enough listings to generate content.' };
    }

    // 2. Draft Content
    // Define type for the join result to avoid 'any' casting
    interface ListingJoin {
        name: string;
        description: string | null;
        average_rating: number | null;
        category: { name: string } | { name: string }[] | null;
    }

    const typedListings = listings as unknown as ListingJoin[];

    // We pass the raw data to the LLM to synthesize
    const context = JSON.stringify(typedListings.map(l => {
        const catName = Array.isArray(l.category) ? l.category[0]?.name : l.category?.name;
        return {
            name: l.name,
            type: catName,
            desc: l.description,
            rating: l.average_rating
        };
    }));

    try {
        const response = await openai.chat.completions.create({
            model: 'glm-4-flash',
            messages: [
                {
                    role: 'system',
                    content: `You are a Local Expert Journalist. Write a 800-word "Spotlight" article about the best pet businesses in ${suburb}.
                    
                    Use the provided JSON data.
                    
                    Format: Markdown.
                    Structure:
                    - Catchy Title (H1)
                    - Intro about ${suburb}.
                    - "Top Picks".
                    - Conclusion.
                    
                    Return JSON: { "title": string, "slug": string, "content": string }
                    Slug: kebab-case`
                },
                {
                    role: 'user',
                    content: `Listings: ${context}`
                }
            ],
            response_format: { type: 'json_object' },
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        const { title, slug, content } = result;

        if (!content) throw new Error('Failed to generate content');

        // 3. Publish (Save to DB)
        // Check uniqueness of slug first (or just suffix it)
        const { error } = await supabase
            .from('articles')
            .insert({
                title,
                slug,
                content,
                suburb,
                published_at: new Date().toISOString()
            });

        if (error) {
            // Handle duplicate slug collision crudely for MVP
            if (error.code === '23505') { // Unique violation
                const newSlug = `${slug}-${Date.now()}`;
                await supabase.from('articles').insert({ title, slug: newSlug, content, suburb });
            } else {
                throw error;
            }
        }

        return { success: true, slug };

    } catch (e: any) {
        console.error('SEO Agent Error:', e);
        return { success: false, reason: e.message };
    }
}
