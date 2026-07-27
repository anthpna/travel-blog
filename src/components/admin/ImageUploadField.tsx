'use client'

import { useRef, useState } from 'react'
import SafeImage from '@/components/ui/SafeImage'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createLogger } from '@/lib/logger'
import { BUCKET_POST_IMAGES, type UploadBucket } from '@/config/storage'
import { isOptimizableImage } from '@/config/image-hosts.mjs'

const log = createLogger('ImageUploadField')

/**
 * O nhap anh bia dung chung cho toan bo form admin (Post / Destination / Series).
 *
 * Hai cach nhap, uu tien cach 1:
 *   1. TAI ANH LEN  -> day file qua `/api/upload`, anh nam tren Supabase Storage
 *                      (bucket public) nen luon hien thi va luon duoc optimize.
 *   2. DAN URL      -> giu lai de tuong thich nguoc voi du lieu cu. Neu host khong
 *                      nam trong allowlist, component canh bao ngay tai form de
 *                      admin biet anh se khong duoc optimize.
 *
 * Gia tri `value` chinh la thu se luu vao DB (cot `coverImage`).
 */

interface Props {
  label: string
  value: string | null
  onChange: (value: string | null) => void
  /** Bucket dich; mac dinh `post-images` (public) cho moi form admin */
  bucket?: UploadBucket
  /** Cho phep dan URL thu cong ben canh nut upload */
  allowManualUrl?: boolean
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  bucket = BUCKET_POST_IMAGES,
  allowManualUrl = true,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', bucket)

      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Upload thất bại')

      onChange(data.url)
      log.info('Upload anh bia thanh cong', { bucket })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload thất bại'
      log.error('Upload anh bia that bai', err)
      setError(message)
    } finally {
      setUploading(false)
      // Reset de chon lai cung mot file van kich hoat onChange
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Preview - SafeImage tu xu ly URL la / anh chet */}
      {value && (
        <div className="relative w-full h-36 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <SafeImage src={value} alt="Ảnh bìa" fill sizes="(max-width: 640px) 100vw, 480px" className="object-cover" />
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <label
          className={`inline-flex items-center px-3 py-1.5 rounded-md border text-sm cursor-pointer transition-colors ${
            uploading
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {uploading ? 'Đang tải lên...' : value ? 'Đổi ảnh' : 'Tải ảnh lên'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>

        {value && (
          <button
            type="button"
            onClick={() => { onChange(null); setError('') }}
            className="text-sm text-red-500 hover:underline"
          >
            Xóa ảnh
          </button>
        )}
      </div>

      {allowManualUrl && (
        <div className="space-y-1 pt-1">
          <span className="block text-xs text-gray-400">
            Hoặc dán URL ảnh có sẵn
          </span>
          <Input
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="https://..."
          />
        </div>
      )}

      {/* Canh bao som ngay tai form neu host ngoai allowlist - anh van hien thi
          duoc nho SafeImage nhung se khong duoc nen/resize */}
      {value && !isOptimizableImage(value) && (
        <p className="text-xs text-amber-600">
          Ảnh từ nguồn ngoài nên sẽ không được tối ưu (nén/resize). Bấm “Tải ảnh lên”
          để đưa ảnh về storage của site.
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
