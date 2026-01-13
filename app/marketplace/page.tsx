// ... imports ...
import { searchProducts, getCategories } from '@/lib/search';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { CategoryFilter } from '@/components/directory/CategoryFilter';
import { Suspense } from 'react';
import { Search } from 'lucide-react';

// Force dynamic because of Search Params and DB calls
export const dynamic = 'force-dynamic';

interface MarketplacePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MarketplacePage({
  searchParams: searchParamsPromise,
}: MarketplacePageProps) {
  const searchParams = await searchParamsPromise;
  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const categoryName = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const locationParam = typeof searchParams.location === 'string' ? searchParams.location : undefined;

  // 1. Fetch Categories (SSOT)
  const categories = await getCategories();
  const productCategories = categories.filter(c => c.type === 'product');

  // 2. Resolve Category Name -> ID
  let categoryId: string | undefined;
  if (categoryName) {
      const matched = productCategories.find(c => c.name === categoryName);
      if (matched) categoryId = matched.id;
  }

  // 3. Search Data
  const products = await searchProducts({
    query,
    category: categoryId,
    location: locationParam,
    limit: 50,
  });

  return (
    <div className="min-h-screen bg-canvas text-ink pb-20">
       {/* Hero / Header Section */}
       <div className="bg-ink text-white pt-24 pb-20 px-6 relative overflow-hidden">
          {/* Abstract Pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="container mx-auto max-w-6xl relative z-10">
            <h1 className="text-5xl md:text-7xl font-light type-display mb-6 tracking-tight">
              Marketplace
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-serif max-w-2xl italic">
              A curated collection of digital assets, services, and goods from Melbourne&apos;s finest creators.
            </p>
          </div>
       </div>

       <div className="container mx-auto max-w-7xl px-6 -mt-8 relative z-20">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
               <div className="sticky top-24 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-ink/5 shadow-window">
                  {/* Category Filter */}
                  <div className="mb-6">
                    <CategoryFilter categories={productCategories} basePath="/marketplace" />
                  </div>
                  
                  {/* Location Filter (Temporary Input) */}
                  <form action="/marketplace" method="get" className="space-y-2">
                    <label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-ink-muted">Location</label>
                    <input
                      id="location"
                      type="text"
                      name="location" 
                      defaultValue={locationParam}
                      placeholder="Enter suburb..."
                      className="w-full bg-white border border-ink/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-ink focus:border-ink"
                    />
                    {categoryName && <input type="hidden" name="category" value={categoryName} />}
                    {query && <input type="hidden" name="q" value={query} />}
                    <button type="submit" className="w-full bg-ink/5 hover:bg-ink/10 text-ink text-xs font-bold py-2 rounded-lg transition-colors">
                      Update Location
                    </button>
                  </form>
               </div>
            </aside>
          
            {/* Main Content */}
            <div className="flex-1">
               {/* Search Bar - Floating */}
               <div className="bg-white p-2 rounded-full shadow-floating flex items-center gap-2 mb-12 border border-ink/5 max-w-2xl">
                  <div className="pl-4 text-ink-muted">
                    <Search className="w-5 h-5" />
                  </div>
                  <form className="flex-1 flex gap-2" action="/marketplace" method="get">
                    <input
                      type="search"
                      name="q"
                      defaultValue={query}
                      placeholder="Search for products..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-ink placeholder:text-ink-muted/50 font-medium py-3"
                    />
                    {categoryName && <input type="hidden" name="category" value={categoryName} />}
                    {locationParam && <input type="hidden" name="location" value={locationParam} />}
                    <button 
                      type="submit"
                      className="bg-ink text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-ink/90 transition-transform active:scale-95"
                    >
                      Search
                    </button>
                  </form>
               </div>

                {/* Grid */}
                <Suspense fallback={<div className="text-center py-20 animate-pulse text-ink-muted">Loading marketplace...</div>}>
                  {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {products.map((product: any) => (
                        <div key={product.id} className="group">
                           <ProductCard
                             id={product.id}
                             name={product.name}
                             price={product.price}
                             listingName={product.listing_name}
                             listingId={product.listing_id}
                             listingSlug={product.listing_slug}
                             listingIsVerified={product.listing_is_verified}
                             categoryName={product.category_name}
                             updatedAt={product.updated_at}
                             imageUrl={product.image_url} 
                           />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-ink/10 bg-white/50 text-center">
                      <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center mb-4 text-ink-muted">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-ink mb-2">No products found</h3>
                      <p className="text-ink-muted">
                          {categoryName ? `We couldn't find any ${categoryName} products.` : 'Try adjusting your search terms.'}
                      </p>
                    </div>
                  )}
                </Suspense>
            </div>
          </div>
       </div>
    </div>
  );
}
