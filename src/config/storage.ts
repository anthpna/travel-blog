/**
 * Cau hinh luu tru anh (Supabase Storage / filesystem fallback).
 *
 * Tat ca tham so cua pipeline upload deu tap trung o day - khong hardcode trong
 * `src/lib/image-upload.ts` hay cac API route.
 */

// Ten bucket. `post-images` la bucket PUBLIC, `submission-images` la bucket PRIVATE.
export const BUCKET_POST_IMAGES = 'post-images'
export const BUCKET_SUBMISSION_IMAGES = 'submission-images'

// Danh sach bucket hop le - dung de validate input tu client
export const VALID_BUCKETS = [BUCKET_POST_IMAGES, BUCKET_SUBMISSION_IMAGES] as const
export type UploadBucket = (typeof VALID_BUCKETS)[number]

// Bucket nao la private (can signed URL moi xem duoc)
export const PRIVATE_BUCKETS: readonly string[] = [BUCKET_SUBMISSION_IMAGES]

// Tham so xu ly anh bang Sharp truoc khi upload
export const IMAGE_MAX_WIDTH = 1920
export const IMAGE_WEBP_QUALITY = 82

// Gioi han dung luong file goc cho upload cong khai (form gui bai)
export const SUBMISSION_MAX_UPLOAD_BYTES = 5 * 1024 * 1024 // 5MB

// Thoi han hieu luc cua signed URL sinh cho bucket private (giay)
export const SIGNED_URL_TTL_SECONDS = 60 * 60 // 1 gio

// Scheme noi bo danh dau anh nam trong bucket private, dang:
//   storage://<bucket>/<path>
export const STORAGE_REF_SCHEME = 'storage://'

/** Kiem tra mot chuoi co phai ref bucket private hay khong */
export function isStorageRef(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.startsWith(STORAGE_REF_SCHEME)
}

/** Kiem tra ten bucket do client gui len co hop le hay khong */
export function isValidBucket(value: unknown): value is UploadBucket {
  return typeof value === 'string' && (VALID_BUCKETS as readonly string[]).includes(value)
}
