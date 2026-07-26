import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'

export const revalidate = 300

interface PageProps {
  params: { slug: string }
}

async function getSeries(slug: string) {
  return prisma.series.findUnique({
    where: { slug },
    include: {
      posts: {
        orderBy: { seriesOrder: 'asc' },
        include: { destination: true },
      },
    },
  })
}

export async function generateStaticParams() {
  const series = await prisma.series.findMany({ select: { slug: true } })
  return series.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const s = await getSeries(params.slug)
  if (!s) notFound()
  return {
    title: s.titleVi,
    description: s.description ?? undefined,
  }
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const series = await getSeries(params.slug)
  if (!series) notFound()

  const publishedPosts = series.posts.filter((p) => p.status === 'PUBLISHED')
  const totalPosts = series.posts.length

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/series" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        ← Quay lại series
      </Link>

      {series.coverImage && (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 shadow-md">
          <Image src={series.coverImage} alt={series.titleVi} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{series.titleVi}</h1>
      {series.description && <p className="text-gray-500 mb-8">{series.description}</p>}

      <p className="text-sm text-gray-400 mb-6">
        {publishedPosts.length}/{totalPosts} phần đã đăng
      </p>

      {/* Timeline */}
      <ol className="relative border-l border-gray-200 space-y-0">
        {series.posts.map((post, idx) => {
          const isPublished = post.status === 'PUBLISHED'
          return (
            <li key={post.id} className="ml-6 pb-8">
              <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white text-xs font-bold ${
                isPublished ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {idx + 1}
              </span>
              {isPublished ? (
                <Link
                  href={`/posts/${post.slug}`}
                  className="group ml-2 block"
                >
                  <div className="flex items-start gap-3">
                    {post.coverImage && (
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 mt-1">
                        <Image src={post.coverImage} alt={post.titleVi} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Phần {post.seriesOrder ?? idx + 1}</p>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {post.titleVi}
                      </h3>
                      {post.destination && (
                        <span className="text-xs text-blue-500 mt-0.5 block">{post.destination.nameVi}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="ml-2">
                  <p className="text-xs text-gray-400 mb-0.5">Phần {post.seriesOrder ?? idx + 1}</p>
                  <h3 className="font-semibold text-gray-400">{post.titleVi}</h3>
                  <span className="text-xs text-amber-500">Sắp ra mắt</span>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
