import React from 'react';

const Hero = () => {
  return (
    <section id="hero" className="px-6 pt-12 pb-12 max-w-7xl mx-auto">
      <h2 className="type-display text-5xl md:text-6xl text-ink mb-4 tracking-tighter">
        Local Truth.<br />
        <span className="italic font-serif text-ink-muted">Digital Goods.</span>
      </h2>
      <div className="border-l-2 border-ink/10 pl-6 mb-12">
        <p className="type-body text-base text-ink-muted leading-relaxed max-w-md">
          Melbourne’s dedicated discovery layer. Verified creators, direct
          commerce, no algorithms.
        </p>
      </div>

      {/* Search */}
      <div className="relative group max-w-2xl shadow-floating rounded-lg">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg
            className="w-5 h-5 text-ink-muted group-focus-within:text-ink transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <form action="/directory" method="get">
            <input
            id="search-input"
            name="q"
            type="text"
            placeholder="Search creators, studios, or assets..."
            className="w-full bg-white border border-line rounded-lg py-4 pl-12 pr-4 text-base text-ink focus:outline-none focus:border-ink/30 focus:ring-4 focus:ring-ink/5 transition-all placeholder:text-ink-muted/50"
            />
        </form>
      </div>
    </section>
  );
};

export default Hero;