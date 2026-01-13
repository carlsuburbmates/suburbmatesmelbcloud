import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { 
    LayoutDashboard, 
    Store, 
    Package, 
    Palette, 
    ShieldCheck, 
    Zap, 
    ChevronRight,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { calculateStage, getNextAction } from '@/lib/studio-logic';

export const dynamic = 'force-dynamic';

export default async function StudioDashboard({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    const { data: listing } = await supabase
        .from('listings')
        .select(`
            *,
            category:categories(name),
            products(count)
        `)
        .eq('owner_id', user.id)
        .single();

    if (!listing) redirect('/');

    const onboardingSuccess = params.onboarding === 'success';
    // Cast to any to satisfy TS for the join property
    const productCount = (listing.products as any)?.[0]?.count || 0;
    
    // Calculate Lifecycle Stage
    const stage = calculateStage(listing as any);
    const nextAction = getNextAction(stage, listing.id);

    return (
        <div className="max-w-5xl mx-auto py-8 px-6">
            {onboardingSuccess && (
                <div className="mb-8 p-6 bg-green-50 border border-green-100 rounded-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-green-900 uppercase tracking-wide">Successfully Published</h2>
                        <p className="text-sm text-green-700 mt-1">Your Studio Page is now live on SuburbMates.</p>
                    </div>
                </div>
            )}

            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-semibold text-ink tracking-tight font-sans">Studio Dashboard</h1>
                    <p className="text-ink-muted mt-2 text-lg">Manage your presence and growth.</p>
                </div>
                
                {/* Dynamic Next Action Banner */}
                {nextAction && (
                    <Link href={nextAction.href}>
                        <div className="bg-ink text-white pl-6 pr-4 py-3 rounded-full flex items-center gap-4 hover:shadow-lg transition-all group">
                             <div className="flex flex-col">
                                 <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Next Step</span>
                                 <span className="font-bold whitespace-nowrap">{nextAction.label}</span>
                             </div>
                             <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                 <ArrowRight className="w-4 h-4" />
                             </div>
                        </div>
                    </Link>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Status Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <h3 className="text-xs font-bold text-ink-muted uppercase tracking-widest">Listing Status</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${listing.status === 'active' ? 'bg-verified' : 'bg-amber-500'}`} />
                            <span className="text-xl font-bold text-ink capitalize tracking-tight">{listing.status}</span>
                        </div>
                        <p className="text-xs text-ink-muted mt-2">
                            {listing.status === 'active' ? 'Visible to customers' : 'Awaiting operator review'}
                        </p>
                    </CardContent>
                </Card>

                {/* Tier Card */}
                <Card className={listing.tier === 'Pro' ? 'bg-ink border-ink text-white' : ''}>
                    <CardHeader className="pb-2">
                        <h3 className={`text-xs font-bold uppercase tracking-widest ${listing.tier === 'Pro' ? 'text-slate-400' : 'text-ink-muted'}`}>Current Tier</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            {listing.tier === 'Pro' ? <Zap className="w-5 h-5 text-gold fill-gold" /> : <ShieldCheck className="w-5 h-5 text-ink-muted" />}
                            <span className={`text-xl font-bold capitalize tracking-tight ${listing.tier === 'Pro' ? 'text-white' : 'text-ink'}`}>{listing.tier}</span>
                        </div>
                        {listing.tier !== 'Pro' && (
                            <Link href="/pricing" className="text-xs text-blue-600 font-bold mt-2 block hover:underline">
                                Upgrade to Pro &rarr;
                            </Link>
                        )}
                    </CardContent>
                </Card>

                {/* Product Stats */}
                <Card>
                    <CardHeader className="pb-2">
                         <h3 className="text-xs font-bold text-ink-muted uppercase tracking-widest">Collection</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-ink-muted" />
                            <span className="text-xl font-bold text-ink tracking-tight">{productCount} Products</span>
                        </div>
                        <Link href="/studio/products" className="text-xs text-blue-600 font-bold mt-2 block hover:underline">
                            Manage products &rarr;
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Actions Column */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-ink tracking-tight font-sans">Manage Experience</h2>
                    
                    <Link href="/studio/details">
                        <Card className="hover:border-ink transition-colors cursor-pointer group mb-4">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-canvas rounded-lg flex items-center justify-center text-ink-muted group-hover:bg-ink group-hover:text-white transition-colors">
                                        <Store className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-ink text-sm">Edit Listing Details</h4>
                                        <p className="text-xs text-ink-muted mt-0.5">Update your bio, contact info, and category.</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-ink transition-colors" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/studio/design">
                        <Card className="hover:border-ink transition-colors cursor-pointer group">
                             <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-canvas rounded-lg flex items-center justify-center text-ink-muted group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <Palette className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-ink text-sm">Design Studio</h4>
                                        <p className="text-xs text-ink-muted mt-0.5">Customize your Mini-site vibe and social links.</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-ink transition-colors" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/studio/promote">
                        <Card className="hover:border-gold transition-colors cursor-pointer group">
                             <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-canvas rounded-lg flex items-center justify-center text-ink-muted group-hover:bg-gold group-hover:text-yellow-900 transition-colors">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-ink text-sm">Promote Listing</h4>
                                        <p className="text-xs text-ink-muted mt-0.5">Get featured in {listing.location} search results.</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-ink transition-colors" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/studio/share">
                        <Card className="hover:border-ink transition-colors cursor-pointer group">
                             <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-canvas rounded-lg flex items-center justify-center text-ink-muted group-hover:bg-ink group-hover:text-white transition-colors">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-ink text-sm">Share Kit (Pro)</h4>
                                        <p className="text-xs text-ink-muted mt-0.5">Get QR codes, deep links, and social assets.</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-ink transition-colors" />
                            </div>
                        </Card>
                    </Link>
                </div>

                {/* Info / Support Column */}
                <div className="bg-slate-50 p-8 rounded-xl border border-line">
                    <h2 className="text-lg font-bold text-ink mb-6 tracking-tight font-sans">Creator Guidelines</h2>
                    <ul className="space-y-4">
                        <li className="flex gap-4">
                            <div className="w-5 h-5 rounded-full bg-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm border border-slate-200">1</div>
                            <p className="text-sm text-ink-muted leading-relaxed">
                                <strong className="text-ink">Truth UI:</strong> SuburbMates prioritizes credible signals. Keep your description honest and verifiable.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <div className="w-5 h-5 rounded-full bg-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm border border-slate-200">2</div>
                            <p className="text-sm text-ink-muted leading-relaxed">
                                <strong className="text-ink">Payments:</strong> All transactions are settled directly into your Stripe account. SuburbMates does not hold your funds.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <div className="w-5 h-5 rounded-full bg-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm border border-slate-200">3</div>
                            <p className="text-sm text-ink-muted leading-relaxed">
                                <strong className="text-ink">Support:</strong> You are responsible for fulfillment and customer support of your products.
                            </p>
                        </li>
                    </ul>
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <Link href="/trust" className="text-xs font-bold text-ink hover:underline flex items-center gap-1">
                            View the Trust Center &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
