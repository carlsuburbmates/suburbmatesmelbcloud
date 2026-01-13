'use client';

import { useState } from 'react';
import { updateDesign } from '@/app/actions/design';
import { Loader2, Save, Sparkles, Layout, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

interface VibeTunerProps {
    listingId: string;
    initialData: {
        slug?: string;
        branding?: any;
        social_links?: any;
    };
}

export function VibeTuner({ listingId, initialData }: VibeTunerProps) {
    const [loading, setLoading] = useState(false);
    const [slug, setSlug] = useState(initialData.slug || '');
    const [theme, setTheme] = useState(initialData.branding?.theme || 'swiss');
    const [color, setColor] = useState(initialData.branding?.primaryColor || '#3b82f6');
    const [instagram, setInstagram] = useState(initialData.social_links?.instagram || '');
    const [website, setWebsite] = useState(initialData.social_links?.website || '');

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = {
                slug,
                branding: { theme, primaryColor: color },
                social_links: { instagram, website }
            };
            console.log('Client VibeTuner Saving:', formData);
            
            const res = await updateDesign(listingId, formData);
            if (res.error) throw new Error(res.error);
            
            toast.success('Mini-site updated!');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const themes = [
        { id: 'swiss', name: 'Swiss', color: 'bg-white border-slate-200 text-slate-900' },
        { id: 'editorial', name: 'Editorial', color: 'bg-stone-100 text-stone-900' },
        { id: 'monochrome', name: 'Monochrome', color: 'bg-black text-white' },
    ];

    return (
        <div className="space-y-8">
            {/* Slug Section */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Layout className="w-5 h-5 text-blue-500" />
                    Custom URL
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">suburbmates.com.au/u/</span>
                    <input 
                        type="text" 
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="my-business-name"
                        className="flex-1 p-2 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </section>

            {/* Branding Section */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    Visual Theme
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`p-4 rounded-xl font-bold transition-all ${t.color} ${theme === t.id ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : 'opacity-80 hover:opacity-100'}`}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>

                <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700">Primary Colour</label>
                     <div className="flex items-center gap-3">
                        <input 
                            type="color" 
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                        />
                        <span className="text-slate-500 text-sm uppercase">{color}</span>
                     </div>
                </div>
            </section>
            
             {/* Socials Section */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Social Links</h3>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Instagram Username</label>
                        <div className="flex items-center gap-2">
                             <span className="text-slate-400">@</span>
                             <input 
                                type="text"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                className="flex-1 p-2 border border-slate-200 rounded-lg" 
                                placeholder="mybusiness"
                            />
                        </div>
                     </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                         <input 
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-lg" 
                            placeholder="https://"
                        />
                     </div>
                </div>
            </section>

            {/* Save Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 md:relative md:bg-transparent md:border-0 md:p-0 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                </button>
            </div>
        </div>
    );
}
