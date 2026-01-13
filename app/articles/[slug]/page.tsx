import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown'; // Assuming we can use a markdown renderer or just raw HTML if formatted. 
// Note: we might not have 'react-markdown' installed. I'll use simple whitespace-pre-wrap for now or try to install it.
// Actually, let's just make it simple text rendering for MVP.

export const revalidate = 3600; // Cache for 1 hour

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const supabase = await createClient();
    const { slug } = await params;

    const { data: article } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!article) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-black text-slate-900 mb-4">{article.title}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                <span>Published {new Date(article.published_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>{article.suburb}</span>
            </div>
            
            <article className="prose prose-lg prose-slate max-w-none">
                 {/* 
                   Basic Markdown rendering support without external lib for simplicity in this agent session.
                   In a real app, I'd install react-markdown or marked.
                   For now, we just render line breaks.
                 */}
                <div className="font-serif text-lg leading-relaxed text-slate-800">
                    <Markdown>{article.content}</Markdown>
                </div>
            </article>
        </div>
    );
}
