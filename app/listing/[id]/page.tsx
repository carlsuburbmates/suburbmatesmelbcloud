import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, MessageCircle, MapPin, Calendar, ShieldCheck, Star } from 'lucide-react';
import { ShareModal } from '@/components/share/ShareModal';
import type { Metadata } from 'next';

// Force dynamic since we fetch fresh data
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Fetch listing helper
async function getListing(id: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      category:categories(name),
      products(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params: paramsPromise }: PageProps): Promise<Metadata> {
  const params = await paramsPromise;
  const listing = await getListing(params.id);
  if (!listing) return { title: 'Listing Not Found' };

  return {
    title: `${listing.name} | SuburbMates`,
    description: listing.description || `View ${listing.name} on SuburbMates.`,
  };
}

import { ClaimButton } from '@/components/listing/ClaimButton';
import { ReportButton } from '@/components/listing/ReportButton';
import { StudioGallery } from '@/components/listing/StudioGallery';

// ... (imports remain)

// SSOT: This route renders the "Studio Page" (Basic) or "Mini-site" (Pro).
// It is NOT a "Listing Page" because Unclaimed Listings have no public page.

import { redirect } from 'next/navigation';

export default async function StudioPage({ params: paramsPromise }: PageProps) {
  const params = await paramsPromise;
  const listing = await getListing(params.id);

  if (!listing) {
    notFound();
  }

  // SSOT ENFORCEMENT: Unclaimed Listings (Entities) have no public detail page.
  // Redirect to the Claim Interstitial.
  if (listing.status === 'unclaimed') {
    redirect(`/claim/${listing.id}`);
  }

  const isPro = listing.tier === 'Pro';
  const isVerified = listing.is_verified;
  const isFeatured = listing.featured_until && new Date(listing.featured_until) > new Date();

  return (
    <main className="min-h-screen bg-canvas pb-32">
      {/* 1. GALLERY HERO */}
      <StudioGallery name={listing.name} />

      {/* 2. MAIN HEADER INFO */}
      <section className="px-5 -mt-8 relative z-20 mb-8">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-6">
           <div className="flex justify-between items-start mb-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                 {isFeatured && <span className="type-meta px-2 py-1 bg-ink text-white text-[9px] uppercase tracking-wider rounded-md shadow-sm">Featured</span>}
                 {isPro && <span className="type-meta px-2 py-1 bg-gold/10 text-gold-dark border border-gold/20 text-[9px] uppercase tracking-wider rounded-md">Pro</span>}
              </div>
              <div className="text-right">
                  <span className="type-meta text-[10px] text-ink-muted block uppercase tracking-widest mb-0.5">Updated</span>
                  <span className="type-meta text-xs text-ink">{new Date(listing.updated_at).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}</span>
              </div>
           </div>

           <h1 className="text-4xl font-serif text-ink mb-2 leading-tight flex items-center gap-2">
              {listing.name}
              {isVerified && <ShieldCheck className="w-6 h-6 text-verified fill-verified/10" />}
           </h1>

           <div className="flex flex-col sm:flex-row gap-3 sm:items-center text-sm text-ink-muted border-t border-line/50 pt-4 mt-4">
               <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-ink/30" />
                 {listing.category?.name}
               </div>
               <div className="hidden sm:block text-line">•</div>
               <div className="flex items-center gap-2">
                 <MapPin className="w-4 h-4 opacity-50" />
                 {listing.location}
               </div>
           </div>
        </div>
      </section>

      {/* 3. DESCRIPTION */}
      <section className="px-6 space-y-4 max-w-2xl mx-auto">
        {listing.description ? (
          <div className="prose prose-sm prose-neutral text-ink/80 leading-relaxed font-sans">
            <p>{listing.description}</p>
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-ink/10 rounded-2xl bg-gray-50/50">
            <p className="text-sm text-ink-muted italic">"A quiet presence, awaiting its story."</p>
          </div>
        )}
      </section>

      {/* 4. PRODUCTS (If Any) */}
       {listing.products && listing.products.length > 0 && (
         <section className="px-6 py-8 mt-8 border-t border-line/50">
           <h3 className="type-meta text-xs text-ink-muted uppercase tracking-widest mb-6">Digital Goods</h3>
           <div className="grid gap-4 sm:grid-cols-2">
              {listing.products.map((product: any) => (
                <div key={product.id} className="group cursor-pointer flex gap-4 p-4 rounded-2xl border border-ink/5 bg-white shadow-sm hover:shadow-md hover:border-ink/10 transition-all duration-300">
                   {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                   ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-xl">🎁</div>
                   )}
                   <div className="flex-1 min-w-0 flex flex-col justify-center">
                     <h4 className="font-serif text-ink text-lg truncate group-hover:text-gold transition-colors">{product.name}</h4>
                     <div className="mt-1 text-sm font-medium text-ink-muted">${product.price}</div>
                   </div>
                </div>
              ))}
           </div>
         </section>
       )}

      {/* 5. COMMAND CONSOLE (Action Bar) */}
      <div className="fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-ink/95 backdrop-blur-xl text-white rounded-full shadow-floating p-2 flex items-center justify-between max-w-md mx-auto ring-1 ring-white/10">
          
          <div className="flex flex-1 items-center justify-around px-2 gap-2">
              {listing.contact_email && (
                <a href={`mailto:${listing.contact_email}`} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors group">
                  <MessageCircle className="w-5 h-5 text-white/80 group-hover:text-gold transition-colors" />
                  <span className="text-[9px] uppercase tracking-wider font-medium text-white/60">Email</span>
                </a>
              )}
              {listing.phone && (
                <a href={`tel:${listing.phone.replace(/\s+/g, '')}`} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors group">
                  <Calendar className="w-5 h-5 text-white/80 group-hover:text-gold transition-colors" />
                  <span className="text-[9px] uppercase tracking-wider font-medium text-white/60">Call</span>
                </a>
              )}
          </div>

           <div className="w-px h-8 bg-white/10 mx-2" />
           
           <div className="flex items-center gap-1 pr-2">
             <ShareModal 
                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/listing/${listing.id}`} 
                title={listing.name} 
             />
             <ReportButton listingId={listing.id} listingName={listing.name} variant="ghost" className="text-white/40 hover:text-red-400 p-2 hover:bg-white/5 rounded-full" />
           </div>

        </div>
      </div>

    </main>
  );
}
