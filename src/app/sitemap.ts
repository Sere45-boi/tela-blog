import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  
  // Fetch published articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('status', 'published')

  const { data: categories } = await supabase
    .from('categories')
    .select('slug')

  const baseUrl = 'https://tela.ng'

  const articleUrls = (articles || []).map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryUrls = (categories || []).map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }
  ]

  return [...staticUrls, ...categoryUrls, ...articleUrls]
}
