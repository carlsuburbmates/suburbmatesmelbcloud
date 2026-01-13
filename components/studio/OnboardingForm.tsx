'use client';

import { useState } from 'react';
import { updateListing } from '@/app/actions/update-listing';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SuburbAutocomplete } from '@/components/ui/SuburbAutocomplete';
import { Council } from '@/lib/councils';

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Listing {
  id: string;
  name: string;
  category_id: string;
  description: string | null;
  phone: string | null;
  website: string | null;
  contact_email: string | null;
  abn: string | null;
  location: string | null;
}

interface OnboardingFormProps {
  listing: Listing;
  categories: Category[];
}

export function OnboardingForm({ listing, categories }: OnboardingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationCouncil, setLocationCouncil] = useState<string>(listing.location || '');
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await updateListing(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/studio?onboarding=success`);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Complete your Profile</h2>
      
      <form action={handleSubmit} className="space-y-8">
         <input type="hidden" name="listingId" value={listing.id} />

        {/* Section 1: Business Identity */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tight">1. Business Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700">Display Name</label>
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={listing.name}
                required
                placeholder="e.g. Melb Dog Walkers"
                className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border transition-all"
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-semibold text-slate-700">Business Category</label>
              <select
        name="category_id"
        id="category_id"
        defaultValue={listing.category_id}
        required
        className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border transition-all"
      >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.type})
            </option>
          ))}
      </select>
    </div>

    <div className="md:col-span-1">
      <label className="block text-sm font-semibold text-slate-700 mb-1">Business Location (Suburb)</label>
      {/* Visual Input: Suburb Autocomplete */}
      <SuburbAutocomplete
        defaultValue={listing.location || undefined} // Passes Council Name if already set
        onSelect={({ council }) => setLocationCouncil(council.name)}
        required
      />
      {/* Actual Data: Council Name */}
      <input type="hidden" name="location" value={locationCouncil} />
      <p className="text-[10px] text-slate-400 mt-1">
        We use your local council to group you with nearby businesses. 
        {locationCouncil && <span className="text-emerald-600 font-medium ml-1">✓ Assigned to {locationCouncil}</span>}
      </p>
    </div>
          </div>
        </section>

        {/* Section 2: Contact Details */}
        <section className="space-y-4 pt-4 border-t border-slate-100">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tight">2. Contact Details</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">Public Phone</label>
               <input
                type="tel"
                name="phone"
                id="phone"
                defaultValue={listing.phone || ''}
                placeholder="0400 000 000"
                className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border transition-all"
              />
             </div>
             <div>
               <label htmlFor="contact_email" className="block text-sm font-semibold text-slate-700">Public Email</label>
               <input
                type="email"
                name="contact_email"
                id="contact_email"
                defaultValue={listing.contact_email || ''}
                placeholder="hello@business.com"
                className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border transition-all"
              />
             </div>
             <div className="md:col-span-2">
               <label htmlFor="website" className="block text-sm font-semibold text-slate-700">Website URL</label>
               <input
                type="url"
                name="website"
                id="website"
                defaultValue={listing.website || ''}
                placeholder="https://www.business.com"
                className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border transition-all"
              />
             </div>
          </div>
        </section>

        {/* Section 3: Professional Profile */}
        <section className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tight">3. Professional Profile</h3>
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700">Description</label>
             <p className="text-xs text-slate-500 mb-2">Write a clear summary of your services to help customers choose you.</p>
             <textarea
              name="description"
              id="description"
              rows={5}
              defaultValue={listing.description || ''}
              className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border transition-all"
              placeholder="e.g. Providing local dog walking services since 2010..."
            />
          </div>
        </section>

        {/* ABN Proof */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
           <label htmlFor="abn" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ownership Proof (ABN)</label>
           <div className="relative">
             <input
               type="text"
               name="abn"
               id="abn"
               defaultValue={listing.abn || ''}
               placeholder="11-digit ABN"
               className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border font-mono transition-all"
             />
             <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className={`w-2 h-2 rounded-full ${listing.abn ? 'bg-verified' : 'bg-slate-300'}`} title={listing.abn ? 'Verified' : 'Pending'} />
             </div>
           </div>
           <p className="mt-2 text-[10px] text-slate-400 italic">Required for verified status. Luhn checksum enforced.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100 font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center rounded-2xl bg-slate-900 px-10 py-4 font-bold text-white shadow-xl transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Publish to Directory
          </button>
        </div>

      </form>
    </div>
  );
}
