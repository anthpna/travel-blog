'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

type Submission = {
  id: string
  titleVi: string
  authorName: string
  authorEmail: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  reviewedAt: string | null
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/submissions')
      .then((r) => r.json())
      .then((data) => setSubmissions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    statusFilter === 'ALL'
      ? submissions
      : submissions.filter((s) => s.status === statusFilter)

  const pendingCount = submissions.filter((s) => s.status === 'PENDING').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bài gửi</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-600 mt-0.5">{pendingCount} bài chờ duyệt</p>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              statusFilter === s
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {s === 'ALL'
              ? `Tất cả (${submissions.length})`
              : `${STATUS_LABEL[s]} (${submissions.filter((x) => x.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Không có bài gửi nào.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Tiêu đề</th>
                <th className="px-4 py-3 font-medium">Tác giả</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Ngày gửi</th>
                <th className="px-4 py-3 font-medium w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1">{sub.titleVi}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{sub.authorName}</p>
                    <p className="text-xs text-gray-400">{sub.authorEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[sub.status]}>
                      {STATUS_LABEL[sub.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(sub.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/submissions/${sub.id}`}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      Xem
                    </Link>
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
