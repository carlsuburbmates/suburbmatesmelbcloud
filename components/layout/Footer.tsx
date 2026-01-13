import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

const Footer = () => {
  return (
    <footer id="footer" className="bg-white border-t border-line px-6 py-12 pb-32 md:pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 gap-8">
          <h2 className="text-lg font-medium text-ink font-sans tracking-tight">
            {SITE_CONFIG.name}<span className="text-ink-muted">.</span>
          </h2>
          <span className="text-[10px] text-ink-muted/60 uppercase tracking-widest font-sans font-medium">
            {SITE_CONFIG.footer.copyright}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <span className="type-meta text-[10px] text-ink-muted/50 block">Platform</span>
            <div className="flex flex-col space-y-2">
              <Link href={SITE_CONFIG.links.directory} className="text-sm text-ink hover:text-ink-muted transition-colors font-medium">Directory</Link>
              <Link href={SITE_CONFIG.links.marketplace} className="text-sm text-ink hover:text-ink-muted transition-colors font-medium">Marketplace</Link>
              <Link href="#" className="text-sm text-ink hover:text-ink-muted transition-colors font-medium">Collections</Link>
              <Link href="#" className="text-sm text-ink hover:text-ink-muted transition-colors font-medium">Create a Studio</Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <span className="type-meta text-[10px] text-ink-muted/50 block">Trust & Support</span>
            <div className="flex flex-col space-y-2">
              <Link href="#" className="text-sm text-ink hover:text-ink-muted transition-colors font-medium flex items-center gap-1">
                Verification <span className="text-[10px] text-ink-muted/60 font-normal">(Definitions)</span>
              </Link>
              <Link href="#" className="text-sm text-ink hover:text-ink-muted transition-colors font-medium flex items-center gap-1">
                Featured <span className="text-[10px] text-ink-muted/60 font-normal">(Policy)</span>
              </Link>
              <Link href="#" className="text-sm text-ink hover:text-ink-muted transition-colors font-medium flex items-center gap-1">
                Purchase Help <span className="text-[10px] text-ink-muted/60 font-normal">(Creator)</span>
              </Link>
              <Link href="#" className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium flex items-center gap-1">
                Report Concern <span className="text-[10px] text-ink-muted/60 font-normal">(Platform)</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-line pt-6 flex flex-col gap-2">
          <p className="text-[11px] text-ink-muted leading-relaxed max-w-2xl">
            Products are sold by creators. {SITE_CONFIG.name} is a discovery platform. Purchases are fulfilled by the Creator.
          </p>
          <div className="flex flex-wrap gap-4 text-[11px] text-ink-muted/70">
            <span>Featured placements are paid. Not an endorsement.</span>
            <span>Verified indicates ABN status verified.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;