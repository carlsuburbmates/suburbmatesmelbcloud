"use client";

import React, { useState } from 'react';
import { ContentModal } from './ContentModal';

const InfoDock = () => {
  const [modalType, setModalType] = useState<"protocol" | "membership" | "identity" | null>(null);

  return (
    <>
      <section id="info-dock" className="px-6 py-12 flex justify-center items-start gap-6">
        {/* OBJECT 1: PROTOCOL (Dark) */}
        <div onClick={() => setModalType('protocol')} className="flex flex-col items-center gap-3 cursor-pointer group">
          <div className="w-20 h-20 bg-ink rounded-full flex items-center justify-center shadow-pop border-2 border-white/10 transform transition-transform group-hover:scale-105 active:scale-95">
            <span className="text-2xl filter drop-shadow-sm">⚖️</span>
          </div>
          <span className="type-meta text-[10px] text-ink tracking-widest group-hover:text-ink-muted transition-colors">
            Protocol
          </span>
        </div>

        {/* OBJECT 2: TIERS (Gold) */}
        <div onClick={() => setModalType('membership')} className="flex flex-col items-center gap-3 cursor-pointer group">
          <div className="w-20 h-20 bg-gradient-to-br from-white to-gold/20 rounded-full flex items-center justify-center shadow-pop border-2 border-gold/30 transform transition-transform group-hover:scale-105 active:scale-95">
            <span className="text-2xl filter drop-shadow-sm">💎</span>
          </div>
          <span className="type-meta text-[10px] text-ink tracking-widest group-hover:text-ink-muted transition-colors">
            Tiers
          </span>
        </div>

        {/* OBJECT 3: MANIFESTO (Canvas) */}
        <div onClick={() => setModalType('identity')} className="flex flex-col items-center gap-3 cursor-pointer group">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-pop border-2 border-line transform transition-transform group-hover:scale-105 active:scale-95">
            <span className="text-2xl filter drop-shadow-sm">🇦🇺</span>
          </div>
          <span className="type-meta text-[10px] text-ink tracking-widest group-hover:text-ink-muted transition-colors">
            Manifesto
          </span>
        </div>
      </section>

      <ContentModal 
        isOpen={!!modalType} 
        type={modalType} 
        onClose={() => setModalType(null)} 
      />
    </>
  );
};

export default InfoDock;