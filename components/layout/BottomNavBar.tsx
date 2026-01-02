import React from 'react';

const BottomNavBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-line z-50 flex justify-around items-center">
      <a href="/" className="type-meta text-xs text-ink hover:text-gold transition-colors">
        Home
      </a>
      <a href="/directory" className="type-meta text-xs text-ink hover:text-gold transition-colors">
        Directory
      </a>
      <a href="/marketplace" className="type-meta text-xs text-ink hover:text-gold transition-colors">
        Marketplace
      </a>
      <a href="/account" className="type-meta text-xs text-ink hover:text-gold transition-colors">
        Account
      </a>
    </nav>
  );
};

export default BottomNavBar;