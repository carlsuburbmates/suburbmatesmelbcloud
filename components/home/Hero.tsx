import React from 'react';

const Hero = () => {
  return (
    <header className="px-6 pt-12 pb-12">
      <h2 className="type-display text-5xl md:text-6xl text-ink mb-4">
        Local Truth.<br />
        <span className="italic text-ink-muted">Digital Goods.</span>
      </h2>
      <div className="border-l border-gold pl-4 mb-8">
        <p className="text-sm text-ink-muted leading-relaxed max-w-md">
          Melbourne’s dedicated discovery layer. Verified creators, direct
          commerce, no algorithms.
        </p>
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-ink-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          id="search-input"
          type="text"
          placeholder="Search creators, studios, or assets..."
          className="w-full bg-white border border-line py-3 pl-10 pr-4 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
        />
      </div>
    </header>
  );
};

export default Hero;