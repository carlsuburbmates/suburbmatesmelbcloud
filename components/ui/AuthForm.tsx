'use client';

import { useState } from 'react';
import { signInWithMagicLink } from '@/lib/auth';
import { useSearchParams } from 'next/navigation';

const AuthForm = () => {
  const searchParams = useSearchParams();
  const next = searchParams?.get('next');
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await signInWithMagicLink(email, next || undefined);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Check your email for the magic link!');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-white border border-line rounded-xl shadow-sm">
      <h3 className="type-display text-2xl mb-4 text-ink font-serif">Sign In</h3>
      <p className="text-sm text-ink-muted mb-6">
        Enter your email to receive a passwordless magic link.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="type-meta text-[10px] text-ink-muted block mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white border border-line py-3 px-4 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-white py-3 rounded-lg type-meta text-xs font-medium hover:bg-black transition-colors shadow-lg disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>
      {message && (
        <p className="mt-4 text-xs text-center text-ink-muted animate-slide-up">
          {message}
        </p>
      )}
    </div>
  );
};

export default AuthForm;
