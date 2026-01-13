import React from 'react';
import { SITE_CONFIG } from '@/lib/constants';

const BottomNavBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-line z-50 flex justify-around items-center px-6">
      <a href={SITE_CONFIG.links.home} className="type-meta text-xs text-ink hover:text-ink-muted transition-colors">
        Home
      </a>
      <a href={SITE_CONFIG.links.directory} className="type-meta text-xs text-ink hover:text-ink-muted transition-colors">
        Directory
      </a>
      <a href={SITE_CONFIG.links.marketplace} className="type-meta text-xs text-ink hover:text-ink-muted transition-colors">
        Marketplace
      </a>
      <a href={SITE_CONFIG.links.studio} className="type-meta text-xs text-ink hover:text-ink-muted transition-colors">
        Studio
      </a>
    </nav>
  );
};

export default BottomNavBar;