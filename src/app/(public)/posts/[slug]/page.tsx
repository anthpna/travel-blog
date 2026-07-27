import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SafeImage from '@/components/ui/SafeImage'
import prisma from '@/lib/prisma'
import LanguageToggle from '@/components/blog/LanguageToggle'
import ShareButtons from '@/components/blog/ShareButtons'
import SeriesNav from '@/components/blog/SeriesNav'
import PostTitleClient from './PostTitleClient'
import PostBodyClient from './PostBodyClient'
import PostMetaClient from './PostMetaClient'
import { detectOriginalLang } from '@/lib/detect-lang'
import CommentList from '@/components/comments/CommentList'
import CommentForm from '@/components/comments/CommentForm'

export const revalidate = 3600

interface PageProps {
  params: { slug: string }
}

async function getPost(slug: string) {
  return prisma.post.findUnique({
    where: { slug, status: 'PUBLISHED' },
    include: {
      destination: true,
      tags: true,
      series: {
        include: {
          posts: {
            select: {
              slug: true,
              titleVi: true,
              titleEn: true,
              seriesOrder: true,
              status: true,
            },
          },
        },
      },
      comments: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true },
  })
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) notFound()
  return {
    title: post.titleVi,
    description: post.excerptVi,
    openGraph: {
      title: post.titleVi,
      description: post.excerptVi ?? undefined,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
      type: 'article',
      publishedTime: post.publishedAt?.toISOString() ?? undefined,
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const siteUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const postUrl = `${siteUrl}/posts/${post.slug}`
  const originalLang = detectOriginalLang(post.titleVi)

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <PostMetaClient
        publishedAt={post.publishedAt?.toISOString() ?? null}
        readingTime={post.readingTime}
        destination={post.destination ?? null}
        tags={post.tags}
      />

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <LanguageToggle hasEnVersion={!!post.contentHtmlEn} />
        </div>

        <PostTitle post={post} />
      </header>

      {/* Cover */}
      {post.coverImage && (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 shadow-md">
          <SafeImage src={post.coverImage} alt={post.titleVi} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
        </div>
      )}

      {/* Body */}
      <PostBodyWrapper post={post} originalLang={originalLang} />

      {/* Share */}
      <div className="mt-10 pt-8 border-t border-gray-100">
        <ShareButtons url={postUrl} title={post.titleVi} />
      </div>

      {/* Series nav */}
      {post.series && (
        <div className="mt-8">
          <SeriesNav series={post.series} currentSlug={post.slug} />
        </div>
      )}

      {/* Comments */}
      <div className="mt-12 pt-10 border-t border-gray-100 space-y-10">
        <CommentList comments={post.comments} />
        <CommentForm postId={post.id} />
      </div>
    </article>
  )
}

type Post = NonNullable<Awaited<ReturnType<typeof getPost>>>

function PostTitle({ post }: { post: Post }) {
  return <PostTitleClient titleVi={post.titleVi} titleEn={post.titleEn} />
}

function PostBodyWrapper({ post, originalLang }: { post: Post; originalLang: 'vi' | 'en' }) {
  return (
    <PostBodyClient
      contentHtmlVi={post.contentHtmlVi}
      contentHtmlEn={post.contentHtmlEn}
      originalLang={originalLang}
    />
  )
}
