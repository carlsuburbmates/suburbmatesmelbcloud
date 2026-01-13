import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { MapPin, Globe, Instagram, Package, MessageCircle, Share2, ArrowLeft } from 'lucide-react';
import { ShareModal } from '@/components/share/ShareModal';
import { ReportButton } from '@/components/listing/ReportButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getListingBySlug(slug: string) {
    const { data } = await supabase
        .from('listings')
        .select(`*, category:categories(name), products(*)`)
        .eq('slug', slug)
        .single();
    return data;
}

export default async function ProListingPage({ params: paramsPromise }: Props) {
    const params = await paramsPromise;
    const listing = await getListingBySlug(params.slug);
    
    if (!listing) notFound();

    // Only Pro allowed to use this view? Or maybe we allow Basic too but with ads? 
    // Plan says "Pro Mini-sites". So let's check tier.
    // If not pro, redirect to standard listing page?
    // Actually, creating a robust /u/slug requires slug uniqueness. 
    // Only Pro users can set slugs via Studio. 
    // So if a listing has a slug, they probably set it when they were Pro.
    // If they downgrade, we might want to disable it. 
    // But for MVP, if it has a slug, we show it.
    
    const branding = listing.branding || {};
    const social = listing.social_links || {};
    const theme = branding.theme || 'swiss';
    const primaryColor = branding.primaryColor || '#3b82f6';

    // Theme Logic
    const isDark = theme === 'monochrome'; // Only monochrome is 'dark' in new set.
    
    const bgClass = {
        'swiss': 'bg-canvas text-ink',
        'editorial': 'bg-stone-100 text-stone-900',
        'monochrome': 'bg-black text-white'
    }[theme as string] || 'bg-canvas text-ink'; // Default to Swiss

    const cardClass = isDark ? 'bg-white/10 border-white/10' : 'bg-white border-ink/10 shadow-window'; // UPDATED: Semantic border, window shadow
    const textMuted = isDark ? 'text-white/60' : 'text-ink-muted'; // UPDATED: Semantic muted

    return (
        <main className={`min-h-screen ${bgClass} pb-24`}>
             {/* Header / Nav */}
             <nav className="p-6 flex justify-between items-center">
                 <Link href="/" className={`font-bold tracking-tight type-display text-xl ${isDark ? 'text-white' : 'text-ink'}`}>
                    suburbmates
                 </Link>
                 <div className="flex items-center gap-2">
                     <ShareModal 
                    url={`${process.env.NEXT_PUBLIC_SITE_URL}/u/${listing.slug}`} 
                    title={listing.name} 
                 />
                 <ReportButton listingId={listing.id} listingName={listing.name} variant="ghost" className="text-slate-400 hover:text-red-500" />
             </div>
         </nav>

             <div className="container mx-auto max-w-2xl px-6 pt-10">
                 {/* Hero Identity */}
                 <div className="text-center mb-12">
                     <div className={`w-24 h-24 mx-auto rounded-3xl mb-6 shadow-2xl flex items-center justify-center text-4xl font-bold ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                        {listing.name.charAt(0)}
                     </div>
                     <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">{listing.name}</h1>
                     <div className={`flex items-center justify-center gap-2 ${textMuted} font-medium`}>
                        <MapPin className="w-4 h-4" />
                        {listing.location} · {listing.category?.name}
                     </div>
                     
                     {/* Socials */}
                     <div className="flex justify-center gap-4 mt-6">
                        {social.instagram && (
                            <a href={`https://instagram.com/${social.instagram}`} target="_blank" className={`p-3 rounded-full ${cardClass} hover:scale-110 transition-transform`}>
                                <Instagram className="w-5 h-5" />
                            </a>
                        )}
                        {social.website && (
                             <a href={social.website} target="_blank" className={`p-3 rounded-full ${cardClass} hover:scale-110 transition-transform`}>
                                <Globe className="w-5 h-5" />
                            </a>
                        )}
                     </div>
                 </div>

                 {/* Products Grid */}
                 <div className="grid gap-4">
                     {listing.products?.map((product: any) => (
                         <div key={product.id} className={`p-4 rounded-2xl flex gap-4 items-center ${cardClass}`}>
                             <div className={`w-20 h-20 rounded-xl flex-shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`} />
                             <div className="flex-1 min-w-0">
                                 <h3 className="font-bold text-lg leading-tight mb-1">{product.name}</h3>
                                 <p className={`text-sm ${textMuted} line-clamp-1`}>{product.description}</p>
                             </div>
                             <div className="font-bold text-lg">${product.price}</div>
                         </div>
                     ))}
                 </div>

                 {/* Contact Fab */}
                 <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6">
                     <button 
                        style={{ backgroundColor: primaryColor }}
                        className="w-full h-14 rounded-full font-bold text-white shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                     >
                         <MessageCircle className="w-5 h-5" />
                         Contact {listing.name}
                     </button>
                 </div>
             </div>
        </main>
    );
}
