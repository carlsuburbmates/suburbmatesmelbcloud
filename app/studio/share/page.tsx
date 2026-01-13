import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Copy, Link as LinkIcon, Download, Zap, Lock } from 'lucide-react';
import Link from 'next/link';

export default async function ShareKitPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    const { data: listingData } = await supabase
        .from('listings')
        .select('*, products(*)')
        .eq('owner_id', user.id)
        .single();

    if (!listingData) redirect('/');

    const isPro = listingData.tier === 'Pro';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://suburbmates.com';
    const publicUrl = `${baseUrl}/listing/${listingData.slug || listingData.id}`;
    
    // QR Code URL (using a free service)
    const qrUrl = (content: string) => `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(content)}`;

    return (
        <div className="max-w-5xl mx-auto py-8 px-6">
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-semibold text-ink tracking-tight font-sans">Share Kit</h1>
                    {!isPro && <Badge variant="secondary">Pro Feature</Badge>}
                </div>
                <p className="text-ink-muted text-lg">Tools to grow your audience and drive traffic to your studio.</p>
            </header>

            {!isPro ? (
                <Card className="bg-slate-50 border-dashed border-2">
                    <CardContent className="flex flex-col items-center py-12 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                            <Lock className="w-8 h-8 text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-ink mb-2">Upgrade to Pro</h2>
                        <p className="text-ink-muted max-w-md mb-8">
                            Unlock your high-resolution QR codes, campaign links, and deep product sharing tools.
                        </p>
                        <Button asChild className="bg-ink hover:bg-slate-800 text-white px-8 h-12 rounded-xl">
                            <Link href="/studio/billing">View Pro Plans</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Studio Link */}
                    <div className="md:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Your Studio Link</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-canvas rounded-2xl border border-line">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-ink flex-shrink-0 shadow-sm border border-line">
                                        <LinkIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-0.5">Public URL</p>
                                        <p className="text-sm font-mono truncate">{publicUrl}</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50">
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                                        <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-sm border border-slate-200 mb-4">
                                            <img src={qrUrl(publicUrl)} alt="Studio QR Code" className="w-full h-full" />
                                        </div>
                                        <Button variant="ghost" size="sm" className="w-full text-ink-muted">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download PNG
                                        </Button>
                                    </div>
                                    <div className="p-6 flex flex-col justify-center gap-4">
                                        <h4 className="font-bold text-ink">Campaign Link</h4>
                                        <p className="text-xs text-ink-muted leading-relaxed">
                                            Use this link for Instagram/TikTok bios to track traffic and present a premium mobile-first interface.
                                        </p>
                                        <Button className="w-full bg-slate-900 text-white rounded-xl">
                                            Generate Campaign Link
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Product Deep Links */}
                        <section>
                            <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
                                Product Deep Links
                                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">
                                    {listingData.products?.length || 0}
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {listingData.products?.map((product: any) => {
                                    const productLink = `${baseUrl}/product/${product.id}`;
                                    return (
                                        <Card key={product.id} className="hover:border-ink transition-colors group">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-canvas p-1 rounded-lg border border-line flex-shrink-0">
                                                        <img src={qrUrl(productLink)} alt={product.name} className="w-full h-full" />
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <h5 className="font-bold text-ink text-sm truncate">{product.name}</h5>
                                                        <p className="text-[10px] text-ink-muted font-mono truncate">{productLink}</p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-ink group-hover:text-white transition-colors">
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Pro Tips */}
                    <div className="space-y-6">
                         <div className="bg-ink p-6 rounded-3xl text-white">
                            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-yellow-900 mb-6 shadow-lg shadow-gold/20">
                                <Zap className="w-6 h-6 fill-current" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Pro Strategies</h3>
                            <ul className="space-y-4">
                                <li className="text-sm text-slate-300 leading-relaxed">
                                    <strong className="text-white">Physical Signage:</strong> Print your Studio QR code on business cards or checkout counters.
                                </li>
                                <li className="text-sm text-slate-300 leading-relaxed">
                                    <strong className="text-white">Direct-to-Service:</strong> Send product deep links directly via SMS or DM to close sales faster.
                                </li>
                                <li className="text-sm text-slate-300 leading-relaxed">
                                    <strong className="text-white">Social Tracking:</strong> Our campaign links automatically include metadata for better analytics.
                                </li>
                            </ul>
                        </div>

                        <div className="border border-line rounded-3xl p-6 bg-canvas">
                            <h3 className="font-bold text-ink mb-4">Marketing Standards</h3>
                            <p className="text-xs text-ink-muted leading-relaxed">
                                All Share Kit assets adhere to the SuburbMates High-Credibility standard. QR codes are high-correction and scannable under low light.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
