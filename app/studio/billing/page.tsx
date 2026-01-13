import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link'; // Added
import { ConnectButton } from '@/components/studio/ConnectButton';
import { CreditCard, DollarSign, ShieldCheck, Zap } from 'lucide-react';

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ success?: string, reauth?: string }> }) {
    const supabase = await createClient();
    const { success } = await searchParams;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    const { data: profile } = await supabase
        .from('users_public')
        .select('stripe_account_id, stripe_subscription_status')
        .eq('id', user.id)
        .single();

    const isConnected = !!profile?.stripe_account_id;
    // Note: We strictly should assume checking 'charges_enabled' via API, 
    // but for MVP presence of ID is "Onbaording Started".

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Billing & Payouts</h1>
            <p className="text-slate-600 mb-8">Manage your subscription and how you get paid.</p>

            {success && (
                <div className="mb-8 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Payout setup updated successfully.
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {/* 1. Earnings & Payouts */}
                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Earnings Payouts</h2>
                            <p className="text-sm text-slate-500">Connect your bank to receive money.</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                        <p className="text-sm text-slate-600 mb-2">Payout Status</p>
                        <div className="flex items-center justify-between">
                            <span className={`font-semibold ${isConnected ? 'text-green-600' : 'text-slate-400'}`}>
                                {isConnected ? 'Active' : 'Not Connected'}
                            </span>
                            {isConnected && <ShieldCheck className="w-5 h-5 text-green-500" />}
                        </div>
                    </div>

                    <ConnectButton isConnected={isConnected} className="w-full justify-center" />
                </section>

                {/* 2. Subscription (Pro Plan) */}
                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Pro Subscription</h2>
                            <p className="text-sm text-slate-500">Manage your SuburbMates membership.</p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                        <p className="text-sm text-slate-600 mb-2">Current Plan</p>
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                                {profile?.stripe_subscription_status === 'active' ? 'Pro Plan' : 'Basic Plan'}
                            </span>
                            {profile?.stripe_subscription_status === 'active' && (
                                <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            )}
                        </div>
                    </div>

                    {profile?.stripe_subscription_status === 'active' ? (
                        <button className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors">
                            Manage Subscription
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-500">
                                Unlock Pro features including 10 products, 6% fees, and the Mini-site editor.
                            </p>
                            <Link 
                                href="/pricing"
                                className="w-full text-center py-3 px-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                            >
                                Upgrade Now <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
