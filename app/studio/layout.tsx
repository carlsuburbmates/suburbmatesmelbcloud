import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Store, UserCircle, LogOut, Package, CreditCard, Palette } from 'lucide-react';

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch listing ID for links
  const { data: listing } = await supabase
    .from('listings')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  const listingId = listing?.id;

  if (!listingId) {
      // ...
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed inset-y-0 left-0 hidden md:flex flex-col">
          <div className="p-6 border-b border-slate-100">
              <Link href="/" className="text-2xl font-black text-slate-900 tracking-tighter hover:opacity-80 transition-opacity">
                  suburb<span className="text-blue-600">mates</span>
              </Link>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
              {listingId && (
                <>
                    <Link href="/studio" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Overview
                    </Link>
                    <Link href="/studio/details" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                        <UserCircle className="w-5 h-5" />
                        Listing Details
                    </Link>
                    <Link href="/studio/products" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                        <Package className="w-5 h-5" />
                        Products
                    </Link>
                    <Link href="/studio/design" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                        <Palette className="w-5 h-5" />
                        Design Studio
                    </Link>
                    <Link href="/studio/share" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                       <Package className="w-5 h-5" />
                       Share Kit
                    </Link>
                     <Link href="/studio/verification" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                        <UserCircle className="w-5 h-5" />
                        Verification
                    </Link>
                     <Link href={`/listing/${listingId}`} className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                        <Store className="w-5 h-5" />
                        View Page
                    </Link>
                </>
              )}
              
               <div className="pt-4 mt-4 border-t border-slate-100">
                    <Link href="/studio/billing" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                        <CreditCard className="w-5 h-5" />
                        Billing & Payouts
                    </Link>
               </div>
          </nav>
          
          <div className="p-4 border-t border-slate-100">
             {/* ... */}
             <form action="/auth/signout" method="post">
                <button className="flex w-full items-center gap-3 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
             </form>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
          {children}
      </main>
    </div>
  );
}
