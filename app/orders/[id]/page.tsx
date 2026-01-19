'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronLeft, Package, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string | null;
  product_price_cents: number;
  quantity: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  status: string;
  total_cents: number;
  customer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = (params?.id as string) || '';
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'GET',
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || `Failed to fetch order: ${response.statusText}`);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load order');
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const isPaid = order?.status === 'paid';
  const isFulfilled = order?.status === 'fulfilled';
  const isCancelled = order?.status === 'cancelled';
  const isPending = order?.status === 'pending';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center">
          <div className="h-3 w-3 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="text-center">
            <div className="w-12 h-12 mb-4 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-lg font-semibold text-red-800 mb-2">Error Loading Order</p>
            <p className="text-sm text-red-600 mb-4">{error}</p>
          </div>
          <div className="mt-6 text-center">
            <Link 
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
          <p className="text-lg font-semibold text-gray-800">Order not found</p>
          <Link 
            href="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 mt-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="w-5 h-5" />
          Back to Marketplace
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Order Confirmation</h1>
        <p className="text-gray-600 mb-4">
          Order ID: <span className="font-mono">{order.id}</span>
        </p>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Status</p>
                <div className={`text-lg font-semibold ${
                  isPaid ? 'text-green-600' :
                  isFulfilled ? 'text-blue-600' :
                  isCancelled ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {isPaid ? 'Paid' : isFulfilled ? 'Fulfilled' : isCancelled ? 'Cancelled' : 'Pending'}
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">Total</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  ${((order.total_cents || 0) / 100).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              
              {order.order_items && order.order_items.length > 0 ? (
                <div className="space-y-4">
                  {order.order_items.map((item: OrderItem, index: number) => (
                    <div key={item.id || index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {item.image_url ? (
                          <img 
                            src={item.image_url}
                            alt={item.product_name || 'Product'}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {item.product_name || 'Unknown Product'}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          ${(item.product_price_cents / 100).toFixed(2)} x {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          ${((item.product_price_cents * item.quantity) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No items found for this order.</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="text-base text-gray-900 font-medium">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                {isPaid && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">5-7 business days</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              
              {isPaid && (
                <div className="flex gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order paid</p>
                    <p className="text-xs text-gray-500">Your payment has been processed successfully</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {isFulfilled && (
                <div className="flex gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order fulfilled</p>
                    <p className="text-xs text-gray-500">Seller has shipped your items</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-red-800 mb-2">Order Cancelled</p>
                    <p className="text-sm text-red-600">This order has been cancelled and will not be fulfilled</p>
                  </div>
                </div>
              )}

              {isPending && (
                <div className="flex gap-4">
                  <Link 
                    href="/marketplace"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
