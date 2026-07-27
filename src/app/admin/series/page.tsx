'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ImageUploadField from '@/components/admin/ImageUploadField'

type Series = {
  id: string
  titleVi: string
  titleEn: string | null
  slug: string
  description: string | null
  coverImage: string | null
  _count: { posts: number }
}

const EMPTY = { titleVi: '', titleEn: '', description: '', coverImage: '' }

export default function AdminSeriesPage() {
  const [items, setItems] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Series | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    const res = await fetch('/api/series')
    setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ ...EMPTY })
    setError('')
    setOpen(true)
  }

  const openEdit = (item: Series) => {
    setEditing(item)
    setForm({ titleVi: item.titleVi, titleEn: item.titleEn ?? '', description: item.description ?? '', coverImage: item.coverImage ?? '' })
    setError('')
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.titleVi.trim()) {
      setError('Tên series (tiếng Việt) là bắt buộc.')
      return
    }
    setSaving(true)
    setError('')

    const url = editing ? `/api/series/${editing.id}` : '/api/series'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Có lỗi xảy ra.')
      setSaving(false)
      return
    }

    setOpen(false)
    await fetchAll()
    setSaving(false)
  }

  const handleDelete = async (item: Series) => {
    if (!confirm(`Xóa series "${item.titleVi}"?\n\n${item._count.posts} bài viết sẽ bị tách khỏi series này.`)) return
    await fetch(`/api/series/${item.id}`, { method: 'DELETE' })
    await fetchAll()
  }

  const f = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Travel Series</h1>
        <Button onClick={openNew}>+ Series mới</Button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Đang tải...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Chưa có series nào.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Tên</th>
                <th className="px-4 py-3 font-medium">Mô tả</th>
                <th className="px-4 py-3 font-medium">Số bài</th>
                <th className="px-4 py-3 font-medium w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{item.titleVi}</div>
                    {item.titleEn && <div className="text-gray-400 text-xs">{item.titleEn}</div>}
                    <div className="text-gray-400 text-xs">{item.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{item.description ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{item._count.posts}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline">Sửa</button>
                    <button onClick={() => handleDelete(item)} className="text-red-500 hover:underline">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Chỉnh sửa series' : 'Tạo series mới'}</DialogTitle>
          </DialogHeader>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tên (tiếng Việt) *</Label>
                <Input value={form.titleVi} onChange={f('titleVi')} placeholder="Tây Bắc 10 ngày" />
              </div>
              <div className="space-y-1">
                <Label>Tên (English)</Label>
                <Input value={form.titleEn} onChange={f('titleEn')} placeholder="10 Days in Northwest" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Mô tả</Label>
              <Textarea rows={3} value={form.description} onChange={f('description')} placeholder="Mô tả ngắn về series này..." />
            </div>

            {/* Uu tien tai anh len storage cua site; van cho dan URL de tuong thich nguoc */}
            <ImageUploadField
              label="Ảnh bìa"
              value={form.coverImage || null}
              onChange={(coverImage) => setForm((prev) => ({ ...prev, coverImage: coverImage ?? '' }))}
            />
          </div>

          <div className="flex gap-2 mt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
