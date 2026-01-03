'use client';

import { ListingCard } from './ListingCard';
import type { Tables } from '@/types/supabase';

interface DirectoryProps {
  listings: Tables<'listings'>[];
}

const Directory = ({ listings }: DirectoryProps) => {
  return (
    <section id="directory" className="px-4 pb-12">
      <div className="border-2 border-ink/10 rounded-2xl bg-white shadow-pop overflow-hidden flex flex-col h-[70vh] relative transform transition-transform duration-500 hover:scale-[1.002]">
        <div className="px-5 py-4 border-b border-line bg-gradient-to-b from-gray-50 to-white backdrop-blur-md sticky top-0 z-20 flex justify-between items-center">
          <div>
            <h3 className="type-display text-xl text-ink">Directory</h3>
            <p className="text-[10px] text-ink-muted uppercase tracking-widest">
              Ranked List
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="type-meta text-[10px] text-ink border border-line bg-white px-2 py-1 rounded hover:bg-gray-50 transition-colors flex items-center gap-1 shadow-sm">
              Filter <span className="text-gold text-xs">●</span>
            </button>
            <a
              href="#marketplace"
              className="type-meta text-[10px] text-ink border border-line bg-white px-2 py-1 rounded hover:bg-ink hover:text-white transition-colors flex items-center gap-1 shadow-sm"
            >
              Skip <span>↓</span>
            </a>
          </div>
        </div>
        <div
          id="directory-list"
          className="flex-1 overflow-y-auto hide-scrollbar p-3 bg-gray-50/20 shadow-inner"
        >
          {listings && listings.length > 0 ? (
            <div id="directory-grid" className="grid grid-cols-2 gap-3">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-ink-muted">No listings found.</p>
            </div>
          )}
          <div className="pt-6 pb-2 text-center">
            <button className="type-meta text-xs text-ink border-b border-ink pb-0.5 hover:opacity-50">
              Load Full Directory
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Directory;