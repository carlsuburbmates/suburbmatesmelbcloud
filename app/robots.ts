import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://suburbmates.com.au'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/studio/',      // Creator dashboard (authenticated)
          '/admin/',       // Operator panel (authenticated)
          '/api/',         // API routes
          '/auth/',        // Auth flows
          '/checkout',     // Checkout page
          '/cart',         // Shopping cart
          '/claim/',       // Claim interstitial pages
          '/orders/',      // Order confirmation pages
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
