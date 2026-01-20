import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DollarSign, Package, CheckCircle, Clock, AlertCircle, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

function maskStripeAccountId(accountId: string | null | undefined): string {
  if (!accountId) return '—';
  if (accountId.length < 12) return accountId;
  return `${accountId.slice(0, 8)}...${accountId.slice(-4)}`;
}

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('users_public')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'operator') {
    redirect('/');
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('id, customer_id, seller_id, total_cents, platform_fee_cents, seller_earnings_cents, payout_status, seller_stripe_account_id, stripe_application_fee_id, status, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(50);

  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_cents || 0), 0) || 0;
  const totalPlatformFees = orders?.reduce((sum, order) => sum + (order.platform_fee_cents || 0), 0) || 0;
  const paidOrders = orders?.filter(o => o.status === 'paid') || [];
  const routedPayouts = orders?.filter(o => o.payout_status === 'routed') || [];

  const sellerIds = orders?.map(o => o.seller_id).filter(Boolean) as string[];
  const { data: sellers } = sellerIds.length > 0 ? await supabase
    .from('users_public')
    .select('id, full_name, email')
    .in('id', sellerIds)
    : { data: [] };

  const sellerMap = new Map(sellers?.map(s => [s.id, s]) || []);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Orders & Payouts</h1>
          <p className="text-slate-600">Monitor all product orders and payout routing.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
          <ShieldCheck className="w-4 h-4" />
          Operator Access
        </div>
      </header>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">
                ${(totalRevenue / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Platform Fees</p>
              <p className="text-2xl font-bold text-slate-900">
                ${(totalPlatformFees / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
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
            <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center">
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
          <h2 className="text-lg font-bold text-slate-900">All Orders (Last 50)</h2>
        </div>

        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-700">Order ID</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Date</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Seller</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Total</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Platform Fee</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Seller Earnings</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Status</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Payout</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Stripe Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const seller = order.seller_id ? sellerMap.get(order.seller_id) : null;
                  const isPaid = order.status === 'paid';
                  const isPayoutRouted = order.payout_status === 'routed';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(order.created_at).toLocaleDateString('en-AU')}
                      </td>
                      <td className="px-4 py-3">
                        {seller ? (
                          <div>
                            <div className="font-medium text-slate-900">{seller.full_name || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{seller.email || ''}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">Unknown</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        ${(order.total_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        ${((order.platform_fee_cents || 0) / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-bold text-green-600">
                        ${((order.seller_earnings_cents || 0) / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isPaid ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="font-medium text-green-600">Paid</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium text-yellow-600 capitalize">{order.status}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isPayoutRouted ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-purple-500" />
                              <span className="font-medium text-purple-600">Routed</span>
                            </>
                          ) : isPaid ? (
                            <>
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="font-medium text-red-600 capitalize">{order.payout_status}</span>
                            </>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-slate-600">
                          {maskStripeAccountId(order.seller_stripe_account_id)}
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
            <p className="text-slate-500">No product orders have been placed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
