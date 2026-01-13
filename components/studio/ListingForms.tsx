'use client';

import { useState } from 'react';
import { updateListing } from '@/app/actions/update-listing';
import { updateDesign } from '@/app/actions/design';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SuburbAutocomplete } from '@/components/ui/SuburbAutocomplete';
import { MediaUploader } from './MediaUploader';

interface ListingFormsProps {
  listing: any;
  categories: any[];
}

export function IdentityForm({ listing, categories }: ListingFormsProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await updateListing(formData);
    setLoading(false);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Identity updated');
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="listingId" value={listing.id} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700">Display Name</label>
          <input
            type="text"
            name="name"
            defaultValue={listing.name}
            required
            className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border"
          />
        </div>

        <div>
          <label htmlFor="category_id" className="block text-sm font-semibold text-slate-700">Category</label>
          <select
            name="category_id"
            defaultValue={listing.category_id}
            required
            className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Description</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={listing.description || ''}
            className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Identity'}
        </button>
      </div>
    </form>
  );
}

export function LocationForm({ listing }: { listing: any }) {
    const [loading, setLoading] = useState(false);
    const [council, setCouncil] = useState(listing.location || '');

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await updateListing(formData);
        setLoading(false);
        if(result?.error) toast.error(result.error);
        else toast.success('Location updated');
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="listingId" value={listing.id} />
            <input type="hidden" name="location" value={council} />
            
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Business Location (Suburb)</label>
                <SuburbAutocomplete 
                    defaultValue={listing.location}
                    onSelect={(data) => setCouncil(data.council.name)}
                    required
                />
                <p className="text-xs text-slate-400 mt-1">Updates your Local Government Area assignment.</p>
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Location'}
                </button>
            </div>
        </form>
    );
}

export function ContactForm({ listing }: { listing: any }) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await updateListing(formData);
        setLoading(false);
        if(result?.error) toast.error(result.error);
        else toast.success('Contact info updated');
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="listingId" value={listing.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700">Phone</label>
                    <input type="tel" name="phone" defaultValue={listing.phone || ''} className="input-field" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700">Email</label>
                    <input type="email" name="contact_email" defaultValue={listing.contact_email || ''} className="input-field" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Website</label>
                    <input type="url" name="website" defaultValue={listing.website || ''} className="input-field" />
                </div>
            </div>
             <div className="flex justify-end">
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Contact'}
                </button>
            </div>
        </form>
    );
}

export function MediaForm({ listing }: { listing: any }) {
    const [logo, setLogo] = useState(listing.branding?.logo || '');
    const [cover, setCover] = useState(listing.branding?.coverImage || '');

    // Existing branding to merge
    const currentBranding = listing.branding || { theme: 'swiss' };

    const handleSave = async (newLogo?: string, newCover?: string) => {
        const finalLogo = newLogo !== undefined ? newLogo : logo;
        const finalCover = newCover !== undefined ? newCover : cover;

        setLogo(finalLogo);
        setCover(finalCover);

        const payload = {
            slug: listing.slug || listing.id, // Fallback if slug missing
            branding: {
                ...currentBranding,
                logo: finalLogo,
                coverImage: finalCover
            },
            social_links: listing.social_links || {} // Pass through
        };

        const result = await updateDesign(listing.id, payload);
        if(result?.error) toast.error(result.error);
        else toast.success('Media assets updated');
    };

    return (
        <div className="grid grid-cols-2 gap-6">
            <MediaUploader 
                bucket="listing-images"
                path={`${listing.id}/branding`}
                label="Business Logo"
                aspectRatio="square"
                defaultValue={logo}
                onUploadComplete={(url) => handleSave(url || '', undefined)}
            />
            <MediaUploader 
                bucket="listing-images"
                path={`${listing.id}/branding`}
                label="Cover Image"
                aspectRatio="wide"
                defaultValue={cover}
                onUploadComplete={(url) => handleSave(undefined, url || '')}
            />
        </div>
    );
}
