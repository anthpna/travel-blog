import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PostGrid from '@/components/blog/PostGrid'
import prisma from '@/lib/prisma'

export const revalidate = 300

interface PageProps {
  params: { tag: string }
}

async function getData(tagSlug: string) {
  const tag = await prisma.tag.findUnique({
    where: { slug: tagSlug },
    include: {
      posts: {
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        include: { destination: true, tags: true },
      },
    },
  })
  return tag
}

export async function generateStaticParams() {
  const tags = await prisma.tag.findMany({ select: { slug: true } })
  return tags.map((t) => ({ tag: t.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tag = await getData(params.tag)
  if (!tag) return {}
  return { title: `Tag: ${tag.nameVi}` }
}

export default async function TagPage({ params }: PageProps) {
  const tag = await getData(params.tag)
  if (!tag) notFound()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/posts" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        ← Tất cả bài viết
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Bài viết với tag: <span className="text-blue-600">#{tag.nameVi}</span>
      </h1>
      <p className="text-sm text-gray-400 mb-8">{tag.posts.length} bài viết</p>

      <PostGrid posts={tag.posts} emptyMessage="Không có bài viết nào với tag này." />
    </div>
  )
}
