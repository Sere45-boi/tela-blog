import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/login/', '/_next/'],
    },
    sitemap: 'https://blog.tela.ng/sitemap.xml',
  }
}
