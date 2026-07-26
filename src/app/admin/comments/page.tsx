'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

type Comment = {
  id: string
  name: string
  email: string
  content: string
  status: 'PENDING' | 'APPROVED' | 'SPAM'
  createdAt: string
  post: { id: string; titleVi: string; slug: string }
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  SPAM: 'Spam',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  SPAM: 'destructive',
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchComments = async () => {
    setLoading(true)
    const res = await fetch('/api/comments')
    const data = await res.json()
    setComments(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchComments() }, [])

  const filtered = statusFilter === 'ALL'
    ? comments
    : comments.filter((c) => c.status === statusFilter)

  const handleModerate = async (id: string, status: 'APPROVED' | 'SPAM') => {
    await fetch(`/api/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, status } : c))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa bình luận này?')) return
    await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  const pendingCount = comments.filter((c) => c.status === 'PENDING').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bình luận</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-600 mt-0.5">{pendingCount} bình luận chờ duyệt</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['ALL', 'PENDING', 'APPROVED', 'SPAM'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              statusFilter === s
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {s === 'ALL' ? `Tất cả (${comments.length})` : `${STATUS_LABEL[s]} (${comments.filter(c => c.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Không có bình luận nào.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Người gửi</th>
                <th className="px-4 py-3 font-medium">Nội dung</th>
                <th className="px-4 py-3 font-medium">Bài viết</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Ngày</th>
                <th className="px-4 py-3 font-medium w-32" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((comment) => (
                <tr key={comment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{comment.name}</div>
                    {comment.email && (
                      <div className="text-xs text-gray-400">{comment.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-gray-700 line-clamp-2 text-xs leading-relaxed">
                      {comment.content}
                    </p>
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <a
                      href={`/posts/${comment.post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-xs line-clamp-2"
                    >
                      {comment.post.titleVi}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[comment.status]}>
                      {STATUS_LABEL[comment.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2.5">
                      {comment.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleModerate(comment.id, 'APPROVED')}
                          className="text-green-600 hover:underline text-xs font-medium"
                        >
                          Duyệt
                        </button>
                      )}
                      {comment.status !== 'SPAM' && (
                        <button
                          onClick={() => handleModerate(comment.id, 'SPAM')}
                          className="text-orange-500 hover:underline text-xs"
                        >
                          Spam
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Xóa
                      </button>
                    </div>
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
