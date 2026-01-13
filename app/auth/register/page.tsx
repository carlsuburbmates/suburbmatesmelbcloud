'use client';

import { Suspense } from 'react';

import AuthForm from '@/components/ui/AuthForm';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function RegisterContent() {
    const searchParams = useSearchParams();
    const claimId = searchParams?.get('claim');

    return (
        <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h2 className="text-3xl font-medium tracking-tight text-ink type-display">
                        {claimId ? 'Register to Claim' : 'Start your journey'}
                    </h2>
                    <p className="mt-2 text-sm text-ink-muted type-meta tracking-wide">
                        {claimId ? 'Create an account to finish claiming your business.' : 'Join the Melbourne creator directory.'}
                    </p>
                </div>

                <div className="mt-8">
                    {/* We use the same AuthForm for OTP/Magic Link sign up/in */}
                    <AuthForm />
                </div>

                <p className="mt-10 text-center text-sm text-ink-muted">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-semibold leading-6 text-ink underline decoration-ink/20 hover:decoration-ink transition-all">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-canvas flex items-center justify-center text-ink-muted text-xs uppercase tracking-wider">Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
