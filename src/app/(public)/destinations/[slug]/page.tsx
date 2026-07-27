import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import PostCard from '@/components/blog/PostCard'
import type { DestinationPin } from '@/components/map/DestinationMap'
import { SITE_NAME } from '@/config/site'

export const revalidate = 300

interface PageProps {
  params: { slug: string }
}

const DestinationMap = dynamic(
  () => import('@/components/map/DestinationMap'),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />,
  }
)

async function getDestination(slug: string) {
  return prisma.destination.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        include: {
          destination: { select: { nameVi: true, nameEn: true, slug: true } },
          tags:        { select: { nameVi: true, nameEn: true, slug: true } },
        },
      },
      _count: { select: { posts: { where: { status: 'PUBLISHED' } } } },
    },
  })
}

export async function generateStaticParams() {
  const destinations = await prisma.destination.findMany({ select: { slug: true } })
  return destinations.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const dest = await getDestination(params.slug)
  if (!dest) notFound()
  return {
    title: `${dest.nameVi} — Điểm đến | ${SITE_NAME}`,
    description: `Các bài viết về ${dest.nameVi} (${dest.country})`,
  }
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const destination = await getDestination(params.slug)
  if (!destination) notFound()

  const pin: DestinationPin = {
    id:         destination.id,
    nameVi:     destination.nameVi,
    nameEn:     destination.nameEn,
    slug:       destination.slug,
    lat:        destination.lat,
    lng:        destination.lng,
    coverImage: destination.coverImage,
    _count:     { posts: destination._count.posts },
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <Link
        href="/destinations"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        ← Quay lại điểm đến
      </Link>

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
        {destination.nameVi}
      </h1>
      {destination.nameEn && (
        <p className="text-sm text-gray-400 mb-1">{destination.nameEn}</p>
      )}
      <p className="text-sm text-gray-400 mb-8">
        {destination.country} · {destination._count.posts} bài viết
      </p>

      {/* Mini map — non-interactive, 280px */}
      <div
        className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-10"
        style={{ height: 280 }}
      >
        <DestinationMap
          destinations={[pin]}
          interactive={false}
          height="280px"
          zoom={10}
        />
      </div>

      {/* Danh sách bài viết */}
      {destination.posts.length === 0 ? (
        <p className="text-center text-gray-400 py-16">
          Chưa có bài viết nào tại điểm đến này.
        </p>
      ) : (
        <>
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Bài viết ({destination._count.posts})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destination.posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
