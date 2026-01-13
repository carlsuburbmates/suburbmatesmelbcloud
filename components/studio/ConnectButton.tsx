'use client';

import { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface ConnectButtonProps {
    isConnected: boolean;
    className?: string;
}

export function ConnectButton({ isConnected, className }: ConnectButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/stripe/connect', {
                method: 'POST',
            });

            if (!response.ok) throw new Error('Failed to initiate connection');

            const { url } = await response.json();
            window.location.href = url; // Redirect to Stripe
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    if (isConnected) {
        return (
            <button 
                onClick={handleConnect}
                disabled={loading}
                className={`bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-green-200 transition-colors ${className}`}
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-2 h-2 bg-green-500 rounded-full" />}
                Payouts Active (Manage)
            </button>
        );
    }

    return (
        <button
            onClick={handleConnect}
            disabled={loading}
            className={`bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl ${className}`}
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Connect Payouts'}
            {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
    );
}
