'use client';

import { useState } from 'react';
import { claimListing } from '@/app/actions/claim-listing';
import { useFormStatus } from 'react-dom';

interface ClaimModalProps {
  listingId: string;
  isOpen: boolean;
  onClose: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 sm:w-auto"
    >
      {pending ? 'Verifying...' : 'Verify & Claim'}
    </button>
  );
}

export function ClaimModal({ listingId, isOpen, onClose }: ClaimModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function clientAction(formData: FormData) {
    const result = await claimListing(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      // Success is handled by redirect in server action
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">Claim this Listing</h2>
        <p className="mt-2 text-sm text-slate-500">
          To verify ownership, please enter your Australian Business Number (ABN).
          We perform an instant check with the Australian Business Register.
        </p>

        <form action={clientAction} className="mt-6 space-y-4">
          <input type="hidden" name="listingId" value={listingId} />
          
          <div>
            <label htmlFor="abn" className="block text-sm font-medium text-slate-700">
              ABN (11 Digits)
            </label>
            <input
              type="text"
              name="abn"
              id="abn"
              required
              maxLength={11}
              minLength={11}
              placeholder="e.g. 51824753556"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
