import { createClient } from '@/utils/supabase/server';
import { UserRow } from '@/components/admin/UserRow';
import { ShieldAlert, Users as UsersIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const supabase = await createClient();
    
    // Fetch latest users
    const { data: users } = await supabase
        .from('users_public')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    return (
        <div className="max-w-5xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500">View registered users and manage access.</p>
                </div>
                <div className="bg-slate-200 px-4 py-2 rounded-full font-mono text-sm font-bold text-slate-700">
                    {users?.length || 0} Recent
                </div>
            </header>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-700 text-sm">User</th>
                            <th className="px-6 py-4 font-bold text-slate-700 text-sm">Role</th>
                            <th className="px-6 py-4 font-bold text-slate-700 text-sm">Status</th>
                            <th className="px-6 py-4 font-bold text-slate-700 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                         {users?.map((user) => (
                             <UserRow key={user.id} user={user} />
                         ))}
                    </tbody>
                </table>
                 {(!users || users.length === 0) && (
                    <div className="p-12 text-center text-slate-400">
                        No users found.
                    </div>
                )}
            </div>
        </div>
    );
}
