import { generateSuburbSpotlight } from '@/lib/ai/seo';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// This route should be secured. 
// In prod, verify a CRON_SECRET header.
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow dev mode access if CRON_SECRET is not set, or block.
        // For 'solo operator' local dev, maybe skip. 
        // return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();

    // 1. Determine Target Suburb
    // Strategy: Find a suburb with >3 listings that hasn't had an article recently.
    // Complex query. For MVP: Randomly pick a suburb from active listings.

    // Get distinct suburbs with active listings
    const { data: suburbs } = await supabase
        .from('listings')
        .select('suburb')
        .eq('status', 'active');

    if (!suburbs || suburbs.length === 0) {
        return NextResponse.json({ message: 'No active suburbs found.' });
    }

    // Deduplicate and pick one
    const uniqueSuburbs = Array.from(new Set(suburbs.map(s => s.suburb)));
    const randomSuburb = uniqueSuburbs[Math.floor(Math.random() * uniqueSuburbs.length)];

    // 2. Run Agent
    if (!randomSuburb) return NextResponse.json({ message: 'No suburb selected.' });

    const result = await generateSuburbSpotlight(randomSuburb);

    return NextResponse.json({
        target: randomSuburb,
        result
    });
}
