"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "protocol" | "membership" | "identity" | null;
}

export function ContentModal({ isOpen, onClose, type }: ContentModalProps) {
  const [activeTab, setActiveTab] = useState<"buyers" | "creators">("buyers");

  if (!isOpen || !type) return null;

  const getTitle = () => {
    switch (type) {
      case "protocol":
        return "Protocol";
      case "membership":
        return "Tiers";
      case "identity":
        return "Manifesto";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-ink/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Panel */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[80vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex justify-between items-center bg-gray-50/50">
          <h3 className="type-display text-2xl text-ink">{getTitle()}</h3>
          <button 
            onClick={onClose}
            className="text-ink-muted hover:text-ink transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* PROTOCOL CONTENT */}
          {type === "protocol" && (
            <>
              {/* Logic Switch */}
              <div className="flex justify-center mb-2">
                <div className="bg-white border border-gray-200 p-1 rounded-full flex gap-1 shadow-sm">
                  <button
                    onClick={() => setActiveTab("buyers")}
                    className={`type-meta text-xs tracking-wide px-4 py-2 rounded-full transition-all border ${
                      activeTab === "buyers"
                        ? "bg-ink text-white font-bold border-ink"
                        : "text-ink font-medium border-transparent bg-transparent hover:bg-gray-50"
                    }`}
                  >
                    BRANDS & BUYERS
                  </button>
                  <button
                    onClick={() => setActiveTab("creators")}
                    className={`type-meta text-xs tracking-wide px-4 py-2 rounded-full transition-all border ${
                      activeTab === "creators"
                        ? "bg-ink text-white font-bold border-ink"
                        : "text-ink font-medium border-transparent bg-transparent hover:bg-gray-50"
                    }`}
                  >
                    CREATORS
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "buyers" ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex gap-4 items-start">
                    <span className="type-meta text-ink bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full text-[10px] shrink-0">1</span>
                    <div>
                      <h4 className="type-meta text-xs text-ink mb-1">Search</h4>
                      <p className="text-sm font-light text-ink-muted">Find verified creative talent by category or location.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="type-meta text-ink bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full text-[10px] shrink-0">2</span>
                    <div>
                      <h4 className="type-meta text-xs text-ink mb-1">Evaluate</h4>
                      <p className="text-sm font-light text-ink-muted">View portfolios, verified status, and rates.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="type-meta text-ink bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full text-[10px] shrink-0">3</span>
                    <div>
                      <h4 className="type-meta text-xs text-ink mb-1">Acquire</h4>
                      <p className="text-sm font-light text-ink-muted">Buy digital assets directly from source.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="flex gap-4 items-start">
                    <span className="type-meta text-white bg-ink w-6 h-6 flex items-center justify-center rounded-full text-[10px] shrink-0">1</span>
                    <div>
                      <h4 className="type-meta text-xs text-ink mb-1">Claim</h4>
                      <p className="text-sm font-light text-ink-muted">Claim your studio listing.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="type-meta text-white bg-ink w-6 h-6 flex items-center justify-center rounded-full text-[10px] shrink-0">2</span>
                    <div>
                      <h4 className="type-meta text-xs text-ink mb-1">Publish</h4>
                      <p className="text-sm font-light text-ink-muted">Sell 3 digital items on Basic, 10 on Pro.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="type-meta text-white bg-ink w-6 h-6 flex items-center justify-center rounded-full text-[10px] shrink-0">3</span>
                    <div>
                      <h4 className="type-meta text-xs text-ink mb-1">Verify</h4>
                      <p className="text-sm font-light text-ink-muted">Optional ABN check to build trust.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TIERS CONTENT */}
          {type === "membership" && (
            <div className="bg-white border border-line rounded-lg overflow-hidden shadow-sm">
              <div className="grid grid-cols-2 border-b border-line bg-gray-50">
                <div className="p-3 border-r border-line text-center">
                  <h4 className="type-meta text-sm text-ink">BASIC</h4>
                  <span className="type-meta text-[10px] text-ink-muted">FREE</span>
                </div>
                <div className="p-3 text-center relative">
                  <div className="absolute top-0 right-0 bg-gold text-white text-[8px] px-2 py-0.5 type-meta font-bold rounded-bl-sm">BEST</div>
                  <h4 className="type-meta text-sm text-gold">PRO</h4>
                  <span className="type-meta text-[10px] text-ink">$19/MO</span>
                </div>
              </div>
              <div className="grid grid-cols-2 text-center text-xs font-light text-ink-muted">
                <div className="p-3 border-r border-b border-line">3 Products</div>
                <div className="p-3 border-b border-line font-medium text-ink">10 Products</div>
                
                <div className="p-3 border-r border-b border-line">Studio Page</div>
                <div className="p-3 border-b border-line font-medium text-ink">Mini-site Mode</div>
                
                <div className="p-3 border-r border-line opacity-30">&mdash;</div>
                <div className="p-3 font-medium text-ink">Priority Rank</div>
              </div>
              <div className="grid grid-cols-2 border-t border-line">
                <button className="p-3 type-meta text-[10px] hover:bg-gray-50 border-r border-line transition-colors">
                  INITIATE_BASIC
                </button>
                <button className="p-3 type-meta text-[10px] bg-ink text-white hover:bg-black transition-colors font-bold">
                  UPGRADE_PRO
                </button>
              </div>
            </div>
          )}

          {/* MANIFESTO CONTENT */}
          {type === "identity" && (
            <div className="space-y-4 text-sm font-light text-ink leading-relaxed">
              <p>
                SuburbMates is a discovery layer for Melbourne's digital creative ecosystem. 
                We exist to map the local talent economy without the noise of global gig platforms.
              </p>
              <p className="font-medium text-ink">Our Core Tenets:</p>
              <ul className="list-disc pl-4 space-y-2 text-ink-muted">
                <li>
                  <strong>Local Relevance:</strong> We only list creators based in Melbourne. Context matters.
                </li>
                <li>
                  <strong>Radical Truth:</strong> No fake "trusted by" badges. No inflated metrics. Just verified data.
                </li>
                <li>
                  <strong>Direct Commerce:</strong> We are not the merchant of record. You buy directly from the creator's Stripe.
                </li>
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
