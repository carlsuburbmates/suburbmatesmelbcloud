import { createClient } from '@/utils/supabase/server';
import { ChevronRight, AlertCircle, Users, Activity } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // 1. Fetch Stats Parallel
    const [triageRes, usersRes, activeRes] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact' }).eq('triage_status', 'pending'),
        supabase.from('users_public').select('id', { count: 'exact' }),
        supabase.from('listings').select('id', { count: 'exact' }).eq('status', 'claimed'),
    ]);

    const pendingCount = triageRes.count || 0;
    const totalUsers = usersRes.count || 0;
    const activeListings = activeRes.count || 0;

    const hasUrgentTasks = pendingCount > 0;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Operator Control Center</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Triage Card - Evaluated based on urgency */}
                <div className={`p-6 rounded-2xl shadow-sm border transition-all ${
                    hasUrgentTasks 
                        ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-200' 
                        : 'bg-white border-slate-200'
                }`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className={`text-sm font-bold uppercase mb-2 ${
                                hasUrgentTasks ? 'text-amber-700' : 'text-slate-500'
                            }`}>
                                Pending Triage
                            </h3>
                            <div className="text-4xl font-black text-slate-900">{pendingCount}</div>
                            <div className={`text-sm mt-2 ${
                                hasUrgentTasks ? 'text-amber-600 font-medium' : 'text-slate-400'
                            }`}>
                                {hasUrgentTasks ? 'Requires Attention' : 'All caught up'}
                            </div>
                        </div>
                        {hasUrgentTasks ? (
                             <AlertCircle className="text-amber-500 w-6 h-6" />
                        ) : (
                             <Activity className="text-slate-300 w-6 h-6" />
                        )}
                    </div>
                    
                    {hasUrgentTasks && (
                        <div className="mt-6">
                            <Link href="/admin/triage" className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                                Review Queue
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Total Users</h3>
                            <div className="text-4xl font-black text-slate-900">{totalUsers}</div>
                            <div className="text-sm text-slate-400 mt-2">Registered accounts</div>
                        </div>
                        <Users className="text-slate-300 w-6 h-6" />
                    </div>
                </div>
                
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Active Listings</h3>
                            <div className="text-4xl font-black text-slate-900">{activeListings}</div>
                            <div className="text-sm text-slate-400 mt-2">Live on platform</div>
                        </div>
                         <Activity className="text-green-500 w-6 h-6" />
                    </div>
                </div>
            </div>
            
             <div className="mt-12 p-8 bg-blue-50 border border-blue-100 rounded-2xl">
                <h2 className="text-xl font-bold text-blue-900 mb-2">Welcome, Operator</h2>
                <p className="text-blue-700 max-w-2xl text-lg leading-relaxed">
                   Your <strong>Copilot</strong> is capable of analyzing specific trends or drafting communications. 
                   Just ask: <em className="bg-blue-100 px-1 rounded text-blue-800">"What is the status?"</em> or <em className="bg-blue-100 px-1 rounded text-blue-800">"Draft a welcome email."</em>
                </p>
            </div>
        </div>
    );
}
