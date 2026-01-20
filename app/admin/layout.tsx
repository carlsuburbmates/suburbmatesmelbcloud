import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ListFilter, Users, LayoutDashboard, LogOut, History, AlertTriangle, Star, DollarSign } from 'lucide-react';
import Copilot from "@/components/admin/Copilot";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    // Role Check
    const { data: profile } = await supabase
        .from('users_public')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'operator') {
        redirect('/'); // Strict Redirect 
    }

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed inset-y-0 left-0 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        <ShieldCheck className="w-6 h-6 text-red-500" />
                         <span>God Mode</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-1">OPERATOR ACCESS</div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Overview
                    </Link>
                    <Link href="/admin/triage" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <ListFilter className="w-5 h-5" />
                        Triage Queue
                    </Link>
                    <Link href="/admin/featured" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <Star className="w-5 h-5" />
                        Featured Queue
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <Users className="w-5 h-5" />
                        User Management
                    </Link>
                    <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <DollarSign className="w-5 h-5" />
                        Orders & Payouts
                    </Link>
                    <Link href="/admin/reports" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <AlertTriangle className="w-5 h-5" />
                        User Reports
                    </Link>
                    <Link href="/admin/audit" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <History className="w-5 h-5" />
                        Audit Logs
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <form action="/auth/signout" method="post">
                        <button className="flex w-full items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors">
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>

            {/* AI Copilot Widget */}
            <Copilot />
        </div>
    );
}
