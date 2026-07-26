import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/contexts/LanguageContext'

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
}

export default function PostCard({ post }: PostCardProps) {
  const { lang, t } = useLang()
  const title = lang === 'en' && post.titleEn ? post.titleEn : post.titleVi
  const excerpt = lang === 'en' && post.excerptEn ? post.excerptEn : post.excerptVi
  const destName = lang === 'en' && post.destination?.nameEn
    ? post.destination.nameEn
    : post.destination?.nameVi

  return (
    <article className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <Link href={`/posts/${post.slug}`} className="block overflow-hidden aspect-[16/9] bg-gray-100 relative">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        {post.featured && (
          <span className="absolute top-2 left-2 text-xs font-semibold bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          {destName && (
            <Link
              href={`/destinations/${post.destination!.slug}`}
              className="text-blue-500 hover:underline font-medium"
            >
              {destName}
            </Link>
          )}
          <span>{post.readingTime} {t.post.readingTime}</span>
          {post.publishedAt && (
            <>
              <span>·</span>
              <time dateTime={post.publishedAt.toISOString()}>
                {new Date(post.publishedAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'vi-VN', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </time>
            </>
          )}
        </div>

        <Link href={`/posts/${post.slug}`}>
          <h2 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {title}
          </h2>
        </Link>

        <p className="text-sm text-gray-500 line-clamp-2 flex-1">{excerpt}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.slug}
                href={`/tags/${tag.slug}`}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                {lang === 'en' && tag.nameEn ? tag.nameEn : tag.nameVi}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
