import type { Metadata } from 'next'
import Link from 'next/link'
import PostGrid from '@/components/blog/PostGrid'
import prisma from '@/lib/prisma'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Bài viết',
  description: 'Tất cả bài viết du lịch từ Travel Blog.',
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

  const activeTag = tags.find((t) => t.slug === searchParams.tag)
  const activeDestination = destinations.find((d) => d.slug === searchParams.destination)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Bài viết</h1>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/posts"
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
            !searchParams.tag && !searchParams.destination
              ? 'bg-gray-900 text-white border-gray-900'
              : 'border-gray-200 text-gray-600 hover:border-gray-400'
          }`}
        >
          Tất cả
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/posts?tag=${tag.slug}`}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              searchParams.tag === tag.slug
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {tag.nameVi}
          </Link>
        ))}
      </div>

      {activeTag && (
        <p className="text-sm text-gray-500 mb-6">
          Tag: <strong>{activeTag.nameVi}</strong> · {posts.length} bài viết
        </p>
      )}
      {activeDestination && (
        <p className="text-sm text-gray-500 mb-6">
          Điểm đến: <strong>{activeDestination.nameVi}</strong> · {posts.length} bài viết
        </p>
      )}

      <PostGrid posts={posts} emptyMessage="Không tìm thấy bài viết nào." />
    </div>
  )
}
