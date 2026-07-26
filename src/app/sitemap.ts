import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, destinations, series] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.destination.findMany({
      select: { slug: true },
      orderBy: { nameVi: 'asc' },
    }),
    prisma.series.findMany({
      select: { slug: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/posts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/destinations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/series`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/submit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/posts/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const destinationRoutes: MetadataRoute.Sitemap = destinations.map((d) => ({
    url: `${BASE_URL}/destinations/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const seriesRoutes: MetadataRoute.Sitemap = series.map((s) => ({
    url: `${BASE_URL}/series/${s.slug}`,
    lastModified: s.createdAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...postRoutes, ...destinationRoutes, ...seriesRoutes]
}
