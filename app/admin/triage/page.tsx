import { createClient } from '@/utils/supabase/server';
import { approveListing, flagListing } from '@/app/actions/admin-triage';
import { BadgeCheck, Ban, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TriagePage() {
    const supabase = await createClient();
    
    // Fetch pending listings
    const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('triage_status', 'pending')
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-5xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Triage Queue</h1>
                    <p className="text-slate-500">Review content flagged by AI or new submissions.</p>
                </div>
                <div className="bg-slate-200 px-4 py-2 rounded-full font-mono text-sm font-bold text-slate-700">
                    {listings?.length || 0} Pending
                </div>
            </header>

            <div className="space-y-4">
                {listings?.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                        <BadgeCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">All Clear</h3>
                        <p className="text-slate-500">No listings require triage.</p>
                    </div>
                ) : (
                    listings?.map((listing) => (
                        <TriageCard key={listing.id} listing={listing} />
                    ))
                )}
            </div>
        </div>
    );
}

// Client Component for the Card Actions to keep the page Server-Side
import { TriageCard } from '@/components/admin/TriageCard';
