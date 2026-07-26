'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { JSONContent } from '@tiptap/core'

const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), { ssr: false })

type Destination = { id: string; nameVi: string }
type Series = { id: string; titleVi: string }

type PostFormData = {
  titleVi: string
  titleEn: string
  excerptVi: string
  excerptEn: string
  contentVi: JSONContent | null
  contentEn: JSONContent | null
  coverImage: string
  status: string
  featured: boolean
  destinationId: string
  seriesId: string
  seriesOrder: string
}

interface PostFormProps {
  initialData?: Partial<PostFormData> & { id?: string }
}

export default function PostForm({ initialData }: PostFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [form, setForm] = useState<PostFormData>({
    titleVi: initialData?.titleVi ?? '',
    titleEn: initialData?.titleEn ?? '',
    excerptVi: initialData?.excerptVi ?? '',
    excerptEn: initialData?.excerptEn ?? '',
    contentVi: initialData?.contentVi ?? null,
    contentEn: initialData?.contentEn ?? null,
    coverImage: initialData?.coverImage ?? '',
    status: initialData?.status ?? 'DRAFT',
    featured: initialData?.featured ?? false,
    destinationId: initialData?.destinationId ?? '',
    seriesId: initialData?.seriesId ?? '',
    seriesOrder: initialData?.seriesOrder ?? '',
  })

  const [destinations, setDestinations] = useState<Destination[]>([])
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)

  useEffect(() => {
    fetch('/api/destinations').then((r) => r.json()).then(setDestinations)
    fetch('/api/series').then((r) => r.json()).then(setSeriesList)
  }, [])

  const set = (key: keyof PostFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'post-images')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    set('coverImage', url)
    setCoverUploading(false)
    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titleVi || !form.excerptVi || !form.contentVi) {
      setError('Vui lòng điền tiêu đề, tóm tắt và nội dung tiếng Việt.')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      contentEn: form.contentEn ?? undefined,
      destinationId: form.destinationId || undefined,
      seriesId: form.seriesId || undefined,
      seriesOrder: form.seriesOrder ? Number(form.seriesOrder) : undefined,
    }

    const url = isEdit ? `/api/posts/${initialData!.id}` : '/api/posts'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Có lỗi xảy ra.')
      setSaving(false)
      return
    }

    router.push('/admin/posts')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Tiêu đề (tiếng Việt) *</Label>
          <Input value={form.titleVi} onChange={(e) => set('titleVi', e.target.value)} placeholder="Tiêu đề bài viết" />
        </div>
        <div className="space-y-1">
          <Label>Tiêu đề (English)</Label>
          <Input value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} placeholder="Post title (optional)" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Tóm tắt (tiếng Việt) *</Label>
          <Textarea rows={3} value={form.excerptVi} onChange={(e) => set('excerptVi', e.target.value)} placeholder="Mô tả ngắn hiển thị trong danh sách bài..." />
        </div>
        <div className="space-y-1">
          <Label>Tóm tắt (English)</Label>
          <Textarea rows={3} value={form.excerptEn} onChange={(e) => set('excerptEn', e.target.value)} placeholder="Short description (optional)" />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Nội dung *</Label>
        <TiptapEditor
          valueVi={form.contentVi}
          valueEn={form.contentEn}
          onChange={(lang, json) => set(lang === 'vi' ? 'contentVi' : 'contentEn', json)}
        />
      </div>

      <div className="space-y-1">
        <Label>Ảnh bìa</Label>
        <div className="flex items-center gap-3">
          {form.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.coverImage} alt="cover" className="h-16 w-24 object-cover rounded" />
          )}
          <label className="cursor-pointer px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50 text-gray-700">
            {coverUploading ? 'Đang upload...' : 'Chọn ảnh'}
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={coverUploading} />
          </label>
          {form.coverImage && (
            <button type="button" onClick={() => set('coverImage', '')} className="text-sm text-red-500 hover:underline">Xóa ảnh</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <Label>Trạng thái</Label>
          <Select value={form.status} onValueChange={(v) => set('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Nháp</SelectItem>
              <SelectItem value="PUBLISHED">Đăng</SelectItem>
              <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Điểm đến</Label>
          <Select value={form.destinationId || 'none'} onValueChange={(v) => set('destinationId', v === 'none' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {destinations.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.nameVi}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Series</Label>
          <Select value={form.seriesId || 'none'} onValueChange={(v) => set('seriesId', v === 'none' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {seriesList.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.titleVi}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {form.seriesId && (
          <div className="space-y-1">
            <Label>Thứ tự trong series</Label>
            <Input
              type="number"
              min={1}
              value={form.seriesOrder}
              onChange={(e) => set('seriesOrder', e.target.value)}
              placeholder="1"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="featured"
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set('featured', e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="featured" className="cursor-pointer">Đánh dấu nổi bật (featured)</Label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo bài'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/posts')}>
          Hủy
        </Button>
      </div>
    </form>
  )
}
