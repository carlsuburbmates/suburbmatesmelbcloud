import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { chatWithCopilot } from '@/lib/ai/copilot';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();
        const supabase = createAdminClient();

        // 1. Gather Context (Real-time Ops Data)
        // Parallel fetch for speed
        const [
            { count: pendingTriageCount },
            { count: totalUsers },
            { count: activeListings },
            { count: recentSignups }
        ] = await Promise.all([
            // Pending Triage
            supabase.from('listings').select('*', { count: 'exact', head: true }).eq('triage_status', 'pending'),
            // Total Users
            supabase.from('users_public').select('*', { count: 'exact', head: true }),
            // Active Listings
            supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'claimed'),
            // Recent Signups (Last 24h)
            supabase.from('users_public')
                .select('*', { count: 'exact', head: true })
                .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        ]);

        // 2. Chat with AI
        const reply = await chatWithCopilot(messages, {
            pendingTriageCount: pendingTriageCount || 0,
            totalUsers: totalUsers || 0,
            activeListings: activeListings || 0,
            recentSignups: recentSignups || 0
        });

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error('Copilot API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
