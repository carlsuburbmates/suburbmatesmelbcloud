import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface ClaimPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClaimPage({ params: paramsPromise }: ClaimPageProps) {
  const params = await paramsPromise;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
           {/* Icon or Logo */}
           <span className="text-2xl">👋</span>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900">
          Is this you?
        </h1>
        
        <p className="text-slate-600">
          Claim this listing to update your details, add photos, and get verified.
        </p>
        
        <div className="pt-4">
          <Link 
            href={`/register?claim=${params.id}`} 
            className="block w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Claim Now
          </Link>
          
          <Link href="/directory" className="mt-4 block text-sm text-slate-500 hover:underline">
            Cancel and return to Directory
          </Link>
        </div>
      </div>
    </div>
  );
}
