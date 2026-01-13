'use client';

import { useState } from 'react';
import { ClaimModal } from './ClaimModal';
import { ShieldCheck } from 'lucide-react';

interface ClaimButtonProps {
  listingId: string;
}

export function ClaimButton({ listingId }: ClaimButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95"
      >
        <ShieldCheck className="h-5 w-5" />
        Claim this Business
      </button>

      <ClaimModal
        listingId={listingId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
