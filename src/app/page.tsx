import Link from 'next/link'
import SafeImage from '@/components/ui/SafeImage'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PostGrid from '@/components/blog/PostGrid'
import prisma from '@/lib/prisma'
import { SITE_NAME, SITE_AUTHOR } from '@/config/site'

export const revalidate = 60

async function getData() {
  const [featured, recent] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'PUBLISHED', featured: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: { destination: true, tags: true },
    }),
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      include: { destination: true, tags: true },
    }),
  ])
  return { featured, recent }
}

export default async function HomePage() {
  const { featured, recent } = await getData()

  const heroPost = featured[0] ?? recent[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        {heroPost && (
          <section className="relative bg-gray-900 text-white overflow-hidden">
            {heroPost.coverImage && (
              <SafeImage
                src={heroPost.coverImage}
                alt={heroPost.titleVi}
                fill
                sizes="100vw"
                className="object-cover opacity-40"
                priority
              />
            )}
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-36">
              <p className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-3">
                {SITE_NAME} · {SITE_AUTHOR}
              </p>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-2xl mb-6">
                {heroPost.titleVi}
              </h1>
              <p className="text-gray-300 text-lg max-w-xl mb-8 line-clamp-2">
                {heroPost.excerptVi}
              </p>
              <Link
                href={`/posts/${heroPost.slug}`}
                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-150"
              >
                Đọc bài viết →
              </Link>
            </div>
          </section>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">
          {/* Section 1 — Featured: asymmetric-left (1 large + 2 small) */}
          {featured.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Bài viết nổi bật</h2>
                <Link href="/posts" className="text-sm text-blue-600 hover:underline">
                  Xem tất cả →
                </Link>
              </div>
              <PostGrid posts={featured} variant="asymmetric-left" />
            </section>
          )}

          {/* Section 2 — Recent: standard 3-col */}
          {recent.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Bài viết mới nhất</h2>
                <Link href="/posts" className="text-sm text-blue-600 hover:underline">
                  Xem tất cả →
                </Link>
              </div>
              <PostGrid
                posts={recent.slice(0, 3)}
                variant="standard"
                emptyMessage="Chưa có bài viết nào. Hãy quay lại sau!"
              />
            </section>
          )}

          {/* Section 3 — Explore: asymmetric-right (3 small + 1 large) */}
          {recent.length > 3 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Khám phá thêm</h2>
                <Link href="/posts" className="text-sm text-blue-600 hover:underline">
                  Xem tất cả →
                </Link>
              </div>
              <PostGrid posts={recent.slice(3, 7)} variant="asymmetric-right" />
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
