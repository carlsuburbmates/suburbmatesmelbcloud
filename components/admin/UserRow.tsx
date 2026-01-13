'use client';

import { toggleBanUser, toggleDelistUser, evictUser } from '@/app/actions/admin-users';
import { useState } from 'react';
import { Ban, CheckCircle, Smartphone, AlertOctagon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function UserRow({ user }: { user: any }) {
    const [loading, setLoading] = useState(false);

    const handleToggleBan = async () => {
        const action = user.is_suspended ? 'Unban' : 'Ban';
        const confirmMsg = user.is_suspended 
            ? `Are you sure you want to restore access for ${user.full_name || user.email}?`
            : `Are you sure you want to SUSPEND ${user.full_name || user.email}? They will lose access immediately.`;

        if (!confirm(confirmMsg)) return;

        setLoading(true);
        try {
            await toggleBanUser(user.id, !user.is_suspended);
            toast.success(`User ${action}ned successfully.`);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelist = async () => {
        if (!confirm(`Are you sure you want to ${user.is_delisted ? 're-list' : 'DELIST'} this user from search results?`)) return;
        setLoading(true);
        try {
            await toggleDelistUser(user.id, !user.is_delisted);
            toast.success(user.is_delisted ? 'User Re-listed' : 'User Delisted');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEvict = async () => {
        const email = prompt(`To EVICT ${user.email}, please type their email address to confirm.\nWARNING: This is permanent and deletes all data.`);
        if (email !== user.email) return toast.error('Email mismatch. Eviction cancelled.');

        setLoading(true);
        try {
            await evictUser(user.id);
            toast.success('User Evicted and Data Wiped');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            user.full_name?.charAt(0) || user.email?.charAt(0) || '?'
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900">{user.full_name || 'Anonymous'}</div>
                        <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    user.role === 'operator' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'creator' ? 'bg-blue-50 text-blue-600' :
                    'bg-slate-100 text-slate-500'
                }`}>
                    {user.role}
                </span>
            </td>
            <td className="px-6 py-4">
                 {user.is_suspended ? (
                    <span className="flex items-center gap-1 text-red-600 font-bold text-xs uppercase">
                        <Ban className="w-3 h-3" /> Suspended
                    </span>
                 ) : (
                    <span className="flex items-center gap-1 text-green-600 font-bold text-xs uppercase">
                        <CheckCircle className="w-3 h-3" /> Active
                    </span>
                 )}
            </td>
             <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                 <button
                    onClick={handleToggleBan}
                    disabled={loading || user.role === 'operator'} 
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        user.is_suspended 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600'
                    } ${user.role === 'operator' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={user.is_suspended ? "Unban User" : "Ban User Access"}
                 >
                     {user.is_suspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                 </button>

                 <button
                    onClick={handleDelist}
                    disabled={loading || user.role === 'operator'}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        user.is_delisted
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-600'
                    }`}
                    title={user.is_delisted ? "Re-list in Search" : "Delist from Search"}
                 >
                     <AlertOctagon className="w-4 h-4" />
                 </button>

                 <button
                    onClick={handleEvict}
                    disabled={loading || user.role === 'operator'}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white transition-colors"
                    title="Evict (Permanent Delete)"
                 >
                     <Trash2 className="w-4 h-4" />
                 </button>
            </td>
        </tr>
    );
}
