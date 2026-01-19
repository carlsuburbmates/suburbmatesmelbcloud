'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
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

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleRemove = async (itemId: string) => {
    const formData = new FormData();
    formData.append('cartItemId', itemId);

    const response = await fetch('/api/cart', {
      method: 'DELETE',
      body: formData,
    });

    if (!response.ok) {
      console.error('Failed to remove item:', await response.text());
      return;
    }

    setCart(cart.filter(item => item.id !== itemId));
  };

  const handleQuantityUpdate = async (itemId: string, quantity: number) => {
    const formData = new FormData();
    formData.append('cartItemId', itemId);
    formData.append('quantity', quantity.toString());

    const response = await fetch('/api/cart', {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      console.error('Failed to update quantity:', await response.text());
      return;
    }

    setCart(cart.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const total = cart.reduce((sum, item) => sum + (item.product_price_cents * item.quantity), 0);
  const totalDollars = total / 100;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse h-8 flex items-center justify-center">
          <div className="h-16 w-16 border-4 border-gray-200 border-t-gray-200 rounded-full">
            <div className="animate-pulse bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center">
              <div className="h-3 w-3 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Browse the marketplace to add items to your cart.
          </p>
          <Link 
            href="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </p>
              <button
                onClick={() => setCart([])}
                className="text-red-600 hover:text-red-700 transition-colors font-semibold px-4 py-2 rounded-lg border border-red-200"
              >
                Clear Cart
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex gap-4">
                  {item.image_url ? (
                    <img 
                      src={item.image_url}
                      alt={item.product_name || 'Product'}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex-1 flex-col">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.product_name || 'Product'}</h3>
                        <p className="text-sm text-gray-600">by {item.listing_id ? 'Listing Owner' : 'Creator'}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-2xl font-bold text-gray-900">
                          ${(item.product_price_cents / 100).toFixed(2)}
                        </p>
                        <p className="text-gray-600">per item</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div>
                      <label className="text-sm text-gray-600">Quantity</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-600 hover:text-red-700 transition-colors p-3 rounded-lg border border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {total > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600">
                      Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">${totalDollars.toFixed(2)}</p>
                    <p className="text-gray-600">Total</p>
                  </div>
                </div>
              </div>

              <Link 
                href="/checkout"
                className="block w-full bg-black text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors text-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
