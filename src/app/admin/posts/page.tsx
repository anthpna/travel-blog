'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Post = {
  id: string
  titleVi: string
  slug: string
  status: string
  featured: boolean
  readingTime: number
  createdAt: string
  destination: { nameVi: string } | null
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Nháp',
  PUBLISHED: 'Đã đăng',
  ARCHIVED: 'Lưu trữ',
}
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  DRAFT: 'secondary',
  PUBLISHED: 'default',
  ARCHIVED: 'outline',
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  const fetchPosts = async (status: string) => {
    setLoading(true)
    const q = status === 'ALL' ? '' : `?status=${status}`
    const res = await fetch(`/api/posts${q}`)
    const data = await res.json()
    setPosts(data.posts ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts(statusFilter) }, [statusFilter])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa bài "${title}"?`)) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bài viết</h1>
        <Link href="/admin/posts/new">
          <Button>+ Bài mới</Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              statusFilter === s
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {s === 'ALL' ? 'Tất cả' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Đang tải...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Chưa có bài viết nào.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Tiêu đề</th>
                <th className="px-4 py-3 font-medium">Điểm đến</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Thời gian đọc</th>
                <th className="px-4 py-3 font-medium">Ngày tạo</th>
                <th className="px-4 py-3 font-medium w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{post.titleVi}</div>
                    <div className="text-gray-400 text-xs">{post.slug}</div>
                    {post.featured && <span className="text-xs text-amber-600 font-medium">★ Nổi bật</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{post.destination?.nameVi ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[post.status]}>{STATUS_LABEL[post.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{post.readingTime} phút</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link href={`/admin/posts/${post.id}/edit`} className="text-blue-600 hover:underline">Sửa</Link>
                    <button
                      onClick={() => handleDelete(post.id, post.titleVi)}
                      className="text-red-500 hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
