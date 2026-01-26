import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'
import { 
  STATIC_ROUTES, 
  CATEGORY_ROUTES,
} from '@/lib/routes'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://suburbmates.com.au'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // 1. Static pages from route registry (SSOT)
  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // 2. Dynamic listing pages
  const { data: listings } = await supabase
    .from('listings')
    .select('id, updated_at, slug')
    .eq('status', 'claimed')
    .order('updated_at', { ascending: false })

  const listingPages: MetadataRoute.Sitemap = (listings ?? []).map((listing) => ({
    url: `${BASE_URL}/listing/${listing.id}`,
    lastModified: listing.updated_at ? new Date(listing.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 3. Mini-site pages (Pro listings with slugs)
  const miniSitePages: MetadataRoute.Sitemap = (listings ?? [])
    .filter((listing) => listing.slug)
    .map((listing) => ({
      url: `${BASE_URL}/u/${listing.slug}`,
      lastModified: listing.updated_at ? new Date(listing.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  // 4. Dynamic product pages
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .order('updated_at', { ascending: false })

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((product) => ({
    url: `${BASE_URL}/product/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // 5. Article pages
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map((article) => ({
    url: `${BASE_URL}/articles/${article.slug}`,
    lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // 6. Category filter pages from route registry
  const { data: categories } = await supabase
    .from(CATEGORY_ROUTES.table)
    .select('id, name')
    .eq(CATEGORY_ROUTES.filter.column, CATEGORY_ROUTES.filter.value)

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((category) => ({
    url: `${BASE_URL}${CATEGORY_ROUTES.baseUrl}?${CATEGORY_ROUTES.queryParam}=${encodeURIComponent(category.id)}`,
    lastModified: new Date(),
    changeFrequency: CATEGORY_ROUTES.changeFrequency,
    priority: CATEGORY_ROUTES.priority,
  }))

  return [
    ...staticPages,
    ...listingPages,
    ...miniSitePages,
    ...productPages,
    ...articlePages,
    ...categoryPages,
  ]
}
