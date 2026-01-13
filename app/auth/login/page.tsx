import { Suspense } from 'react';
import AuthForm from '@/components/ui/AuthForm';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - SuburbMates',
  description: 'Sign in to access your Creator Studio.',
};

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h2 className="text-3xl font-medium tracking-tight text-ink type-display">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-ink-muted type-meta tracking-wide">
                        Sign in to your account
                    </p>
                </div>

                <div className="mt-8">
                    <Suspense fallback={<div className="text-ink-muted text-center text-xs">Loading to form...</div>}>
                        <AuthForm />
                    </Suspense>
                </div>

                <p className="mt-10 text-center text-sm text-ink-muted">
                    Need an account?{' '}
                    <span className="font-semibold leading-6 text-ink underline decoration-ink/20 hover:decoration-ink transition-all">
                        Just enter your email above.
                    </span>
                </p>
            </div>
        </div>
    );
}
