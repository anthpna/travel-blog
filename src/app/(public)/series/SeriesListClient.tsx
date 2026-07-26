'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/contexts/LanguageContext'

interface SeriesItem {
  slug: string
  titleVi: string
  titleEn: string | null
  description: string | null
  coverImage: string | null
  _count: { posts: number }
}

export default function SeriesListClient({ allSeries }: { allSeries: SeriesItem[] }) {
  const { t, lang } = useLang()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.series.title}</h1>
      <p className="text-gray-500 mb-8">{t.series.subtitle}</p>

      {allSeries.length === 0 ? (
        <p className="text-center text-gray-400 py-16">{t.common.notFound}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allSeries.map((s) => (
            <Link
              key={s.slug}
              href={`/series/${s.slug}`}
              className="group flex flex-col rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white"
            >
              <div className="relative aspect-[16/9] bg-gray-100">
                {s.coverImage ? (
                  <Image
                    src={s.coverImage}
                    alt={s.titleVi}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100" />
                )}
              </div>
              <div className="p-4">
                <h2 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {lang === 'en' && s.titleEn ? s.titleEn : s.titleVi}
                </h2>
                {s.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{s.description}</p>
                )}
                <span className="text-xs text-gray-400">
                  {s._count.posts} {t.destinations.posts}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
