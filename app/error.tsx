'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-ink mb-2">Something went wrong!</h2>
      <p className="text-ink-muted text-sm max-w-xs mb-6">
        We couldn't load this page. Please try again or return home.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-ink text-white text-sm font-bold rounded-lg hover:bg-ink-light transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-4 py-2 bg-gray-100 text-ink text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
