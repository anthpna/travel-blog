'use client'

import Link from 'next/link'
import SafeImage from '@/components/ui/SafeImage'
import { useLang } from '@/contexts/LanguageContext'
import { getTagColor } from '@/lib/tag-colors'

type PostCardSize = 'default' | 'large' | 'small'

interface PostCardProps {
  post: {
    slug: string
    titleVi: string
    titleEn?: string | null
    excerptVi: string
    excerptEn?: string | null
    coverImage?: string | null
    publishedAt?: Date | null
    readingTime: number
    featured?: boolean
    destination?: { nameVi: string; nameEn?: string | null; slug: string } | null
    tags?: { nameVi: string; nameEn?: string | null; slug: string }[]
  }
  size?: PostCardSize
}

const imageSizes: Record<PostCardSize, string> = {
  large:   '(max-width: 1024px) 100vw, 60vw',
  small:   '(max-width: 1024px) 100vw, 40vw',
  default: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}

const imageAspect: Record<PostCardSize, string> = {
  large:   'aspect-[16/9]',
  small:   'aspect-[3/2]',
  default: 'aspect-[16/9]',
}

const titleClass: Record<PostCardSize, string> = {
  large:   'font-bold text-gray-900 text-xl leading-snug mb-2 group-hover:text-blue-600 transition-colors duration-150 line-clamp-3',
  small:   'font-bold text-gray-900 text-sm leading-snug mb-1 group-hover:text-blue-600 transition-colors duration-150 line-clamp-2',
  default: 'font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors duration-150 line-clamp-2',
}

const excerptClamp: Record<PostCardSize, string> = {
  large:   'line-clamp-3',
  small:   'line-clamp-2',
  default: 'line-clamp-2',
}

const paddingClass: Record<PostCardSize, string> = {
  large:   'p-5 md:p-6',
  small:   'p-3',
  default: 'p-4',
}

const tagCount: Record<PostCardSize, number> = {
  large: 4,
  small: 2,
  default: 3,
}

export default function PostCard({ post, size = 'default' }: PostCardProps) {
  const { lang, t } = useLang()
  const title = lang === 'en' && post.titleEn ? post.titleEn : post.titleVi
  const excerpt = lang === 'en' && post.excerptEn ? post.excerptEn : post.excerptVi
  const destName = lang === 'en' && post.destination?.nameEn
    ? post.destination.nameEn
    : post.destination?.nameVi

  return (
    <article className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden h-full">
      {/* Cover image */}
      <Link href={`/posts/${post.slug}`} className={`block overflow-hidden ${imageAspect[size]} bg-gray-100 relative shrink-0`}>
        {/* SafeImage: tu dong xu ly URL anh ngoai allowlist + fallback khi anh chet */}
        <SafeImage
          src={post.coverImage}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
          sizes={imageSizes[size]}
        />

        {post.featured && (
          <span className="absolute top-2 left-2 text-xs font-semibold bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
      </Link>

      {/* Content */}
      <div className={`flex flex-col flex-1 ${paddingClass[size]}`}>
        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
          {destName && (
            <Link
              href={`/destinations/${post.destination!.slug}`}
              className="text-blue-500 hover:underline font-medium"
            >
              {destName}
            </Link>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {post.readingTime} {t.post.readingTime}
          </span>
          {post.publishedAt && (
            <>
              <span>·</span>
              <time dateTime={new Date(post.publishedAt).toISOString()}>
                {new Date(post.publishedAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'vi-VN', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </time>
            </>
          )}
        </div>

        {/* Title */}
        <Link href={`/posts/${post.slug}`}>
          <h2 className={titleClass[size]}>{title}</h2>
        </Link>

        {/* Excerpt — hidden for small */}
        {size !== 'small' && (
          <p className={`text-sm text-gray-500 flex-1 ${excerptClamp[size]}`}>{excerpt}</p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.slice(0, tagCount[size]).map((tag) => {
              const color = getTagColor(tag.slug)
              return (
                <Link
                  key={tag.slug}
                  href={`/tags/${tag.slug}`}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors duration-150 ${color.bg} ${color.text} ${color.hover}`}
                >
                  {lang === 'en' && tag.nameEn ? tag.nameEn : tag.nameVi}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </article>
  )
}
