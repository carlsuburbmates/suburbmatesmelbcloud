import { MetadataRoute } from 'next'
import { getExcludedPaths } from '@/lib/routes'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://suburbmates.com.au'

export default function robots(): MetadataRoute.Robots {
  // Get excluded paths from route registry (SSOT)
  const disallowedPaths = getExcludedPaths()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowedPaths,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
