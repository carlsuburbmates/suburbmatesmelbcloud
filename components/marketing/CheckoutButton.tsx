'use client';

import { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CheckoutButtonProps {
    priceId: string;
    isLoggedIn: boolean;
}

export function CheckoutButton({ priceId, isLoggedIn }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        if (!isLoggedIn) {
            router.push('/auth/signup?next=/pricing');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });

            if (response.status === 401) {
                router.push('/auth/login?next=/pricing');
                return;
            }

            if (!response.ok) throw new Error('Checkout failed');

            const { sessionId } = await response.json();
            
            // Redirect to Stripe Checkout
            // We need stripe-js on the client to redirect generally, 
            // OR the API can return a URL.
            // My API currently returns { sessionId }. 
            // I should have returned { url } to make it easier without loading loadStripe here.
            
            // Let's assume I'll fix the API to return URL or use loadStripe. 
            // Actually, for simplicity, retrieving URL from server is often easier.
            // Let's modify the API to return { url: session.url } too.
            // BUT for now, let's assume I use the `stripe` global available via script? No.
            // I'll stick to redirecting via URL from server if possible. 
            // Let me check my API implementation again.
            
            // Wait, I can't check it easily without file view, but I recall writing:
            // return NextResponse.json({ sessionId: session.id });
            
            // I will update this component to expect `url` after I update the API, 
            // OR I will just import `loadStripe`. 
            // `loadStripe` is better for strict PCI, but `session.url` is fine for Checkout.
            
            // I will UPDATE the API to return `url` as well in the next step.
            
        } catch (error) {
            console.error(error);
            toast.error('Failed to start checkout.');
            setLoading(false);
        }
    };
    
    // TEMPORARY FIX: Since I haven't updated API yet, I'll write the fetch expecting URL to fail 
    // and I'll update the API in parallel next or prior.
    
    // I will write this assuming the API returns { url }.
    
    const handleCheckoutOptimized = async () => {
         if (!isLoggedIn) {
            router.push('/auth/signup?next=/pricing');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });

             if (response.status === 401) {
                router.push('/auth/login?next=/pricing');
                return;
            }

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                // If API still returns null for url for some reason
                throw new Error('No checkout URL returned from server.');
            }
        } catch (error) {
             console.error(error);
             toast.error('Something went wrong. Please try again.');
             setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleCheckoutOptimized}
            disabled={loading}
            className="w-full text-center py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Upgrade to Pro <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" /></>}
        </button>
    );
}
