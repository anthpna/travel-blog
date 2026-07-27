'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import SafeImage from '@/components/ui/SafeImage'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

type Submission = {
  id: string
  titleVi: string
  titleEn: string | null
  contentHtmlVi: string
  excerptVi: string | null
  coverImage: string | null
  /** Signed URL do API sinh - dung de HIEN THI (coverImage co the la ref `storage://...`) */
  coverImageUrl: string | null
  authorName: string
  authorEmail: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminNotes: string | null
  createdAt: string
  reviewedAt: string | null
  postId: string | null
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

export default function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [sub, setSub] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch(`/api/submissions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setSub(data)
        setAdminNotes(data.adminNotes ?? '')
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleApprove = async () => {
    if (!confirm('Duyệt bài viết này và xuất bản ngay?')) return
    setBusy(true)
    setMsg('')
    const res = await fetch(`/api/submissions/${id}/approve`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setMsg(`✅ Đã duyệt! Bài viết đã được xuất bản.`)
      setSub((prev) => prev ? { ...prev, status: 'APPROVED', postId: data.post.id } : prev)
    } else {
      const data = await res.json()
      setMsg(`❌ ${data.error ?? 'Có lỗi xảy ra'}`)
    }
    setBusy(false)
  }

  const handleReject = async () => {
    if (!confirm('Từ chối bài viết này?')) return
    setBusy(true)
    setMsg('')
    const res = await fetch(`/api/submissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED', adminNotes }),
    })
    if (res.ok) {
      setMsg('✅ Đã từ chối bài viết.')
      setSub((prev) => prev ? { ...prev, status: 'REJECTED', adminNotes } : prev)
    } else {
      setMsg('❌ Có lỗi xảy ra.')
    }
    setBusy(false)
  }

  const handleSaveNotes = async () => {
    setBusy(true)
    const res = await fetch(`/api/submissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: sub?.status ?? 'PENDING', adminNotes }),
    })
    setBusy(false)
    setMsg(res.ok ? '✅ Đã lưu ghi chú.' : '❌ Có lỗi xảy ra.')
  }

  if (loading) {
    return <p className="text-gray-500 text-sm py-8 text-center">Đang tải...</p>
  }

  if (!sub) {
    return <p className="text-red-500 text-sm py-8 text-center">Không tìm thấy bài gửi.</p>
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/admin/submissions" className="text-sm text-gray-400 hover:text-gray-600 mb-2 inline-block">
            ← Danh sách bài gửi
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{sub.titleVi}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={STATUS_VARIANT[sub.status]}>{STATUS_LABEL[sub.status]}</Badge>
            <span className="text-xs text-gray-400">
              Gửi {new Date(sub.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cover image */}
          {sub.coverImage && (
            <div className="relative w-full h-56 rounded-xl overflow-hidden border border-gray-200">
              {/* Dung coverImageUrl (signed) chu khong phai coverImage (ref private bucket) */}
              <SafeImage src={sub.coverImageUrl} alt="Cover" fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
            </div>
          )}

          {/* Excerpt */}
          {sub.excerptVi && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
              <p className="text-sm font-medium text-gray-500 mb-1">Mô tả ngắn</p>
              <p className="text-gray-700 text-sm">{sub.excerptVi}</p>
            </div>
          )}

          {/* Content preview */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-gray-500 mb-3">Nội dung bài viết</p>
            <div
              className="prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: sub.contentHtmlVi }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Author info */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tác giả</p>
            <p className="font-medium text-gray-900">{sub.authorName}</p>
            <a href={`mailto:${sub.authorEmail}`} className="text-sm text-blue-600 hover:underline break-all">
              {sub.authorEmail}
            </a>
          </div>

          {/* Admin notes */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ghi chú admin</p>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Ghi chú nội bộ..."
              rows={3}
              disabled={sub.status !== 'PENDING'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
            />
            {sub.status === 'PENDING' && (
              <button
                onClick={handleSaveNotes}
                disabled={busy}
                className="text-xs text-gray-600 hover:text-gray-900 underline disabled:opacity-50"
              >
                Lưu ghi chú
              </button>
            )}
          </div>

          {/* Actions */}
          {sub.status === 'PENDING' && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hành động</p>
              <button
                onClick={handleApprove}
                disabled={busy}
                className="w-full py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                ✓ Duyệt &amp; Xuất bản
              </button>
              <button
                onClick={handleReject}
                disabled={busy}
                className="w-full py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                ✗ Từ chối
              </button>
            </div>
          )}

          {/* Approved — link to published post */}
          {sub.status === 'APPROVED' && sub.postId && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Đã xuất bản</p>
              <Link
                href={`/admin/posts/${sub.postId}/edit`}
                className="text-sm text-green-700 hover:underline"
              >
                Xem bài viết đã tạo →
              </Link>
            </div>
          )}

          {/* Message feedback */}
          {msg && (
            <p className={`text-sm rounded-lg px-3 py-2 ${
              msg.startsWith('✅')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {msg}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
