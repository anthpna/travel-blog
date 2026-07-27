import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import DestinationsClient from './DestinationsClient'
import { SITE_NAME } from '@/config/site'

export const revalidate = 300

export const metadata: Metadata = {
  title: `Destinations — ${SITE_NAME}`,
  description: 'Explore the places we have been on an interactive map.',
}

export default async function DestinationsPage() {
  const destinations = await prisma.destination.findMany({
    include: {
      _count: { select: { posts: { where: { status: 'PUBLISHED' } } } },
    },
    orderBy: { nameVi: 'asc' },
  })

  return (
    <DestinationsClient
      destinations={destinations.map((d) => ({
        id: d.id,
        slug: d.slug,
        nameVi: d.nameVi,
        nameEn: d.nameEn,
        country: d.country,
        coverImage: d.coverImage,
        lat: d.lat,
        lng: d.lng,
        _count: d._count,
      }))}
    />
  )
}
