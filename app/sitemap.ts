import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://suburbmates.com.au'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Fetch all claimed listings (exclude unclaimed for SEO quality)
  const { data: listings } = await supabase
    .from('listings')
    .select('id, updated_at, slug')
    .eq('status', 'claimed')
    .order('updated_at', { ascending: false })

  // Fetch all products with their listing relationships
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .order('updated_at', { ascending: false })

  // Fetch all articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  // Fetch categories for directory filter pages
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('type', 'business')

  // Static pages with priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/directory`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/trust`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic listing pages
  const listingPages: MetadataRoute.Sitemap = (listings ?? []).map((listing) => ({
    url: `${BASE_URL}/listing/${listing.id}`,
    lastModified: listing.updated_at ? new Date(listing.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // User mini-sites (Pro listings with slugs)
  const miniSitePages: MetadataRoute.Sitemap = (listings ?? [])
    .filter((listing) => listing.slug)
    .map((listing) => ({
      url: `${BASE_URL}/u/${listing.slug}`,
      lastModified: listing.updated_at ? new Date(listing.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  // Dynamic product pages
  const productPages: MetadataRoute.Sitemap = (products ?? []).map((product) => ({
    url: `${BASE_URL}/product/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Article pages
  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map((article) => ({
    url: `${BASE_URL}/articles/${article.slug}`,
    lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Category-filtered directory pages (for SEO)
  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((category) => ({
    url: `${BASE_URL}/directory?category=${encodeURIComponent(category.id)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
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
