/**
 * Cau hinh host anh remote duoc phep di qua Next.js Image Optimizer (`/_next/image`).
 *
 * File nay la NGUON DUY NHAT, dung chung boi:
 *   - `next.config.mjs`            -> sinh `images.remotePatterns` luc build
 *   - `src/components/ui/SafeImage.tsx` -> kiem tra luc render de tranh loi 400
 *
 * Ly do ton tai: cac truong `coverImage` cua Destination / Series / Post duoc admin
 * nhap TAY bang URL tu do (vd: upload.wikimedia.org). Neu host khong nam trong
 * `remotePatterns`, Vercel tra ve
 *     400 BAD_REQUEST - INVALID_IMAGE_OPTIMIZE_REQUEST
 * va anh khong hien thi. SafeImage doc lai danh sach nay de tu dong chuyen sang
 * che do `unoptimized` (tai truc tiep tu nguon) thay vi de vo anh.
 *
 * Muon toi uu them mot host moi: chi can them 1 dong vao REMOTE_IMAGE_PATTERNS
 * roi build lai. Khong can sua code component.
 */

/**
 * Danh sach pattern host duoc Image Optimizer chap nhan.
 * Cu phap giong `images.remotePatterns` cua Next.js:
 *   - hostname: ho tro `*` (1 nhan) va `**` (nhieu nhan)
 *   - pathname: ho tro `*` va `**` (bo qua neu khong khai bao)
 */
export const REMOTE_IMAGE_PATTERNS = [
  // Supabase Storage - noi luu anh do he thong tu upload (bucket public)
  {
    protocol: 'https',
    hostname: '*.supabase.co',
    pathname: '/storage/v1/object/public/**',
  },
  // Wikimedia Commons - nguon anh mien phi hay duoc dan vao o "URL anh bia"
  {
    protocol: 'https',
    hostname: 'upload.wikimedia.org',
  },
  // Unsplash - nguon anh stock pho bien
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  // Local dev uploads (fallback filesystem khi chua co Supabase creds)
  {
    protocol: 'http',
    hostname: 'localhost',
  },
]

// Bat canh bao console khi anh bi ha cap xuong unoptimized (chi nen bat o dev)
export const WARN_ON_UNOPTIMIZED = process.env.NODE_ENV !== 'production'

/**
 * Doi mot glob pattern cua Next.js sang RegExp.
 * @param {string} pattern - chuoi glob, vd `*.supabase.co` hoac `/storage/**`
 * @param {string} singleWildcardClass - lop ky tu ma `*` duoc phep khop
 */
function globToRegExp(pattern, singleWildcardClass) {
  // Escape toan bo ky tu dac biet cua regex, giu lai `*` de xu ly rieng
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
  // `**` -> khop moi thu; `*` -> khop trong pham vi 1 nhan / 1 doan path
  // Doi `**` va `*` trong MOT luot de khong can ky tu sentinel trung gian
  const body = escaped.replace(/\*\*|\*/g, (m) =>
    m === '**' ? '.*' : singleWildcardClass
  )
  return new RegExp(`^${body}$`)
}

/**
 * Kiem tra mot URL co khop bat ky pattern nao trong danh sach hay khong.
 * @param {URL} url
 * @returns {boolean}
 */
function matchesAnyPattern(url) {
  return REMOTE_IMAGE_PATTERNS.some((p) => {
    if (p.protocol && `${p.protocol}:` !== url.protocol) return false
    if (p.port !== undefined && String(p.port) !== url.port) return false
    if (!globToRegExp(p.hostname, '[^.]*').test(url.hostname)) return false
    if (p.pathname && !globToRegExp(p.pathname, '[^/]*').test(url.pathname)) return false
    return true
  })
}

/**
 * Cho biet `src` co the di qua Image Optimizer an toan hay khong.
 *
 * Tra ve `false` (=> can render unoptimized) trong cac truong hop:
 *   - src rong / null
 *   - scheme la `storage://` (ref bucket private, chua doi sang URL public)
 *   - `data:` / `blob:` (Optimizer khong ho tro)
 *   - URL khong parse duoc
 *   - host khong nam trong REMOTE_IMAGE_PATTERNS
 *
 * @param {string | null | undefined} src
 * @returns {boolean}
 */
export function isOptimizableImage(src) {
  if (!src || typeof src !== 'string') return false

  // Duong dan noi bo cung origin (vd `/uploads/...`) luon duoc Optimizer chap nhan.
  // Loai tru `//host/...` (protocol-relative) vi thuc chat la remote.
  if (src.startsWith('/') && !src.startsWith('//')) return true

  try {
    const url = new URL(src)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    return matchesAnyPattern(url)
  } catch {
    return false
  }
}
