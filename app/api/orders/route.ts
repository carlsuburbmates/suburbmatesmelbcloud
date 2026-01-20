import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'You must be logged in' },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const scope = url.searchParams.get('scope');
  const payoutStatus = url.searchParams.get('payout_status');
  const status = url.searchParams.get('status');
  const limit = parseInt(url.searchParams.get('limit') || '50');

  if (scope === 'admin') {
    const { data: profile } = await supabase
      .from('users_public')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'operator') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    let query = supabase
      .from('orders')
      .select('id, customer_id, seller_id, total_cents, platform_fee_cents, seller_earnings_cents, payout_status, seller_stripe_account_id, stripe_application_fee_id, status, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (payoutStatus) {
      query = query.eq('payout_status', payoutStatus);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching admin orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });
  } else if (scope === 'creator') {
    let query = supabase
      .from('orders')
      .select('id, customer_id, total_cents, platform_fee_cents, seller_earnings_cents, payout_status, status, created_at, updated_at')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (payoutStatus) {
      query = query.eq('payout_status', payoutStatus);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching creator orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });
  } else {
    return NextResponse.json(
      { error: 'Invalid scope' },
      { status: 400 }
    );
  }
}
