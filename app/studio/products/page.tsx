import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, Package } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: listing } = await supabase
    .from('listings')
    .select('id, tier')
    .eq('owner_id', user.id)
    .single();

  if (!listing) {
      return <div>No listing found.</div>;
  }

  const { data: products, count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('listing_id', listing.id)
    .order('created_at', { ascending: false });

  const tier = listing.tier || 'Basic';
  const limit = tier === 'Pro' ? 10 : 3;
  const currentCount = productCount || 0;
  const hasReachedLimit = currentCount >= limit;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Products</h1>
           <div className="flex items-center gap-2 mt-1">
             <p className="text-slate-500">Manage your services and digital goods.</p>
             <span className="text-slate-300">•</span>
             <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${hasReachedLimit ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
               {currentCount} / {limit} Used
             </span>
             {tier === 'Basic' && !hasReachedLimit && (
               <Link href="/studio/billing" className="text-[10px] font-black uppercase tracking-widest text-gold-600 hover:underline">
                 Upgrade for 10
               </Link>
             )}
           </div>
        </div>
        <Link href="/studio/products/new" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg active:scale-95">
           <Plus className="w-5 h-5" />
           New Product
        </Link>
      </div>

      {products && products.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                    <tr>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Description</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Investment</th>
                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Control</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-8 py-6 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-100">
                                       <Package className="w-6 h-6" />
                                   </div>
                                   <div>
                                       <div className="text-base font-bold text-slate-900">{product.name}</div>
                                       <div className="text-sm text-slate-500 max-w-xs truncate">{product.description}</div>
                                   </div>
                                </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-base font-mono font-bold text-slate-900">
                                ${product.price}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                                <Link 
                                    href={`/studio/products/${product.id}/edit`} 
                                    className="inline-flex items-center justify-center rounded-xl bg-slate-50 px-4 py-2 text-slate-900 hover:bg-slate-900 hover:text-white transition-all border border-slate-200"
                                >
                                    Edit
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
      ) : (
          <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
             <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                 <Package className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-lg font-medium text-slate-900">No products yet</h3>
             <p className="text-slate-500 mt-1 mb-6">Create your first product to start selling.</p>
             <Link href="/studio/products/new" className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors">
                <Plus className="w-4 h-4" />
                Add Product
             </Link>
          </div>
      )}
    </div>
  );
}
