import type { Metadata } from 'next'
import PostGrid from '@/components/blog/PostGrid'
import PostsFiltersClient from './PostsFiltersClient'
import prisma from '@/lib/prisma'
import { SITE_NAME } from '@/config/site'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Bài viết',
  description: `Tất cả bài viết du lịch từ ${SITE_NAME}.`,
}

interface PageProps {
  searchParams: { tag?: string; destination?: string }
}

async function getData(tag?: string, destination?: string) {
  const [posts, tags, destinations] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        ...(tag ? { tags: { some: { slug: tag } } } : {}),
        ...(destination ? { destination: { slug: destination } } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      include: { destination: true, tags: true },
    }),
    prisma.tag.findMany({ orderBy: { nameVi: 'asc' } }),
    prisma.destination.findMany({ orderBy: { nameVi: 'asc' } }),
  ])
  return { posts, tags, destinations }
}

export default async function PostsPage({ searchParams }: PageProps) {
  const { posts, tags, destinations } = await getData(searchParams.tag, searchParams.destination)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <PostsFiltersClient
        tags={tags.map((t) => ({ slug: t.slug, nameVi: t.nameVi, nameEn: t.nameEn }))}
        destinations={destinations.map((d) => ({ slug: d.slug, nameVi: d.nameVi, nameEn: d.nameEn }))}
        activeTagSlug={searchParams.tag}
        activeDestSlug={searchParams.destination}
        postCount={posts.length}
      />

      <PostGrid posts={posts} />
    </div>
  )
}
