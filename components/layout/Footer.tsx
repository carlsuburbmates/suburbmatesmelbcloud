import React from 'react';

const Footer = () => {
  return (
    <footer id="footer" className="bg-white border-t border-line px-6 py-8 pb-32">
      <div className="flex justify-between items-baseline mb-8">
        <h2 className="text-base font-medium text-ink">
          SuburbMates<span className="text-gold">.</span>
        </h2>
        <span className="text-[10px] text-ink-muted/60 uppercase tracking-widest">
          &copy; 2026 Melb
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 mb-8">
        <div className="space-y-3">
          <span className="type-meta text-[9px] text-ink-muted/50 block">
            Platform
          </span>
          <a
            href="#"
            className="block text-xs text-ink hover:text-gold transition-colors"
          >
            Directory
          </a>
          <a
            href="#"
            className="block text-xs text-ink hover:text-gold transition-colors"
          >
            Marketplace
          </a>
          <a
            href="#"
            className="block text-xs text-ink hover:text-gold transition-colors"
          >
            Collections
          </a>
          <a
            href="#"
            className="block text-xs text-ink hover:text-gold transition-colors"
          >
            Create a Studio
          </a>
        </div>
        <div className="space-y-3">
          <span className="type-meta text-[9px] text-ink-muted/50 block">
            Trust & Support
          </span>
          <a
            href="#"
            className="block text-xs text-ink hover:text-gold transition-colors"
          >
            Verification{' '}
            <span className="text-[9px] text-ink-muted/60">(Definitions)</span>
          </a>
          <a
            href="#"
            className="block text-xs text-ink hover:text-gold transition-colors"
          >
            Featured <span className="text-[9px] text-ink-muted/60">(Policy)</span>
          </a>
          <a
            href="#"
            className="block text-xs text-ink hover:text-gold transition-colors"
          >
            Purchase Help{' '}
            <span className="text-[9px] text-ink-muted/60">(Creator)</span>
          </a>
          <a
            href="#"
            className="block text-xs text-danger hover:text-red-700 transition-colors"
          >
            Report Concern{' '}
            <span className="text-[9px] text-ink-muted/60">(Platform)</span>
          </a>
        </div>
      </div>
      <div className="border-t border-line pt-4 space-y-1.5">
        <p className="text-[10px] text-ink-muted leading-tight text-left">
          Products are sold by creators. SuburbMates is a discovery platform.
        </p>
        <p className="text-[10px] text-ink-muted leading-tight text-left">
          Featured placements are paid. Not an endorsement.
        </p>
        <p className="text-[10px] text-ink-muted leading-tight text-left">
          Verified indicates ABN status verified.
        </p>
      </div>
    </footer>
  );
};

export default Footer;