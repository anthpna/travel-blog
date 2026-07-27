import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import type { DestinationPin } from '@/components/map/DestinationMap'
import AboutContent from './AboutContent'
import { SITE_NAME } from '@/config/site'

export const metadata: Metadata = {
  title: `Về tác giả — ${SITE_NAME}`,
  description: 'Phan Thanh An — sinh năm 1993, chia sẻ hành trình và cảm xúc qua những chuyến đi.',
}

export default async function AboutPage() {
  const [destinations, postCount] = await Promise.all([
    prisma.destination.findMany({
      include: { _count: { select: { posts: { where: { status: 'PUBLISHED' } } } } },
      orderBy: { nameVi: 'asc' },
    }),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
  ])

  const pins: DestinationPin[] = destinations.map((d) => ({
    id: d.id,
    nameVi: d.nameVi,
    nameEn: d.nameEn,
    slug: d.slug,
    lat: d.lat,
    lng: d.lng,
    coverImage: d.coverImage,
    _count: { posts: d._count.posts },
  }))

  const countryCount = new Set(destinations.map((d) => d.country)).size
  const yearsExploring = new Date().getFullYear() - 2018

  return (
    <AboutContent
      pins={pins}
      postCount={postCount}
      countryCount={countryCount}
      yearsExploring={yearsExploring}
    />
  )
}
