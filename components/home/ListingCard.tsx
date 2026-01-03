import type { Tables } from '@/types/supabase';

interface ListingCardProps {
  listing: Tables<'listings'> & { category: { name: string } | null };
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-line hover:shadow-md transition-shadow duration-300 p-4">
      <h3 className="text-lg font-bold text-ink">{listing.name}</h3>
      <p className="text-sm text-ink-muted">{listing.category?.name}</p>
      <p className="text-sm text-ink-muted">{listing.location}</p>
      <div className="flex gap-2 mt-2">
        {listing.featured_until && (
          <span className="text-xs font-semibold bg-gold text-white px-2 py-1 rounded-full">
            Featured
          </span>
        )}
        {listing.is_verified && (
          <span className="text-xs font-semibold bg-blue-500 text-white px-2 py-1 rounded-full">
            Verified
          </span>
        )}
      </div>
    </div>
  );
};
