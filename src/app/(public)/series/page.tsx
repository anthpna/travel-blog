import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import SeriesListClient from './SeriesListClient'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Travel Series — Blog Trip',
  description: 'Multi-part travel journeys from Blog Trip.',
}

export default async function SeriesListPage() {
  const allSeries = await prisma.series.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { posts: { where: { status: 'PUBLISHED' } } } },
    },
  })

  return (
    <SeriesListClient
      allSeries={allSeries.map((s) => ({
        slug: s.slug,
        titleVi: s.titleVi,
        titleEn: s.titleEn,
        description: s.description,
        coverImage: s.coverImage,
        _count: s._count,
      }))}
    />
  )
}
