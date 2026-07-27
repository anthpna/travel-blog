'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ImageUploadField from '@/components/admin/ImageUploadField'

type Destination = {
  id: string
  nameVi: string
  nameEn: string
  slug: string
  country: string
  countryCode: string
  lat: number
  lng: number
  coverImage: string | null
  _count: { posts: number }
}

const EMPTY: Omit<Destination, 'id' | 'slug' | '_count'> = {
  nameVi: '', nameEn: '', country: '', countryCode: '', lat: 0, lng: 0, coverImage: null,
}

export default function AdminDestinationsPage() {
  const [items, setItems] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Destination | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    const res = await fetch('/api/destinations')
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

  const openEdit = (item: Destination) => {
    setEditing(item)
    setForm({ nameVi: item.nameVi, nameEn: item.nameEn, country: item.country, countryCode: item.countryCode, lat: item.lat, lng: item.lng, coverImage: item.coverImage })
    setError('')
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.nameVi || !form.nameEn || !form.country || !form.countryCode) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.')
      return
    }
    setSaving(true)
    setError('')

    const url = editing ? `/api/destinations/${editing.id}` : '/api/destinations'
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

  const handleDelete = async (item: Destination) => {
    if (!confirm(`Xóa điểm đến "${item.nameVi}"?\n\nLưu ý: ${item._count.posts} bài viết liên kết sẽ bị mất điểm đến.`)) return
    await fetch(`/api/destinations/${item.id}`, { method: 'DELETE' })
    await fetchAll()
  }

  const f = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: key === 'lat' || key === 'lng' ? Number(e.target.value) : e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Điểm đến</h1>
        <Button onClick={openNew}>+ Điểm đến mới</Button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Đang tải...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Chưa có điểm đến nào.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Tên</th>
                <th className="px-4 py-3 font-medium">Quốc gia</th>
                <th className="px-4 py-3 font-medium">Tọa độ</th>
                <th className="px-4 py-3 font-medium">Bài viết</th>
                <th className="px-4 py-3 font-medium w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{item.nameVi}</div>
                    <div className="text-gray-400 text-xs">{item.nameEn} · {item.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.country} ({item.countryCode})</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.lat}, {item.lng}</td>
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
            <DialogTitle>{editing ? 'Chỉnh sửa điểm đến' : 'Thêm điểm đến mới'}</DialogTitle>
          </DialogHeader>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tên (tiếng Việt) *</Label>
                <Input value={form.nameVi} onChange={f('nameVi')} placeholder="Hà Nội" />
              </div>
              <div className="space-y-1">
                <Label>Tên (English) *</Label>
                <Input value={form.nameEn} onChange={f('nameEn')} placeholder="Hanoi" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Quốc gia *</Label>
                <Input value={form.country} onChange={f('country')} placeholder="vietnam" />
              </div>
              <div className="space-y-1">
                <Label>Mã quốc gia (ISO) *</Label>
                <Input value={form.countryCode} onChange={f('countryCode')} placeholder="VN" maxLength={2} className="uppercase" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Vĩ độ (lat) *</Label>
                <Input type="number" step="any" value={form.lat} onChange={f('lat')} placeholder="21.0278" />
              </div>
              <div className="space-y-1">
                <Label>Kinh độ (lng) *</Label>
                <Input type="number" step="any" value={form.lng} onChange={f('lng')} placeholder="105.8342" />
              </div>
            </div>

            {/* Uu tien tai anh len storage cua site; van cho dan URL de tuong thich nguoc */}
            <ImageUploadField
              label="Ảnh bìa"
              value={form.coverImage}
              onChange={(coverImage) => setForm((prev) => ({ ...prev, coverImage }))}
            />
          </div>

          <div className="flex gap-2 mt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
