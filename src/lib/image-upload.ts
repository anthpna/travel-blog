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
