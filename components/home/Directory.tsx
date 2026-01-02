import React from 'react';

const Directory = () => {
  return (
    <section id="directory" className="px-4 pb-12">
      {/* Window Container */}
      <div className="border-2 border-ink/10 rounded-2xl bg-white shadow-pop overflow-hidden flex flex-col h-[70vh] relative transform transition-transform duration-500 hover:scale-[1.002]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line bg-gradient-to-b from-gray-50 to-white backdrop-blur-md sticky top-0 z-20 flex justify-between items-center">
          <div>
            <h3 className="type-display text-xl text-ink">Directory</h3>
            <p className="text-[10px] text-ink-muted uppercase tracking-widest">
              Ranked List
            </p>
          </div>
          {/* CONTROLS */}
          <div className="flex items-center gap-2">
            <button className="type-meta text-[10px] text-ink border border-line bg-white px-2 py-1 rounded hover:bg-gray-50 transition-colors flex items-center gap-1 shadow-sm">
              Filter <span className="text-gold text-xs">●</span>
            </button>
            <a
              href="#marketplace"
              className="type-meta text-[10px] text-ink border border-line bg-white px-2 py-1 rounded hover:bg-ink hover:text-white transition-colors flex items-center gap-1 shadow-sm"
            >
              Skip <span>&darr;</span>
            </a>
          </div>
        </div>

        {/* Window Content */}
        <div
          id="directory-list"
          className="flex-1 overflow-y-auto hide-scrollbar p-3 bg-gray-50/20 shadow-inner"
        >
          <div id="directory-grid" className="grid grid-cols-2 gap-3">
            {/* Dynamic Content */}
          </div>
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