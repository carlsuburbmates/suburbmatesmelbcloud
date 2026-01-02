import React from 'react';

const Header = () => {
  return (
    <nav className="flex-none bg-canvas/95 backdrop-blur-sm z-40 border-b border-line px-6 py-4 flex justify-between items-center transition-all duration-300 sticky top-0">
      <div className="flex items-center gap-1 cursor-pointer">
        <h1 className="text-lg font-medium tracking-tight text-ink">
          SuburbMates<span className="text-gold">.</span>
        </h1>
      </div>
      <div className="flex gap-4">
        <button className="type-meta text-xs text-ink border-b border-transparent hover:border-ink pb-0.5">
          Sign In
        </button>
      </div>
    </nav>
  );
};

export default Header;