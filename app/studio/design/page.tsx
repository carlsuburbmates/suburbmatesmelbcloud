import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { VibeTuner } from '@/components/studio/VibeTuner';
import { Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DesignPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    const { data: listing } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', user.id)
        .single();
    
    if (!listing) redirect('/');

    if (listing.tier !== 'Pro') {
        return (
            <div className="max-w-2xl mx-auto text-center py-20 px-6">
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Unlock Design Studio</h1>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    Customize your mini-site with premium themes, custom colours, and your own domain slug (e.g. /u/your-name).
                </p>
                <a href="/pricing" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                    Upgrade to Pro ($29/mo)
                </a>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    Design Studio <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </h1>
                <p className="text-slate-500 mt-2">Customize how your business appears on your dedicated Mini-site.</p>
            </header>

            <VibeTuner listingId={listing.id} initialData={listing} />
        </div>
    );
}
