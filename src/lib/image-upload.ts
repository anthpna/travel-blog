import { v4 as uuid } from 'uuid'
import sharp from 'sharp'
import { createLogger } from './logger'
import {
  BUCKET_POST_IMAGES,
  IMAGE_MAX_WIDTH,
  IMAGE_WEBP_QUALITY,
  PRIVATE_BUCKETS,
  SIGNED_URL_TTL_SECONDS,
  STORAGE_REF_SCHEME,
  isStorageRef,
  type UploadBucket,
} from '@/config/storage'

export type { UploadBucket }

const log = createLogger('image-upload')

/**
 * Nen + chuyen anh sang WebP roi upload len Supabase Storage
 * (hoac filesystem local khi dev chua co Supabase creds).
 *
 * Gia tri tra ve:
 *   - bucket PUBLIC  -> URL public day du, dung truc tiep lam `src`
 *   - bucket PRIVATE -> ref dang `storage://<bucket>/<path>`, PHAI goi
 *                       `getDisplayUrl()` moi hien thi duoc
 */
export async function uploadImage(
  buffer: Buffer,
  bucket: UploadBucket
): Promise<string> {
  const resized = await sharp(buffer)
    .resize({ width: IMAGE_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: IMAGE_WEBP_QUALITY })
    .toBuffer()

  log.debug('Da nen anh', { bucket, bytesIn: buffer.length, bytesOut: resized.length })

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const ref = await uploadToSupabase(resized, bucket)
      log.info('Upload Supabase thanh cong', { bucket })
      return ref
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        log.error('Upload Supabase that bai', err)
        throw err
      }
      // Dev: Supabase buckets chua tao -> fallback ve local filesystem
      log.warn('Supabase khong dung duoc, fallback filesystem local', {
        reason: (err as Error).message,
      })
      return uploadToLocal(resized, bucket)
    }
  }
  return uploadToLocal(resized, bucket)
}

async function uploadToSupabase(buffer: Buffer, bucket: UploadBucket): Promise<string> {
  const { supabaseAdmin } = await import('./supabase')

  const storagePath =
    bucket === BUCKET_POST_IMAGES ? datedPath() : `${uuid()}.webp`

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(storagePath, buffer, { contentType: 'image/webp', upsert: false })

  if (error) throw new Error(`Supabase upload failed: ${error.message}`)

  if (!PRIVATE_BUCKETS.includes(bucket)) {
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath)
    return data.publicUrl
  }

  // Bucket private -> tra ref, chi sinh signed URL khi thuc su can hien thi
  return `${STORAGE_REF_SCHEME}${bucket}/${storagePath}`
}

/**
 * Doi mot gia tri coverImage thanh URL HIEN THI duoc.
 *
 * - URL public / duong dan noi bo  -> giu nguyen
 * - ref `storage://<bucket>/<path>` -> sinh signed URL co han (bucket private)
 *
 * Ham nay CHI chay server-side (can service role key). Goi tu API route hoac
 * Server Component, khong bao gio tu client.
 *
 * @param value - gia tri coverImage lay tu DB
 * @returns URL hien thi duoc, hoac `null` neu khong sinh duoc
 */
export async function getDisplayUrl(value: string | null | undefined): Promise<string | null> {
  if (!value) return null
  if (!isStorageRef(value)) return value

  const { bucket, path } = parseStorageRef(value)

  try {
    const { supabaseAdmin } = await import('./supabase')
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)

    if (error || !data?.signedUrl) {
      log.warn('Khong sinh duoc signed URL', { bucket, reason: error?.message })
      return null
    }
    log.debug('Da sinh signed URL', { bucket, ttl: SIGNED_URL_TTL_SECONDS })
    return data.signedUrl
  } catch (err) {
    log.error('Loi khi sinh signed URL', err)
    return null
  }
}

/**
 * Chuyen anh tu bucket private (submission-images) sang bucket public (post-images).
 * Dung khi duyet submission -> post: anh cover cua post public phai nam o bucket public
 * moi hien thi duoc. Neu input khong phai `storage://` (da la URL public) thi giu nguyen.
 */
export async function promoteToPublicBucket(storageRef: string): Promise<string> {
  if (!isStorageRef(storageRef)) return storageRef

  const { supabaseAdmin } = await import('./supabase')
  const { bucket: srcBucket, path: srcPath } = parseStorageRef(storageRef)

  // Tai file tu bucket private
  const { data: file, error: dlErr } = await supabaseAdmin.storage.from(srcBucket).download(srcPath)
  if (dlErr || !file) {
    log.error('Tai anh tu bucket private that bai', { srcBucket, reason: dlErr?.message })
    throw new Error(`Tai anh tu ${srcBucket} that bai: ${dlErr?.message ?? 'khong co file'}`)
  }
  const buffer = Buffer.from(await file.arrayBuffer())

  // Upload sang bucket public theo quy uoc {year}/{month}/{uuid}.webp
  const destPath = datedPath()
  const { error: upErr } = await supabaseAdmin.storage
    .from(BUCKET_POST_IMAGES)
    .upload(destPath, buffer, { contentType: 'image/webp', upsert: false })
  if (upErr) {
    log.error('Chuyen anh sang bucket public that bai', { reason: upErr.message })
    throw new Error(`Upload anh sang ${BUCKET_POST_IMAGES} that bai: ${upErr.message}`)
  }

  const { data } = supabaseAdmin.storage.from(BUCKET_POST_IMAGES).getPublicUrl(destPath)
  log.info('Da chuyen anh sang bucket public', { destBucket: BUCKET_POST_IMAGES })
  return data.publicUrl
}

/** Tach `storage://<bucket>/<path>` thanh cap { bucket, path } */
function parseStorageRef(ref: string): { bucket: string; path: string } {
  const withoutScheme = ref.slice(STORAGE_REF_SCHEME.length)
  const slashIdx = withoutScheme.indexOf('/')
  return {
    bucket: withoutScheme.slice(0, slashIdx),
    path: withoutScheme.slice(slashIdx + 1),
  }
}

/** Sinh path dang `{year}/{month}/{uuid}.webp` */
function datedPath(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}/${month}/${uuid()}.webp`
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

  const url = `/${relDir.replace(/\\/g, '/')}/${filename}`
  log.info('Upload filesystem local thanh cong', { bucket })
  return url
}
