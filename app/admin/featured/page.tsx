import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BadgeCheck, Clock, Calendar, AlertCircle } from 'lucide-react';

export const metadata = {
    title: 'Featured Queue | Admin',
};

export default async function FeaturedQueuePage() {
    const supabase = await createClient();

    // 1. Auth Check (Redundant if layout handles it, but safe)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    // 2. Fetch Queue Data
    const { data: queueItems, error } = await supabase
        .from('featured_queue')
        .select(`
            id,
            status,
            requested_at,
            promoted_at,
            expires_at,
            listing_id,
            listings (
                name,
                slug,
                tier,
                location
            )
        `)
        .order('status', { ascending: true }) // Active first (a-z)? No, let's sort logically below or via JS if complex.
        .order('requested_at', { ascending: true });

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <div>
                    <h3 className="font-semibold">Error fetching queue</h3>
                    <p className="text-sm">{error.message}</p>
                </div>
            </div>
        );
    }

    // Separate Active vs Waiting
    const active = queueItems?.filter(q => q.status === 'active') || [];
    const waiting = queueItems?.filter(q => q.status === 'waiting') || [];
    const history = queueItems?.filter(q => ['expired', 'completed'].includes(q.status)) || [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Featured Placement Queue</h1>
                <p className="text-slate-500 mt-2">Manage the FIFO queue for the homepage "Featured" slots.</p>
            </div>

            {/* Active Slots */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-amber-50/50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                             <BadgeCheck className="w-5 h-5 text-amber-600" />
                             Active Deployments
                        </h2>
                        <span className="text-xs font-mono bg-amber-100 text-amber-700 px-2 py-1 rounded">
                            {active.length} / 4 SLOTS
                        </span>
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {active.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            No listings currently active. Run the cron job to rotate the queue.
                        </div>
                    ) : (
                        active.map((item: any) => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-bold">
                                        F
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">
                                            {item.listings?.name || 'Unknown Listing'}
                                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">
                                                {item.listings?.tier}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono">
                                            {item.listings?.location} • ID: {item.listing_id.split('-')[0]}...
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right text-sm">
                                    <div className="text-slate-900 font-medium flex items-center justify-end gap-1">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        Expires {new Date(item.expires_at).toLocaleDateString()}
                                    </div>
                                    <div className="text-slate-500 text-xs">
                                        Promoted {new Date(item.promoted_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Waitlist */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                         <Calendar className="w-5 h-5 text-slate-500" />
                         Waitlist (FIFO)
                    </h2>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="py-3 px-6">Position</th>
                            <th className="py-3 px-6">Listing</th>
                            <th className="py-3 px-6">Requested At</th>
                            <th className="py-3 px-6">Tier</th>
                            <th className="py-3 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {waiting.length === 0 ? (
                             <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-400">
                                    Queue is empty. No one is waiting.
                                </td>
                             </tr>
                        ) : (
                            waiting.map((item: any, index: number) => (
                                <tr key={item.id} className="hover:bg-slate-50 group">
                                    <td className="py-3 px-6 font-mono text-slate-400">
                                        #{index + 1}
                                    </td>
                                    <td className="py-3 px-6">
                                        <div className="font-medium text-slate-900">
                                            {item.listings?.name}
                                        </div>
                                        <Link href={`/directory/listing/${item.listings?.slug}`} target="_blank" className="text-xs text-blue-600 hover:underline">
                                            View Listing
                                        </Link>
                                    </td>
                                    <td className="py-3 px-6 text-slate-500">
                                        {new Date(item.requested_at).toLocaleDateString()}
                                        <div className="text-xs opacity-50">{new Date(item.requested_at).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="py-3 px-6">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                            item.listings?.tier === 'Pro' 
                                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                            {item.listings?.tier || 'Basic'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-right">
                                        {/* Future actions could go here */}
                                        <span className="text-slate-400 text-xs italic">Auto-managed by Cron</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
