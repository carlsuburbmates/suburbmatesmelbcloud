"use client";

import { X } from "lucide-react";

interface FilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (query: string) => void;
}

export function FilterOverlay({ isOpen, onClose, onFilterChange }: FilterOverlayProps) {
  if (!isOpen) return null;

  const handleFilter = (filter: string) => {
    onFilterChange(filter);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-line flex justify-between items-center">
        <h3 className="type-display text-xl text-ink">Filter</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-ink" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        
        {/* Section: Status */}
        <div>
          <h4 className="type-meta text-[10px] text-ink-muted uppercase tracking-widest mb-3">Status</h4>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleFilter('Featured')} className="px-3 py-2 border border-line rounded-lg text-xs text-ink hover:border-ink hover:bg-gray-50 transition-all">Featured</button>
            <button onClick={() => handleFilter('Pro')} className="px-3 py-2 border border-line rounded-lg text-xs text-ink hover:border-ink hover:bg-gray-50 transition-all">Pro</button>
            <button onClick={() => handleFilter('Verified')} className="px-3 py-2 border border-line rounded-lg text-xs text-ink hover:border-ink hover:bg-gray-50 transition-all">Verified</button>
          </div>
        </div>

        {/* Section: Categories */}
        <div>
          <h4 className="type-meta text-[10px] text-ink-muted uppercase tracking-widest mb-3">Categories</h4>
          <div className="grid grid-cols-2 gap-2">
            {['Design', 'Photography', 'Development', 'Marketing', 'Interior', 'Art', 'Wellness', 'Music'].map((cat) => (
              <button 
                key={cat}
                onClick={() => handleFilter(cat)} 
                className="px-3 py-2 border border-line rounded-lg text-xs text-ink text-left hover:border-ink hover:bg-gray-50 transition-all"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Clear */}
        <div className="pt-4 border-t border-line">
           <button onClick={() => handleFilter('')} className="w-full py-3 text-xs text-ink-muted hover:text-ink transition-colors">
             Clear All Filters
           </button>
        </div>

      </div>
    </div>
  );
}
