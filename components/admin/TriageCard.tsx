'use client';

import { approveListing, flagListing } from '@/app/actions/admin-triage';
import { useState } from 'react';
import { Check, X, AlertTriangle, ExternalLink, Sparkles, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export function TriageCard({ listing }: { listing: any }) {
    const [loading, setLoading] = useState(false);

    const handleApprove = async () => {
        setLoading(true);
        try {
            await approveListing(listing.id);
            toast.success('Listing Approved');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFlag = async () => {
        const reason = prompt('Reason for flagging (e.g., "Inappropriate content"):');
        if (!reason) return;

        setLoading(true);
        try {
            await flagListing(listing.id, reason);
            toast.success('Listing Flagged');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{listing.name}</h3>
                    <div className="flex gap-2">
                        {listing.abn && <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded uppercase">ABN: {listing.abn}</span>}
                        <div className="flex items-center gap-1 group relative cursor-help">
                            <span className={`px-2 py-1 text-xs font-bold rounded uppercase flex items-center gap-1 ${
                                listing.triage_reason?.includes('High') ? 'bg-red-50 text-red-600' :
                                listing.triage_reason?.includes('Medium') ? 'bg-orange-50 text-orange-600' :
                                'bg-yellow-50 text-yellow-600'
                            }`}>
                                <Brain className="w-3 h-3" />
                                AI: {listing.triage_reason || 'Pending Review'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <p className="text-slate-600 mb-4 line-clamp-2">{listing.description}</p>
                
                <div className="flex gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">📍 {listing.location}</div>
                    {listing.website && <div className="flex items-center gap-1">🌐 {listing.website}</div>}
                    <Link href={`/listing/${listing.id}`} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                        View Public <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                <button
                    onClick={handleApprove}
                    disabled={loading}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Check className="w-4 h-4" />
                    Safe
                </button>
                <button
                    onClick={handleFlag}
                    disabled={loading}
                    className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                >
                    <X className="w-4 h-4" />
                    Flag
                </button>
            </div>
        </div>
    );
}
