'use client'

import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  publishedAt: string | null
  readingTime: number
  destination: { nameVi: string; nameEn?: string | null; slug: string } | null
  tags: { nameVi: string; nameEn?: string | null; slug: string }[]
}

export default function PostMetaClient({ publishedAt, readingTime, destination, tags }: Props) {
  const { lang, t } = useLang()
  const locale = lang === 'en' ? 'en-US' : 'vi-VN'
  const destName = destination
    ? (lang === 'en' && destination.nameEn ? destination.nameEn : destination.nameVi)
    : null

  return (
    <>
      <Link
        href="/posts"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        {t.post.backToPosts}
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        {destination && destName && (
          <Link
            href={`/destinations/${destination.slug}`}
            className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors"
          >
            {destName}
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-3">
        {publishedAt && (
          <time dateTime={publishedAt}>
            {new Date(publishedAt).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
        <span>·</span>
        <span>{readingTime} {t.post.readingTime}</span>
        {tags.length > 0 && (
          <>
            <span>·</span>
            <div className="flex gap-1.5 flex-wrap">
              {tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tags/${tag.slug}`}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  {lang === 'en' && tag.nameEn ? tag.nameEn : tag.nameVi}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
