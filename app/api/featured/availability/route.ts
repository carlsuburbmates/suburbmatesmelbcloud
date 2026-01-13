import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const council = searchParams.get('council');

    if (!council) {
        return new NextResponse('Missing council parameter', { status: 400 });
    }

    const supabase = await createClient();

    try {
        // Call the RPC
        // @ts-ignore - RPC types not yet generated
        const { data, error } = await supabase
            .rpc('check_featured_availability', { council_text: council });

        if (error) {
            console.error('Availability Check Error:', error);
            return new NextResponse('Internal Error', { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({
                isWaitlist: false,
                nextAvailableDate: null,
                totalCount: 0
            });
        }

        const { total_count, pending_count, next_available_date } = data[0];
        const isFull = (total_count >= 5);

        return NextResponse.json({
            isWaitlist: isFull,
            nextAvailableDate: next_available_date,
            totalCount: total_count,
            pendingCount: pending_count
        });
    } catch (err) {
        console.error('Unexpected Error:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
