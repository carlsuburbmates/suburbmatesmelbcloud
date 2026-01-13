import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { OnboardingForm } from '@/components/studio/OnboardingForm';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OnboardingPage({ params: paramsPromise }: PageProps) {
  const params = await paramsPromise;
  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/auth/login');
  }

  // 2. Fetch Listing with Owner Check
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .single();

  if (listingError || !listing) {
    notFound();
  }

  // Security Check: Ensure user owns this listing
  if (listing.owner_id !== user.id) {
    redirect('/directory?error=unauthorized');
  }

  // 3. Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Welcome to your Studio</h1>
          <p className="mt-2 text-lg text-slate-600">
            Let's get your Listing Details set up. These details will be public on your Studio Page.
          </p>
        </div>

        <OnboardingForm 
          listing={listing as any} 
          categories={categories || []} 
        />
      </div>
    </div>
  );
}
