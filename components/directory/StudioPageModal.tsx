import React from 'react';
import { Database } from '@/types/supabase';

type Listing = Database['public']['Tables']['listings']['Row'];

interface StudioPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Listing | null;
}

const StudioPageModal: React.FC<StudioPageModalProps> = ({ isOpen, onClose, creator }) => {
  if (!isOpen || !creator) {
    return null;
  }

  return (
    <dialog
      className="fixed inset-0 z-50 w-full h-full bg-transparent p-0 m-0 backdrop:bg-ink/30 backdrop:backdrop-blur-sm flex items-end sm:items-center justify-center"
      open={isOpen}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:w-[400px] h-[90vh] sm:h-auto sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden relative flex flex-col modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-ink hover:bg-white transition-colors shadow-sm"
        >
          &times;
        </button>
        <div className="flex-1 overflow-y-auto hide-scrollbar relative bg-white pb-40">
          <div className="sticky top-0 z-0 h-64 w-full">
            {creator.id && (
              <img
                src={`https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600`} // Placeholder for now
                alt={creator.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h3 className="text-3xl font-light leading-none mb-2 font-serif drop-shadow-md">
                {creator.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="type-meta text-[9px] bg-white text-ink px-1.5 py-0.5 rounded shadow-sm">
                  {creator.tier}
                </span>
                {creator.is_verified && (
                  <span className="type-meta text-[9px] flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-verified"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="relative z-10 bg-white -mt-4 rounded-t-3xl p-6 min-h-[50vh]">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <div className="flex gap-4 mb-8 border-b border-line pb-6">
              <div className="flex-1">
                <span className="text-[10px] text-ink-muted uppercase tracking-widest block mb-1">
                  Location
                </span>
                <span className="text-sm text-ink font-medium">{creator.location}</span>
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-ink-muted uppercase tracking-widest block mb-1">
                  Category
                </span>
                <span className="text-sm text-ink font-medium">Digital Creator</span>
              </div>
            </div>
            <h4 className="type-meta text-xs text-ink mb-3">About the Studio</h4>
            <p className="text-base text-ink font-light leading-relaxed mb-8">
              {creator.description}
            </p>
            <div className="mt-8 pt-8 border-t border-line text-center">
              <p className="text-[10px] text-ink-muted">Member since 2024 &bull; Melbourne</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-white via-white/95 to-transparent z-20 flex flex-col gap-3">
          <button className="w-full bg-ink text-white py-4 rounded-xl type-meta text-xs hover:bg-black transition-colors shadow-lg">
            View Full Studio Page
          </button>
          <button className="w-full border border-line bg-white/80 backdrop-blur-sm text-ink py-4 rounded-xl type-meta text-xs hover:bg-white transition-colors">
            Contact
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default StudioPageModal;
