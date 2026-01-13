import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  listingName: string;
  listingId: string;
  listingSlug?: string | null;
  listingIsVerified?: boolean;
  categoryName?: string | null;
  updatedAt: string;
  imageUrl?: string | null;
}

export function ProductCard({
  id,
  name,
  price,
  listingName,
  listingId,
  listingSlug,
  listingIsVerified,
  categoryName,
  updatedAt,
  imageUrl,
}: ProductCardProps) {
  // Freshness Label: "Updated [Month YYYY]"
  const dateObj = new Date(updatedAt);
  const freshness = `Updated ${dateObj.toLocaleString('en-AU', { month: 'long', year: 'numeric' })}`;

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden">
      {/* Thumbnail Aspect Ratio 1:1 */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 rounded-lg">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
             <div className="w-12 h-12 border-2 border-slate-200 rounded-lg rotate-12 flex items-center justify-center opacity-50">
               <span className="text-xl font-bold">P</span>
             </div>
          </div>
        )}
        <Link href={`/product/${id}`} className="absolute inset-0 z-0">
          <span className="sr-only">View {name}</span>
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {/* Category Label */}
        {categoryName && (
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            {categoryName}
          </span>
        )}

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-600 truncate">
          <Link href={`/product/${id}`}>
            {name}
          </Link>
        </h3>

        {/* Price */}
        <p className="text-sm font-bold text-slate-900">
          {new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
          }).format(price)}
        </p>

        {/* Seller Line & ABN Badge */}
        <div className="mt-2 flex items-center justify-between">
           <Link 
            href={listingSlug ? `/u/${listingSlug}` : `/listing/${listingId}`}
            className="relative z-10 text-xs text-slate-500 hover:text-slate-900 group/seller flex items-center gap-1"
           >
             Sold by <span className="font-medium underline decoration-slate-200 underline-offset-2 group-hover/seller:decoration-slate-900">{listingName}</span>
             {listingIsVerified && (
               <span title="ABN Verified">
                   <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
               </span>
             )}
           </Link>
           
           {/* Freshness Label */}
           <span className="text-[10px] text-slate-400 font-medium">
             {freshness}
           </span>
        </div>
      </div>
    </div>
  );
}
