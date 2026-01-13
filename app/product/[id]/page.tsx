import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ChevronLeft, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ReportButton } from '@/components/listing/ReportButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch product with listing details
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      listing:listings (
        id,
        name,
        slug,
        is_verified,
        location,
        tier
      ),
      category:categories (
        name
      )
    `)
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  const listing = product.listing as any;
  const category = product.category as any;

  return (
    <main className="min-h-screen bg-canvas">
      {/* Navigation */}
      <nav className="border-b border-line bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6 md:px-12">
          <Link href="/marketplace" className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors group">
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Back to Marketplace</span>
          </Link>
          <div className="flex items-center gap-2 text-xl font-black text-ink tracking-tight font-sans">
            SUBURB<span className="text-blue-600">MATES</span>
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Media Column */}
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 fade-in fill-mode-backwards">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-window border border-line relative">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50">
                  <ShoppingBag className="w-24 h-24 stroke-[1]" />
                </div>
              )}
            </div>
             <div className='flex justify-center'>
                <p className='text-xs text-ink-muted uppercase tracking-widest font-bold'>
                    Last Updated: {new Date(product.updated_at).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
                </p>
            </div>
          </div>

          {/* Info Column */}
          <div className="flex flex-col animate-in slide-in-from-bottom-8 duration-700 delay-150 fade-in fill-mode-backwards">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4 rounded-sm">
                {category?.name || 'Uncategorised'}
              </Badge>
          
              <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-4 tracking-tight leading-none font-sans">
                {product.name}
              </h1>
              <div className="text-3xl font-light text-ink font-serif italic">
                {new Intl.NumberFormat('en-AU', {
                  style: 'currency',
                  currency: 'AUD',
                }).format(product.price)}
              </div>
            </div>

            <div className="prose prose-slate max-w-none text-ink-muted mb-12 custom-prose">
              <p className="text-lg leading-relaxed whitespace-pre-line">
                {product.description || "No description provided for this product."}
              </p>
            </div>

            {/* Seller Card (Identity) */}
            <Card className="mb-8 border-line bg-white/80 shadow-card hover:shadow-pop transition-all group cursor-pointer">
                <Link href={listing?.slug ? `/u/${listing.slug}` : `/listing/${listing?.id}`}>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                             <div className="text-[10px] text-ink-muted font-bold uppercase tracking-widest">Sold By</div>
                             <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-ink group-hover:text-blue-600 transition-colors font-sans">{listing?.name}</h3>
                                {listing?.is_verified && (
                                   <Badge variant="verified" className="h-5 w-5 p-0 flex items-center justify-center rounded-full pointer-events-none">
                                        <CheckCircle2 className="h-3 w-3" />
                                   </Badge>
                                )}
                             </div>
                             <div className="text-xs font-medium text-ink-muted/80">{listing?.location}</div>
                        </div>
                        <Button variant="outline" size="sm" className="hidden sm:flex group-hover:bg-slate-50">
                            Visit Studio
                        </Button>
                    </CardContent>
                </Link>
            </Card>

            <div className="flex gap-4 items-center">
              <Button size="lg" className="flex-1 text-lg h-16 rounded-xl shadow-pop hover:shadow-floating transition-all hover:-translate-y-0.5" disabled>
                Enquire About This Product (Demo)
              </Button>
              <ReportButton 
                listingId={listing.id} 
                listingName={product.name} 
                variant="outline"
                className="h-16 w-16 rounded-xl border-line text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
              />
            </div>
            
            {/* Marketplace Truth Disclaimer */}
            <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                   <strong>Disclaimer:</strong> SuburbMates functions solely as a discovery platform. We do not facilitate payments, hold funds, or arbitrate disputes. Any transaction is strictly between you and the creator.
                </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
