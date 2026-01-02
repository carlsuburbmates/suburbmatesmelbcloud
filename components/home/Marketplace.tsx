import React from 'react';

const Marketplace = () => {
  return (
    <section id="marketplace" className="px-4 pb-12">
      {/* Window Container */}
      <div className="border-2 border-ink/10 rounded-2xl bg-white shadow-pop overflow-hidden flex flex-col relative transform transition-transform duration-500 hover:scale-[1.002]">
        <div className="px-5 py-4 border-b border-line bg-gradient-to-b from-gray-50 to-white backdrop-blur-md flex justify-between items-center">
          <div>
            <h3 className="type-display text-xl text-ink">Marketplace</h3>
            <p className="text-[10px] text-ink-muted uppercase tracking-widest">
              Digital Assets
            </p>
          </div>
          <a
            href="#info-dock"
            className="type-meta text-[10px] text-ink border border-line bg-white px-2 py-1 rounded hover:bg-ink hover:text-white transition-colors flex items-center gap-1 shadow-sm"
          >
            Skip <span>&darr;</span>
          </a>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar px-5 pb-6 pt-5 snap-x bg-gray-50/20 shadow-inner">
          {/* Products */}
          <div className="min-w-[160px] snap-center cursor-pointer group bg-white p-3 rounded-lg border border-line shadow-sm hover:border-ink transition-colors">
            <div className="aspect-[3/4] bg-gray-100 border border-line relative overflow-hidden mb-3 rounded">
              <img
                src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform"
                alt="Agency OS Notion Template"
              />
            </div>
            <h4 className="text-xs font-medium text-ink leading-tight mb-1">
              Agency OS
            </h4>
            <p className="text-[9px] text-ink-muted mb-2">Notion Template</p>
            <div className="flex justify-between items-center border-t border-line pt-2">
              <span className="text-[10px] font-bold text-gold">$49.00</span>
              <span className="text-[9px] text-ink-muted">Contrast</span>
            </div>
          </div>
          {/* Product 2 */}
          <div className="min-w-[160px] snap-center cursor-pointer group bg-white p-3 rounded-lg border border-line shadow-sm hover:border-ink transition-colors">
            <div className="aspect-[3/4] bg-gray-100 border border-line relative overflow-hidden mb-3 rounded">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform"
                alt="Melbourne LUTs Lightroom Pack"
              />
            </div>
            <h4 className="text-xs font-medium text-ink leading-tight mb-1">
              Melbourne LUTs
            </h4>
            <p className="text-[9px] text-ink-muted mb-2">Lightroom Pack</p>
            <div className="flex justify-between items-center border-t border-line pt-2">
              <span className="text-[10px] font-bold text-gold">$24.95</span>
              <span className="text-[9px] text-ink-muted">Lumière</span>
            </div>
          </div>
          {/* Product 3 */}
          <div className="min-w-[160px] snap-center cursor-pointer group bg-white p-3 rounded-lg border border-line shadow-sm hover:border-ink transition-colors">
            <div className="aspect-[3/4] bg-gray-100 border border-line relative overflow-hidden mb-3 rounded">
              <img
                src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=400&auto=format&fit=crop"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform"
                alt="Contract Kit Legal Template"
              />
            </div>
            <h4 className="text-xs font-medium text-ink leading-tight mb-1">
              Contract Kit
            </h4>
            <p className="text-[9px] text-ink-muted mb-2">Legal Template</p>
            <div className="flex justify-between items-center border-t border-line pt-2">
              <span className="text-[10px] font-bold text-gold">$35.00</span>
              <span className="text-[9px] text-ink-muted">Legal.au</span>
            </div>
          </div>
          {/* Product 4 */}
          <div className="min-w-[160px] snap-center cursor-pointer group bg-white p-3 rounded-lg border border-line shadow-sm hover:border-ink transition-colors">
            <div className="aspect-[3/4] bg-gray-100 border border-line relative overflow-hidden mb-3 rounded flex items-center justify-center">
              <span className="type-display text-xl text-ink-muted italic">
                View All
              </span>
            </div>
            <h4 className="text-xs font-medium text-ink leading-tight mb-1">
              Browse More
            </h4>
            <p className="text-[9px] text-ink-muted mb-2">240+ Assets</p>
            <div className="flex justify-between items-center border-t border-line pt-2">
              <span className="text-[10px] font-bold text-ink">&rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Marketplace;