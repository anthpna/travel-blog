import { v4 as uuid } from 'uuid'
import sharp from 'sharp'

export type UploadBucket = 'post-images' | 'submission-images'

export async function uploadImage(
  buffer: Buffer,
  bucket: UploadBucket
): Promise<string> {
  const resized = await sharp(buffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      return await uploadToSupabase(resized, bucket)
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err
      // Dev: Supabase buckets chưa tạo → fallback về local filesystem
      console.warn('[image-upload] Supabase unavailable, using local fallback:', (err as Error).message)
      return uploadToLocal(resized, bucket)
    }
  }
  return uploadToLocal(resized, bucket)
}

async function uploadToSupabase(buffer: Buffer, bucket: UploadBucket): Promise<string> {
  const { supabaseAdmin } = await import('./supabase')

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const filename = `${uuid()}.webp`

  const storagePath =
    bucket === 'post-images' ? `${year}/${month}/${filename}` : filename

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(storagePath, buffer, { contentType: 'image/webp', upsert: false })

  if (error) throw new Error(`Supabase upload failed: ${error.message}`)

  if (bucket === 'post-images') {
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath)
    return data.publicUrl
  }

  // submission-images là private bucket — trả path để tạo signed URL khi cần
  return `storage://${bucket}/${storagePath}`
}

/**
 * Chuyen anh tu bucket private (submission-images) sang bucket public (post-images).
 * Dung khi duyet submission -> post: anh cover cua post public phai nam o bucket public
 * moi hien thi duoc. Input dang "storage://<bucket>/<path>" (do uploadToSupabase tra ve
 * cho bucket private). Neu input khong phai storage:// (da la URL public/thuong) thi giu nguyen.
 */
export async function promoteToPublicBucket(storageRef: string): Promise<string> {
  if (!storageRef.startsWith('storage://')) return storageRef

  const { supabaseAdmin } = await import('./supabase')

  // Tach bucket nguon va path tu "storage://<bucket>/<path>"
  const withoutScheme = storageRef.slice('storage://'.length)
  const slashIdx = withoutScheme.indexOf('/')
  const srcBucket = withoutScheme.slice(0, slashIdx)
  const srcPath = withoutScheme.slice(slashIdx + 1)

  // Tai file tu bucket private
  const { data: file, error: dlErr } = await supabaseAdmin.storage.from(srcBucket).download(srcPath)
  if (dlErr || !file) throw new Error(`Tai anh tu ${srcBucket} that bai: ${dlErr?.message ?? 'khong co file'}`)
  const buffer = Buffer.from(await file.arrayBuffer())

  // Upload sang bucket public post-images theo quy uoc {year}/{month}/{uuid}.webp
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const destPath = `${year}/${month}/${uuid()}.webp`
  const { error: upErr } = await supabaseAdmin.storage
    .from('post-images')
    .upload(destPath, buffer, { contentType: 'image/webp', upsert: false })
  if (upErr) throw new Error(`Upload anh sang post-images that bai: ${upErr.message}`)

  const { data } = supabaseAdmin.storage.from('post-images').getPublicUrl(destPath)
  return data.publicUrl
}

async function uploadToLocal(buffer: Buffer, bucket: UploadBucket): Promise<string> {
  const nodePath = await import('path')
  const fs = await import('fs/promises')

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const filename = `${uuid()}.webp`

  const relDir = nodePath.join('uploads', bucket, String(year), month)

  const absDir = nodePath.join(process.cwd(), 'public', relDir)
  await fs.mkdir(absDir, { recursive: true })
  await fs.writeFile(nodePath.join(absDir, filename), buffer)

  return `/${relDir.replace(/\\/g, '/')}/${filename}`
}
