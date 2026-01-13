"use client";

import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';

interface StudioGalleryProps {
  images?: string[];
  name: string;
}

export function StudioGallery({ images = [], name }: StudioGalleryProps) {
  const hasImages = images.length > 0;

  return (
    <section className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] bg-canvas overflow-hidden">
      {hasImages ? (
        // Image Carousel (Future Proofing)
        <div className="flex overflow-x-auto snap-x snap-mandatory h-full hide-scrollbar">
          {images.map((src, i) => (
            <div key={i} className="flex-shrink-0 w-full md:w-2/3 h-full snap-center relative">
               <img src={src} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
            </div>
          ))}
        </div>
      ) : (
        // Premium Placeholder / Abstract Cover
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center z-10 p-6 text-center"
          >
            <div className="w-24 h-24 mb-6 rounded-3xl bg-white shadow-soft flex items-center justify-center border border-ink/5">
               <span className="text-4xl font-serif text-ink opacity-80">{name.charAt(0)}</span>
            </div>
            <div className="space-y-2">
                 <div className="h-1 w-12 bg-gold/50 mx-auto rounded-full mb-4" />
                 <h2 className="type-meta text-xs text-ink-muted uppercase tracking-[0.2em]">Clinical Sanctuary</h2>
                 <p className="text-ink-muted/50 text-xs italic">Photography Unavailable</p>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-canvas to-transparent" />
        </div>
      )}
    </section>
  );
}
