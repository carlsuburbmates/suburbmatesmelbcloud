import Link from 'next/link';
import type { Tables } from '@/types/supabase';

interface ListingCardProps {
  listing: Tables<'listings'> & { category: { name: string } | null };
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const isFeatured = listing.featured_until && new Date(listing.featured_until) > new Date();
  const isVerified = listing.is_verified;
  
  // 1. FEATURED (Horizontal, Full Width, Image Left)
  if (isFeatured) {
    return (
      <Link href={`/listing/${listing.id}`} className="col-span-2 block group">
        <article className="bg-white border border-line rounded-xl p-4 cursor-pointer hover:border-ink transition-colors group shadow-sm relative flex flex-col sm:flex-row gap-4 overflow-hidden">
          <div className="absolute top-0 left-0 bg-ink text-white type-meta text-[9px] px-2 py-1 rounded-br-lg z-10 uppercase tracking-wider font-medium">
            Featured
          </div>
          <div className="w-full sm:w-24 h-32 sm:h-24 bg-gray-200 shrink-0 rounded-lg overflow-hidden mt-6 sm:mt-0 relative">
             <div className="absolute inset-0 bg-gray-200 animate-pulse" />
             {/* Image would go here */}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-light text-ink leading-tight mb-1 group-hover:translate-x-1 transition-transform font-serif">
              {listing.name}
            </h4>
            <div className="flex items-center gap-2 mb-2">
              {isVerified && (
                <span className="type-meta text-[9px] text-verified flex items-center gap-1 font-medium">
                  Verified
                </span>
              )}
              <span className="text-[9px] text-ink-muted">{listing.location}</span>
            </div>
            <p className="text-[10px] text-ink-muted line-clamp-2 leading-relaxed font-sans max-w-md">
              {listing.category?.name} &bull; Premier destination.
            </p>
          </div>
        </article>
      </Link>
    );
  }

  // 2. PRO (Horizontal, Full Width, Gold Border)
  if (listing.tier === 'Pro') {
    return (
      <Link href={`/listing/${listing.id}`} className="col-span-2 block group">
        <article className="bg-white border border-gold/40 rounded-xl p-4 cursor-pointer hover:border-gold transition-colors group shadow-sm relative flex items-start gap-4 overflow-hidden">
          <div className="absolute top-3 right-3 type-meta text-[9px] text-gold border border-gold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
            Pro
          </div>
          <div className="w-12 h-12 bg-gray-100 shrink-0 rounded-full overflow-hidden border border-gold/20 relative">
             <div className="absolute inset-0 bg-gray-100" />
          </div>
          <div className="flex-1 pr-10">
            <h4 className="text-lg font-medium text-ink leading-tight mb-1 font-serif group-hover:text-gold transition-colors">
              {listing.name}
            </h4>
            <div className="flex items-center gap-2 mb-1">
              {isVerified && (
                 <span className="type-meta text-[9px] text-verified font-medium">Verified</span>
              )}
              <span className="text-[9px] text-ink-muted">&bull; {listing.location}</span>
            </div>
             <p className="text-[10px] text-ink-muted line-clamp-1 font-sans">
              {listing.category?.name}
            </p>
          </div>
        </article>
      </Link>
    );
  }

  // 3. BASIC (Vertical, Standard)
  if (listing.owner_id) { // Claimed but Basic
     return (
      <Link href={`/listing/${listing.id}`} className="col-span-1 block group">
        <article className="bg-white border border-line rounded-lg p-3 cursor-pointer hover:border-ink transition-colors group flex flex-col h-56 shadow-sm overflow-hidden relative">
          <div className="flex justify-between items-start mb-2">
            <span className="type-meta text-[8px] text-ink-muted/50 uppercase tracking-widest">
              Basic
            </span>
            {isVerified && (
               <span className="type-meta text-[8px] text-verified">Verified</span>
            )}
          </div>
          <div className="flex-1 w-full bg-gray-100 rounded-sm mb-2 overflow-hidden relative group-hover:opacity-90 transition-opacity">
            <div className="absolute inset-0 bg-gray-100" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-ink leading-tight mb-1 truncate font-serif">
              {listing.name}
            </h4>
            <div className="pt-2 border-t border-line type-meta text-[8px] text-ink-muted flex justify-between">
              <span>{listing.location}</span>
                <span className="opacity-50">{listing.category?.name}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // 4. UNCLAIMED (Ghost)
  return (
    <div className="col-span-1 block group opacity-60 hover:opacity-100 transition-opacity">
       <article className="bg-white/30 border border-line/50 border-dashed rounded-lg p-3 flex flex-col h-56 relative overflow-hidden">
          <div className="flex justify-between items-start mb-1">
            <span className="type-meta text-[8px] bg-gray-100 text-ink-muted px-1 py-0.5 rounded-sm uppercase tracking-wide">
              Unclaimed
            </span>
          </div>
          <div className="flex-1 w-full bg-gray-50/50 rounded-sm mb-2 flex items-center justify-center">
             <span className="text-xl opacity-10 font-serif italic">?</span>
          </div>
          <div>
             <h4 className="text-xs font-light text-ink-muted mb-1 truncate font-serif">
              {listing.name}
            </h4>
            <div className="flex justify-between items-center pt-2 border-t border-line/30">
               <span className="type-meta text-[8px] text-ink-muted truncate max-w-[50%]">{listing.location}</span>
               <Link href={`/claim/${listing.id}`}>
                 <button className="type-meta text-[8px] border border-ink-muted/30 px-1.5 py-0.5 bg-white hover:bg-ink hover:text-white transition-colors rounded-sm uppercase tracking-wide">
                  Claim
                 </button>
               </Link>
            </div>
          </div>
       </article>
    </div>
  );
};
