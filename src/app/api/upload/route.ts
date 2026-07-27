import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, getDisplayUrl } from '@/lib/image-upload'
import { createLogger } from '@/lib/logger'
import {
  BUCKET_POST_IMAGES,
  BUCKET_SUBMISSION_IMAGES,
  SUBMISSION_MAX_UPLOAD_BYTES,
  isValidBucket,
} from '@/config/storage'

const log = createLogger('api/upload')

/**
 * Upload anh.
 *
 * Response:
 *   {
 *     url:        string  // gia tri LUU vao DB (URL public hoac ref `storage://...`)
 *     previewUrl: string  // URL HIEN THI ngay tren client (signed neu bucket private)
 *   }
 *
 * Tach lam 2 truong vi bucket `submission-images` la private: `url` khong render
 * truc tiep duoc, con `previewUrl` la signed URL co han dung cho o preview.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  const rawBucket = form.get('bucket')
  const bucket = isValidBucket(rawBucket) ? rawBucket : BUCKET_POST_IMAGES

  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  if (bucket === BUCKET_SUBMISSION_IMAGES && file.size > SUBMISSION_MAX_UPLOAD_BYTES) {
    const limitMb = Math.round(SUBMISSION_MAX_UPLOAD_BYTES / 1024 / 1024)
    log.warn('Tu choi file vuot gioi han', { bucket, bytes: file.size })
    return NextResponse.json(
      { error: `File quá lớn (tối đa ${limitMb}MB)` },
      { status: 400 }
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadImage(buffer, bucket)
    // Sinh URL hien thi ngay de client preview khong can goi them endpoint
    const previewUrl = await getDisplayUrl(url)

    log.info('Upload hoan tat', { bucket })
    return NextResponse.json({ url, previewUrl })
  } catch (err) {
    log.error('Upload that bai', err)
    return NextResponse.json({ error: 'Upload ảnh thất bại' }, { status: 500 })
  }
}
