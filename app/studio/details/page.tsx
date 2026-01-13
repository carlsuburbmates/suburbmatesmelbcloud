import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { IdentityForm, LocationForm, ContactForm, MediaForm } from '@/components/studio/ListingForms';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function ListingDetailsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch Listing owned by user
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!listing) {
    redirect('/studio?error=no_listing');
  }

  // Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-ink font-serif tracking-tight">Listing Details</h1>
        <p className="mt-2 text-lg text-ink-muted">
          Manage your canonical business information. This is the single source of truth for your public presence.
        </p>
      </div>

      <div className="space-y-8">
        {/* Media Section */}
        <Card>
            <CardHeader>
                <CardTitle className="font-serif">Media Assets</CardTitle>
                <CardDescription>Visual identifiers for your brand.</CardDescription>
            </CardHeader>
            <CardContent>
                <MediaForm listing={listing} />
            </CardContent>
        </Card>

        {/* Identity Section */}
        <Card>
            <CardHeader>
                <CardTitle className="font-serif">Identity & Category</CardTitle>
                <CardDescription>Core details about what you do.</CardDescription>
            </CardHeader>
            <CardContent>
                <IdentityForm listing={listing} categories={categories || []} />
            </CardContent>
        </Card>

        {/* Location Section */}
        <Card>
            <CardHeader>
                <CardTitle className="font-serif">Location</CardTitle>
                <CardDescription>Where your specific services are based.</CardDescription>
            </CardHeader>
            <CardContent>
                <LocationForm listing={listing} />
            </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
            <CardHeader>
                <CardTitle className="font-serif">Public Contact</CardTitle>
                <CardDescription>How customers can reach you directly.</CardDescription>
            </CardHeader>
            <CardContent>
                <ContactForm listing={listing} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
