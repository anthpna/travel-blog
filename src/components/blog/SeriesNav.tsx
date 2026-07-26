'use client'

import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

interface SeriesPost {
  slug: string
  titleVi: string
  titleEn?: string | null
  seriesOrder: number | null
  status: string
}

interface SeriesNavProps {
  series: {
    titleVi: string
    titleEn?: string | null
    slug: string
    posts: SeriesPost[]
  }
  currentSlug: string
}

export default function SeriesNav({ series, currentSlug }: SeriesNavProps) {
  const { lang, t } = useLang()
  const seriesTitle = lang === 'en' && series.titleEn ? series.titleEn : series.titleVi

  const sortedPosts = [...series.posts].sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))
  const currentIdx = sortedPosts.findIndex((p) => p.slug === currentSlug)
  const prev = currentIdx > 0 ? sortedPosts[currentIdx - 1] : null
  const next = currentIdx < sortedPosts.length - 1 ? sortedPosts[currentIdx + 1] : null

  function postTitle(post: SeriesPost) {
    return lang === 'en' && post.titleEn ? post.titleEn : post.titleVi
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
        Series
      </div>
      <Link href={`/series/${series.slug}`} className="font-bold text-gray-900 hover:underline">
        {seriesTitle}
      </Link>
      <p className="text-xs text-gray-400 mt-0.5">
        {sortedPosts.length} {t.post.readingTime === 'phút đọc' ? 'phần' : 'parts'}
      </p>

      <div className="flex gap-3 mt-4">
        {prev ? (
          <Link
            href={`/posts/${prev.slug}`}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="text-xs text-gray-400 mb-0.5">{t.series.prev}</div>
            <div className="font-medium text-gray-900 line-clamp-1">{postTitle(prev)}</div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            href={next.status === 'PUBLISHED' ? `/posts/${next.slug}` : `/series/${series.slug}`}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors text-right"
          >
            <div className="text-xs text-gray-400 mb-0.5">{t.series.next}</div>
            <div className="font-medium text-gray-900 line-clamp-1">
              {next.status === 'PUBLISHED' ? postTitle(next) : t.series.comingSoon}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  )
}
