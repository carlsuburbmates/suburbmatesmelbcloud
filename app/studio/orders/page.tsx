import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DollarSign, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_cents, platform_fee_cents, seller_earnings_cents, payout_status, status, created_at')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const totalRevenue = orders?.reduce((sum, order) => sum + (order.seller_earnings_cents || 0), 0) || 0;

  const paidOrders = orders?.filter(o => o.status === 'paid') || [];
  const routedPayouts = orders?.filter(o => o.payout_status === 'routed') || [];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Orders & Payouts</h1>
        <p className="text-slate-600">Track your product sales and earnings.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Earnings</p>
              <p className="text-2xl font-bold text-slate-900">
                ${(totalRevenue / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Paid Orders</p>
              <p className="text-2xl font-bold text-slate-900">{paidOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Payouts Routed</p>
              <p className="text-2xl font-bold text-slate-900">{routedPayouts.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
        </div>

        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm">Order ID</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm">Date</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm">Total</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm">Your Earnings</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm">Platform Fee</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const isPaid = order.status === 'paid';
                  const isPayoutRouted = order.payout_status === 'routed';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-slate-600">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(order.created_at).toLocaleDateString('en-AU')}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        ${(order.total_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        ${((order.seller_earnings_cents || 0) / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        ${((order.platform_fee_cents || 0) / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isPaid ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-green-600">Paid</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium text-yellow-600 capitalize">{order.status}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isPayoutRouted ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-purple-500" />
                              <span className="text-sm font-medium text-purple-600">Routed</span>
                            </>
                          ) : isPaid ? (
                            <>
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-blue-600 capitalize">{order.payout_status}</span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No orders yet</h3>
            <p className="text-slate-500">You haven't received any product orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
