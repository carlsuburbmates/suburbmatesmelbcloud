import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { calculateLifecycle } from '@/lib/studio/lifecycle';
import { CheckoutButton } from '@/components/marketing/CheckoutButton';
import { Lock, Star, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function PromotePage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
    const supabase = await createClient();
    const { success } = await searchParams;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    // 1. Fetch Listing & Products to calculate lifecycle
    const { data: listing } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', user.id)
        .single();
    
    if (!listing) redirect('/studio/onboarding/new');

    const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', listing.id);

    const lifecycle = calculateLifecycle(listing, productCount || 0);
    const isS2OrHigher = ['S2', 'S3'].includes(lifecycle.stage);
    
    const FEATURED_PRICE_ID = process.env.STRIPE_PRICE_ID_FEATURED || 'price_featured_placeholder';

    // 2. Check Availability via RPC (SSOT)
    const { data: availability } = await supabase.rpc('check_featured_availability', { 
        council_text: listing.location 
    });

    // Handle RPC response which might be an array or object depending on generated types
    // Based on migration: returns TABLE(total_count bigint, pending_count bigint, next_available_date timestamptz)
    // Supabase JS often returns array for table functions.
    const statusData = Array.isArray(availability) ? availability[0] : availability;
    
    // Fallback safe values
    const isFull = (statusData?.total_count || 0) >= 5;
    const nextAvailableDate = statusData?.next_available_date ? new Date(statusData.next_available_date) : null;
    
    // Calculate estimated wait days if full
    let waitDays = 0;
    if (isFull && nextAvailableDate) {
        const diffTime = Math.abs(nextAvailableDate.getTime() - new Date().getTime());
        waitDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    }

    // 3. Check if ALREADY active or pending
    const { data: currentRequest } = await supabase
        .from('featured_queue')
        .select('*')
        .eq('listing_id', listing.id)
        .in('status', ['active', 'pending'])
        .maybeSingle();

    return (
        <div className="max-w-4xl mx-auto p-6 md:py-12">
            <div className="mb-12 text-center">
                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Featured Placement</h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                    Secure the absolute top spot for your Council area ({listing.location}).
                </p>
            </div>

            {success && (
                <div className="mb-8 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center justify-center gap-2 max-w-xl mx-auto">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <strong>Success!</strong> Your reservation has been placed.
                </div>
            )}

            <div className={`
                relative bg-white border rounded-3xl overflow-hidden shadow-xl
                ${!isS2OrHigher ? 'border-slate-200' : 'border-gold ring-1 ring-gold/20'}
            `}>
                
                {/* Visual Header */}
                <div className="h-32 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                     <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800" />
                     <Star className="w-16 h-16 text-gold fill-gold relative z-10 animate-pulse-slow" />
                </div>

                <div className="p-8 md:p-12">
                     {/* GATED STATE: S1 or lower */}
                    {!isS2OrHigher ? (
                        <div className="text-center">
                             <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-6 text-slate-400">
                                <Lock className="w-8 h-8" />
                             </div>
                             <h2 className="text-2xl font-bold text-slate-900 mb-4">Optimisation Required</h2>
                             <p className="text-slate-600 mb-8 max-w-md mx-auto">
                                To ensure quality, only <strong>Optimised Studios (S2)</strong> can purchase featured placements. 
                                You currently have missing criteria.
                             </p>
                             
                             <div className="bg-slate-50 rounded-xl p-6 text-left max-w-md mx-auto mb-8">
                                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-4">Requirements Checklist</h3>
                                <ul className="space-y-3">
                                    {lifecycle.missing.map((item) => (
                                        <li key={item} className="flex items-start gap-3 text-sm text-red-600 font-medium">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                             </div>

                             <Link href="/studio" className="inline-block px-6 py-3 bg-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-300 transition-colors">
                                Return to Studio to Fix
                             </Link>
                        </div>
                    ) : (
                        <div>
                             {/* ALREADY ACTIVE / PENDING */}
                             {currentRequest ? (
                                <div className="text-center">
                                     <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
                                        <CheckCircle className="w-8 h-8" />
                                     </div>
                                     <h2 className="text-2xl font-bold text-slate-900 mb-2">You are Active</h2>
                                     <p className="text-slate-600 mb-8">
                                        Your placement for <strong>{listing.location}</strong> is currently 
                                        <span className="inline-block ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold uppercase rounded">
                                            {currentRequest.status}
                                        </span>
                                     </p>
                                      <Link href="/studio" className="inline-block px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                        Back to Dashboard
                                     </Link>
                                </div>
                             ) : (
                                 /* ELIGIBLE TO BUY */
                                 <div className="grid md:grid-cols-2 gap-12 items-center">
                                    <div>
                                        <div className="inline-block px-3 py-1 bg-gold/10 text-yellow-700 text-xs font-bold uppercase rounded-full mb-4">
                                            High Demand
                                        </div>
                                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                            {isFull ? 'Join the Waitlist' : 'Claim Your Spot'}
                                        </h2>
                                        <p className="text-lg text-slate-600 mb-6">
                                            {isFull 
                                              ? `The 5 slots for ${listing.location} are currently full. Purchase a reservation to be next in line.`
                                              : `There is an open slot in ${listing.location}. Your card will appear at the top of search immediately.`
                                            }
                                        </p>
                                        <ul className="space-y-4">
                                            <li className="flex items-center gap-3 text-slate-700 font-medium">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                Largest Card Size (Double Height)
                                            </li>
                                            <li className="flex items-center gap-3 text-slate-700 font-medium">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                Absolute Top Ranking
                                            </li>
                                            <li className="flex items-center gap-3 text-slate-700 font-medium">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                Exclusive "Featured" Label
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
                                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Price</div>
                                        <div className="text-5xl font-black text-slate-900 mb-2">$15</div>
                                        <div className="text-slate-400 text-sm mb-8">per 30 days (non-recurring)</div>

                                        {isFull && nextAvailableDate && (
                                            <div className="mb-6 bg-blue-50 text-blue-700 p-3 rounded-lg text-sm flex items-center justify-center gap-2 font-medium">
                                                <Clock className="w-4 h-4" />
                                                Scheduled to start: {nextAvailableDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                                            </div>
                                        )}

                                        <CheckoutButton 
                                            priceId={FEATURED_PRICE_ID} 
                                            isLoggedIn={true} 
                                        />
                                        <p className="text-xs text-slate-400 mt-4">
                                            {isFull ? 'You will be charged now to reserve your spot.' : 'Placement activates immediately after payment.'}
                                        </p>
                                    </div>
                                 </div>
                             )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
