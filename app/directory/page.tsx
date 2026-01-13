import { searchListings, getCategories } from '@/lib/search';
import MapCluster from '@/components/map/MapCluster';
import { ListingCard } from '@/components/directory/ListingCard';
import { CategoryFilter } from '@/components/directory/CategoryFilter';
import { AreaFilter } from '@/components/directory/AreaFilter';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Suspense } from 'react';

// Force dynamic rendering for search
export const dynamic = 'force-dynamic';

interface DirectoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DirectoryPage({
  searchParams: searchParamsPromise,
}: DirectoryPageProps) {
  const searchParams = await searchParamsPromise;
  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const categoryName = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const locationName = typeof searchParams.location === 'string' ? searchParams.location : undefined;
  const verifiedOnly = searchParams.verified === 'true';
  const sortBy = (typeof searchParams.sort === 'string' && ['relevance', 'alphabetical', 'newest'].includes(searchParams.sort)) 
    ? searchParams.sort as 'relevance' | 'alphabetical' | 'newest' 
    : 'relevance';

  // 1. Fetch Categories (SSOT)
  const categories = await getCategories();

  // 2. Resolve Category Name -> ID
  let categoryId: string | undefined;
  if (categoryName) {
      const matched = categories.find(c => c.name === categoryName);
      if (matched) categoryId = matched.id;
  }

  // 3. Search (RPC handles all filtering & sorting)
  const listings = await searchListings({
    query,
    category: categoryId,
    location: locationName,
    filterVerified: verifiedOnly,
    sortBy: sortBy,
    limit: 50,
  });

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      {/* Header */}
      <div className="mb-8 pl-1">
          <h1 className="text-4xl type-display font-medium text-ink">
            Directory
          </h1>
          <p className="mt-2 type-meta text-ink-muted tracking-widest text-xs uppercase">
            Curated Local Creators & Businesses
          </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar (Filters) */}
          <aside className="w-full lg:w-64 flex-shrink-0">
             <div className="sticky top-24 space-y-8">
                <CategoryFilter categories={categories.filter(c => c.type === 'business')} />
                <AreaFilter />
             </div>
          </aside>

          {/* Right Content */}
          <div className="flex-1">
             {/* Search Bar & Controls */}
             <div className="mb-8 space-y-4">
                  <form className="flex gap-3" action="/directory" method="get">
                      <div className="relative flex-1 group">
                        <input
                            type="search"
                            name="q"
                            defaultValue={query}
                            placeholder="Search keywords..."
                            className="w-full rounded-full border border-ink/10 bg-white/50 px-5 py-3 text-sm focus:border-ink/30 focus:bg-white focus:ring-0 transition-all font-medium text-ink placeholder:text-ink-muted/50 shadow-sm"
                        />
                      </div>
                      {/* Preserve existing filters when searching */}
                      {categoryName && <input type="hidden" name="category" value={categoryName} />}
                      {locationName && <input type="hidden" name="location" value={locationName} />}
                      {verifiedOnly && <input type="hidden" name="verified" value="true" />}
                      {sortBy !== 'relevance' && <input type="hidden" name="sort" value={sortBy} />}
                      
                      <button 
                        type="submit"
                        className="rounded-full bg-ink px-8 py-3 text-xs font-bold text-white uppercase tracking-wider hover:bg-ink/90 shadow-lg transition-transform hover:scale-105"
                      >
                        Search
                      </button>
                  </form>
                  
                  {/* Secondary Filters Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/50 rounded-2xl border border-ink/5">
                      <div className="flex items-center gap-4">
                          {/* Verified Toggle */}
                          <Link
                             href={{
                                 pathname: '/directory',
                                 query: { 
                                     ...searchParams, 
                                     q: query,
                                     category: categoryName,
                                     location: locationName,
                                     sort: sortBy !== 'relevance' ? sortBy : undefined,
                                     verified: verifiedOnly ? undefined : 'true' 
                                 }
                             }}
                             scroll={false}
                             className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                                 verifiedOnly 
                                 ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                                 : 'bg-white border-ink/10 text-ink-muted hover:border-ink/30 hover:text-ink'
                             }`}
                          >
                              {verifiedOnly ? (
                                  <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />
                              ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                              )}
                              Verified Only
                          </Link>
                      </div>

                      <div className="flex items-center gap-3">
                          <label className="text-xs font-medium text-ink-muted uppercase tracking-wider hidden sm:block">Sort By</label>
                          <div className="flex gap-2">
                             {[
                                 { label: 'Relevance', value: 'relevance' },
                                 { label: 'Newest', value: 'newest' },
                                 { label: 'A-Z', value: 'alphabetical' },
                             ].map((option) => (
                                 <Link
                                    key={option.value}
                                    href={{
                                        pathname: '/directory',
                                        query: { 
                                            ...searchParams, 
                                            q: query,
                                            category: categoryName,
                                            location: locationName,
                                            verified: verifiedOnly ? 'true' : undefined,
                                            sort: option.value 
                                        }
                                    }}
                                    scroll={false}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                        sortBy === option.value
                                        ? 'bg-ink text-white shadow-sm'
                                        : 'text-ink-muted hover:bg-ink/5 hover:text-ink'
                                    }`}
                                 >
                                     {option.label}
                                 </Link>
                             ))}
                          </div>
                      </div>
                  </div>
             </div>

              <Suspense fallback={<p className="type-meta text-ink-muted animate-pulse">Loading directory...</p>}>
                {listings && listings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing) => {
                      // Resolve Category Name for Display
                      const catName = categories.find(c => c.id === listing.category_id)?.name || 'Unknown';
                      
                      return (
                        <ListingCard
                          key={listing.id}
                          id={listing.id}
                          name={listing.name}
                          description={listing.description}
                          location={listing.location}
                          category={catName}
                          isVerified={listing.is_verified}
                          tier={listing.tier}
                          featured={listing.featured_until ? new Date(listing.featured_until) > new Date() : false}
                          status={listing.status} // Pass Status
                          slug={listing.slug}     // Pass Slug
                          contact_email={listing.contact_email}
                          phone={listing.phone}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-ink/10 bg-canvas/50 text-center">
                    <h3 className="type-display text-xl text-ink">No results found</h3>
                    <p className="mt-2 type-meta text-ink-muted">
                        {categoryName || locationName || verifiedOnly 
                            ? `No listings match your filters.` 
                            : 'Try different logic.'}
                    </p>
                  </div>
                )}
              </Suspense>
          </div>
      </div>
    </div>
  );
}
