import { generateObject } from 'ai';
import { zai } from '@/lib/ai/z-ai-provider';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

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

    // Define schema for AI output
    const ArticleSchema = z.object({
        title: z.string(),
        slug: z.string(),
        content: z.string()
    });

    // 2. Draft Content
    try {
        interface ListingJoin {
            name: string;
            description: string | null;
            average_rating: number | null;
            category: { name: string } | { name: string }[] | null;
        }

        const context = JSON.stringify(
            (listings as unknown as ListingJoin[]).map(l => {
                const catName = Array.isArray(l.category) ? l.category[0]?.name : l.category?.name;
                return {
                    name: l.name,
                    type: catName,
                    desc: l.description,
                    rating: l.average_rating
                };
            })
        );

        const { object } = await generateObject({
            model: zai('glm-4-flash'),
            schema: ArticleSchema,
            prompt: `You are a Local Expert Journalist. Write a 800-word "Spotlight" article about best pet businesses in ${suburb}.
                    
                    Use provided JSON data.
                    
                    Format: Markdown.
                    Structure:
                    - Catchy Title (H1)
                    - Intro about ${suburb}.
                    - "Top Picks".
                    - Conclusion.
                    
                    Slug: kebab-case based on title
                    Listings: ${context}`,
        });

        const { title, slug, content } = object;

        if (!content) throw new Error('Failed to generate content');

        // 3. Publish (Save to DB)
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
            if (error.code === '23505') {
                // Unique violation
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
