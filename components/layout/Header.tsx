import React from 'react';
import { SITE_CONFIG } from '@/lib/constants';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <nav className="flex-none bg-canvas/95 backdrop-blur-sm z-40 border-b border-line px-6 py-4 flex justify-between items-center transition-all duration-300 sticky top-0">
      <div className="flex items-center gap-1 cursor-pointer">
        <h1 className="text-lg font-medium tracking-tight text-ink font-sans">
          {SITE_CONFIG.name}<span className="text-ink-muted">.</span>
        </h1>
      </div>
      <div className="flex gap-3 items-center">
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
          Sign In
        </Button>
        <Button variant="default" size="sm">
          Join Directory
        </Button>
      </div>
    </nav>
  );
};

export default Header;