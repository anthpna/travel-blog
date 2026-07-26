import { getSession } from '@/lib/get-session'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-gray-900">Blog-Trip Admin</span>
        <div className="flex gap-4 text-sm">
          <a href="/admin" className="text-gray-600 hover:text-gray-900">Dashboard</a>
          <a href="/admin/posts" className="text-gray-600 hover:text-gray-900">Bài viết</a>
          <a href="/admin/destinations" className="text-gray-600 hover:text-gray-900">Điểm đến</a>
          <a href="/admin/series" className="text-gray-600 hover:text-gray-900">Series</a>
          <a href="/admin/submissions" className="text-gray-600 hover:text-gray-900">Bài gửi</a>
          <a href="/admin/comments" className="text-gray-600 hover:text-gray-900">Bình luận</a>
          <a href="/api/auth/signout" className="text-red-500 hover:text-red-700">Đăng xuất</a>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
