
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="mb-4 text-red-600 font-mono">
        {error || 'An unknown error occurred during authentication.'}
      </p>
      <Link href="/auth/login" className="text-blue-600 hover:underline">
        Back to Login
      </Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading error details...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
