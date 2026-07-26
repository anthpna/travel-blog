import { getSession } from '@/lib/get-session'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getSession()

  const [postCount, destCount, seriesCount, pendingSubmissions, pendingComments] =
    await Promise.all([
      prisma.post.count(),
      prisma.destination.count(),
      prisma.series.count(),
      prisma.submission.count({ where: { status: 'PENDING' } }),
      prisma.comment.count({ where: { status: 'PENDING' } }),
    ])

  const stats = [
    { label: 'Bài viết', value: postCount, href: '/admin/posts' },
    { label: 'Điểm đến', value: destCount, href: '/admin/destinations' },
    { label: 'Series', value: seriesCount, href: '/admin/series' },
    { label: 'Bài gửi chờ duyệt', value: pendingSubmissions, href: '/admin/submissions', highlight: pendingSubmissions > 0 },
    { label: 'Bình luận chờ duyệt', value: pendingComments, href: '/admin/comments', highlight: pendingComments > 0 },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">
        Xin chào, {session?.user?.name ?? session?.user?.email}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl p-5 border transition-shadow hover:shadow-md ${
              item.highlight
                ? 'bg-amber-50 border-amber-200'
                : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            <p className="text-3xl font-bold text-gray-900 mb-1">{item.value}</p>
            <p className="text-sm font-medium text-gray-600">{item.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          + Viết bài mới
        </Link>
      </div>
    </div>
  )
}
