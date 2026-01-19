'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Lock, AlertCircle, CreditCard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  id: string;
  product_id: string;
  listing_id: string | null;
  product_name: string | null;
  product_price_cents: number;
  quantity: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function fetchCart() {
      const response = await fetch('/api/cart', {
        method: 'GET',
      });

      if (!response.ok) {
        console.error('Failed to fetch cart:', await response.text());
        return;
      }

      const data = await response.json();
      setCart(data);
      setLoading(false);
    }

    fetchCart();
  }, []);

  const total = cart.reduce((sum, item) => sum + (item.product_price_cents * item.quantity), 0);
  const totalDollars = total / 100;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Please add items before proceeding to checkout.');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center">
          <div className="h-3 w-3 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ShoppingBag className="w-4 h-4" />
          Back to Marketplace
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 border border-gray-200">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Browse the marketplace to add products to your cart before proceeding to checkout.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-8 h-8 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Secure Checkout</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <p className="text-gray-600">
                      <span className="font-medium">{cart.length}</span> {cart.length === 1 ? 'item' : 'items'}
                    </p>
                    <p className="text-sm text-gray-500">Subtotal</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(total / 100).toFixed(2)}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-6">
                  <p className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>All payments are processed securely by Stripe. Your card information is never stored on our servers.</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || processing}
                className="w-full bg-black text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="inline-flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div>
                      <span>Processing...</span>
                    </div>
                  </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pay {(total / 100).toFixed(2)}</span>
                    </>
                  )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
