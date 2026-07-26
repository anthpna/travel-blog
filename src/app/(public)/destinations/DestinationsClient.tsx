'use client'

import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useLang } from '@/contexts/LanguageContext'
import type { DestinationPin } from '@/components/map/DestinationMap'

const DestinationMap = dynamic(
  () => import('@/components/map/DestinationMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center rounded-2xl">
        <p className="text-gray-400 text-sm">...</p>
      </div>
    ),
  }
)

interface DestItem {
  id: string
  slug: string
  nameVi: string
  nameEn: string | null
  country: string
  coverImage: string | null
  lat: number
  lng: number
  _count: { posts: number }
}

export default function DestinationsClient({ destinations }: { destinations: DestItem[] }) {
  const { t, lang } = useLang()

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.destinations.title}</h1>
      <p className="text-gray-500 mb-8">{t.destinations.subtitle}</p>

      {destinations.length === 0 ? (
        <p className="text-center text-gray-400 py-16">{t.common.notFound}</p>
      ) : (
        <>
          <div
            className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-12"
            style={{ height: 480 }}
          >
            <DestinationMap destinations={pins} />
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-6">
            {t.destinations.title} ({destinations.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <Link
                key={dest.slug}
                href={`/destinations/${dest.slug}`}
                className="group flex flex-col rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white"
              >
                <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                  {dest.coverImage ? (
                    <Image
                      src={dest.coverImage}
                      alt={dest.nameVi}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <span className="text-4xl select-none">🗺️</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-0.5 group-hover:text-blue-600 transition-colors">
                    {lang === 'en' && dest.nameEn ? dest.nameEn : dest.nameVi}
                  </h3>
                  {dest.nameEn && dest.nameVi !== dest.nameEn && (
                    <p className="text-xs text-gray-400 mb-2">
                      {lang === 'en' ? dest.nameVi : dest.nameEn}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {dest._count.posts} {t.destinations.posts}
                    </span>
                    <span className="text-xs text-gray-400">{dest.country}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
