import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 1. Get Profile to check existing Connect ID
        const { data: profile } = await supabase
            .from('users_public')
            .select('stripe_account_id, email, full_name')
            .eq('id', user.id)
            .single();

        if (!profile) return new NextResponse('Profile not found', { status: 404 });

        let accountId = profile.stripe_account_id;

        // 2. If no account, create one
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                email: profile.email || undefined,
                country: 'AU',
                business_type: 'individual',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    supabase_user_id: user.id
                }
            });

            accountId = account.id;

            // Save to Supabase
            await supabase
                .from('users_public')
                .update({ stripe_account_id: accountId })
                .eq('id', user.id);
        }

        // 3. Create Account Link for Onboarding
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${origin}/studio/billing?reauth=true`,
            return_url: `${origin}/studio/billing?success=true`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error: any) {
        console.error('Stripe Connect Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
