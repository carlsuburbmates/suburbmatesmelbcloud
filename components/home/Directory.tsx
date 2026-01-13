"use client";

import { useState } from 'react';
import type { Tables } from '@/types/supabase';
import { ListingCard } from './ListingCard';
import { FilterOverlay } from './FilterOverlay';

interface DirectoryProps {
  listings: (Tables<'listings'> & { category: { name: string } | null })[];
}

const Directory = ({ listings }: DirectoryProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Client-side filtering logic
  const filteredListings = listings.filter(l => {
    if (!filterQuery) return true;
    
    const q = filterQuery.toLowerCase();
    const nameMatch = l.name.toLowerCase().includes(q);
    const catMatch = l.category?.name?.toLowerCase().includes(q);
    const locMatch = l.location?.toLowerCase().includes(q);
    
    // Status filters
    const isFeatured = l.featured_until && new Date(l.featured_until) > new Date();
    if (filterQuery === 'Featured' && isFeatured) return true;
    if (filterQuery === 'Pro' && l.tier === 'Pro') return true;
    if (filterQuery === 'Verified' && l.is_verified) return true;
    
    // Return text matches if not a strict status filter
    if (['Featured', 'Pro', 'Verified'].includes(filterQuery)) return false; 
    
    return nameMatch || catMatch || locMatch;
  });

  return (
    <section id="directory" className="px-4 pb-12">
      {/* Window Container */}
      <div className="border-2 border-ink/10 rounded-2xl bg-white shadow-pop overflow-hidden flex flex-col h-[70vh] relative transform transition-transform duration-500 hover:scale-[1.002]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-line bg-gradient-to-b from-gray-50 to-white backdrop-blur-md sticky top-0 z-20 flex justify-between items-center">
          <div>
            <h3 className="type-display text-xl text-ink">Directory</h3>
            <p className="text-[10px] text-ink-muted uppercase tracking-widest">
              {filterQuery ? `Filtered: ${filterQuery}` : 'Ranked List'}
            </p>
          </div>
          {/* CONTROLS */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)} 
              className={`type-meta text-[10px] text-ink border border-line bg-white px-2 py-1 rounded hover:bg-gray-50 transition-colors flex items-center gap-1 shadow-sm ${isFilterOpen ? 'bg-gray-100 border-ink' : ''}`}
            >
              Filter <span className="text-ink-muted text-xs">●</span>
            </button>
            <a href="#marketplace" className="type-meta text-[10px] text-ink border border-line bg-white px-2 py-1 rounded hover:bg-ink hover:text-white transition-colors flex items-center gap-1 shadow-sm">
              Skip <span>&darr;</span>
            </a>
          </div>
        </div>

        {/* Filter Overlay */}
        {isFilterOpen && (
          <FilterOverlay 
            isOpen={isFilterOpen} 
            onClose={() => setIsFilterOpen(false)}
            onFilterChange={setFilterQuery}
          />
        )}

        {/* Window Content */}
        <div id="directory-list" className="flex-1 overflow-y-auto hide-scrollbar p-3 bg-gray-50/20 shadow-inner">
          <div id="directory-grid" className="grid grid-cols-2 gap-3">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
            
            {filteredListings.length === 0 && (
               <div className="col-span-2 py-12 text-center text-ink-muted text-sm">
                 No results found for "{filterQuery}".
               </div>
            )}
          </div>
          
          <div className="pt-6 pb-2 text-center">
            <button className="type-meta text-xs text-ink border-b border-ink pb-0.5 hover:opacity-50">
              {filteredListings.length} Listings Loaded
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Directory;