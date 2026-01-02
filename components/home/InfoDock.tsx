import React from 'react';

const InfoDock = () => {
  return (
    <section id="info-dock" className="px-6 py-12 flex justify-center items-start gap-6">
      {/* OBJECT 1: PROTOCOL (Dark) */}
      <div className="flex flex-col items-center gap-3 cursor-pointer group">
        <div className="w-20 h-20 bg-ink rounded-full flex items-center justify-center shadow-pop border-2 border-white/10 transform transition-transform group-hover:scale-105 active:scale-95">
          <span className="text-2xl filter drop-shadow-sm">⚖️</span>
        </div>
        <span className="type-meta text-[10px] text-ink tracking-widest group-hover:text-gold transition-colors">
          Protocol
        </span>
      </div>
      {/* OBJECT 2: Tiers (Gold) */}
      <div className="flex flex-col items-center gap-3 cursor-pointer group">
        <div className="w-20 h-20 bg-gradient-to-br from-white to-gold/20 rounded-full flex items-center justify-center shadow-pop border-2 border-gold/30 transform transition-transform group-hover:scale-105 active:scale-95">
          <span className="text-2xl filter drop-shadow-sm">💎</span>
        </div>
        <span className="type-meta text-[10px] text-ink tracking-widest group-hover:text-gold transition-colors">
          Tiers
        </span>
      </div>
      {/* OBJECT 3: WHO WE ARE (Canvas) */}
      <div className="flex flex-col items-center gap-3 cursor-pointer group">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-pop border-2 border-line transform transition-transform group-hover:scale-105 active:scale-95">
          <span className="text-2xl filter drop-shadow-sm">🇦🇺</span>
        </div>
        <span className="type-meta text-[10px] text-ink tracking-widest group-hover:text-gold transition-colors">
          Manifesto
        </span>
      </div>
    </section>
  );
};

export default InfoDock;