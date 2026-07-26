'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import type { DestinationPin } from '@/components/map/DestinationMap'

const MiniMap = dynamic(() => import('@/components/map/DestinationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center rounded-xl">
      <p className="text-gray-400 text-sm">Đang tải bản đồ...</p>
    </div>
  ),
})

interface Props {
  pins: DestinationPin[]
  postCount: number
  countryCount: number
  yearsExploring: number
}

export default function AboutContent({ pins, postCount, countryCount, yearsExploring }: Props) {
  const { t } = useLang()
  const [imgError, setImgError] = useState(false)

  const stats = [
    { value: countryCount, label: t.about.statCountries },
    { value: postCount, label: t.about.statPosts },
    { value: yearsExploring, label: t.about.statYears },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.about.title}</h1>
        <p className="text-gray-500">{t.about.subtitle}</p>
      </div>

      {/* Bio section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {!imgError ? (
            <div className="w-36 h-36 rounded-full overflow-hidden shadow-sm relative">
              <Image
                src="/site/images/author.jpg"
                alt="Phan Thanh An"
                fill
                className="object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-5xl select-none shadow-sm">
              ✈️
            </div>
          )}
        </div>
        <div>
          <p className="text-gray-700 leading-relaxed text-base">{t.about.bio}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6">{t.about.statsTitle}</h2>
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="text-center rounded-xl border border-gray-100 shadow-sm bg-white py-6 px-4"
            >
              <div className="text-4xl font-bold text-blue-600 mb-1">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini map */}
      {pins.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t.about.mapTitle}</h2>
          <div
            className="rounded-xl overflow-hidden border border-gray-100 shadow-sm"
            style={{ height: 280 }}
          >
            <MiniMap
              destinations={pins}
              interactive={false}
              height="280px"
              zoom={4}
            />
          </div>
        </div>
      )}
    </div>
  )
}
