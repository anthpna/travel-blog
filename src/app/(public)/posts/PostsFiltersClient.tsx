'use client'

import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'
import { getTagColor } from '@/lib/tag-colors'

interface TagItem {
  slug: string
  nameVi: string
  nameEn: string | null
}

interface DestinationItem {
  slug: string
  nameVi: string
  nameEn: string | null
}

interface Props {
  tags: TagItem[]
  destinations: DestinationItem[]
  activeTagSlug?: string
  activeDestSlug?: string
  postCount: number
}

export default function PostsFiltersClient({
  tags,
  destinations,
  activeTagSlug,
  activeDestSlug,
  postCount,
}: Props) {
  const { t, lang } = useLang()

  const activeTag = tags.find((tg) => tg.slug === activeTagSlug)
  const activeDest = destinations.find((d) => d.slug === activeDestSlug)

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.post.allPosts}</h1>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/posts"
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors duration-150 ${
            !activeTagSlug && !activeDestSlug
              ? 'bg-gray-900 text-white border-gray-900'
              : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          {t.post.all}
        </Link>
        {tags.map((tag) => {
          const color = getTagColor(tag.slug)
          const isActive = activeTagSlug === tag.slug
          return (
            <Link
              key={tag.slug}
              href={`/posts?tag=${tag.slug}`}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors duration-150 ${
                isActive
                  ? `${color.activeBg} ${color.activeText} border-transparent`
                  : `border-gray-200 ${color.text} ${color.hover}`
              }`}
            >
              {lang === 'en' && tag.nameEn ? tag.nameEn : tag.nameVi}
            </Link>
          )
        })}
      </div>

      {activeTag && (
        <p className="text-sm text-gray-500 mb-6">
          {t.post.filterByTag}: <strong>{lang === 'en' && activeTag.nameEn ? activeTag.nameEn : activeTag.nameVi}</strong> · {postCount} {lang === 'en' ? 'posts' : 'bài viết'}
        </p>
      )}
      {activeDest && (
        <p className="text-sm text-gray-500 mb-6">
          {t.post.filterByDestination}: <strong>{lang === 'en' && activeDest.nameEn ? activeDest.nameEn : activeDest.nameVi}</strong> · {postCount} {lang === 'en' ? 'posts' : 'bài viết'}
        </p>
      )}
    </>
  )
}
