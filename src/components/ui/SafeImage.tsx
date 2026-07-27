'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { isOptimizableImage, WARN_ON_UNOPTIMIZED } from '@/config/image-hosts.mjs'
import { createLogger } from '@/lib/logger'

const log = createLogger('SafeImage')

/**
 * SafeImage - lop boc quanh `next/image` cho cac anh do NGUOI DUNG nhap URL tu do
 * (coverImage cua Destination / Series / Post).
 *
 * Van de goc: Vercel Image Optimizer chi nhan host nam trong `images.remotePatterns`.
 * Neu admin dan URL host la (vd `upload.wikimedia.org`) ma host do chua duoc khai bao,
 * request `/_next/image?url=...` tra ve:
 *      400 BAD_REQUEST - INVALID_IMAGE_OPTIMIZE_REQUEST
 * => anh vo tren trang public.
 *
 * Cach xu ly cua component:
 *   1. Host NAM trong allowlist  -> dung `next/image` binh thuong (co toi uu WebP/AVIF, resize).
 *   2. Host NGOAI allowlist      -> tu dong bat `unoptimized` (tai thang tu nguon),
 *                                   anh van hien thi, khong con loi 400.
 *   3. Anh loi khi tai (404/dead link) -> hien placeholder thay vi icon anh vo.
 *
 * Nho vay UI khong bao gio "chet" vi mot URL la, con danh sach host toi uu van kiem soat
 * duoc tap trung o `src/config/image-hosts.mjs`.
 */

interface SafeImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string | null | undefined
  /** Noi dung hien thi khi khong co anh hoac anh tai loi (mac dinh: khoi gradient xam) */
  fallback?: React.ReactNode
}

// Placeholder mac dinh khi khong co anh / anh loi
const DEFAULT_FALLBACK = (
  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
)

export default function SafeImage({ src, fallback, alt, ...rest }: SafeImageProps) {
  const [failed, setFailed] = useState(false)

  // Khong co src hoac da xac dinh tai loi -> tra ve placeholder
  if (!src || failed) return <>{fallback ?? DEFAULT_FALLBACK}</>

  const optimizable = isOptimizableImage(src)

  if (!optimizable && WARN_ON_UNOPTIMIZED) {
    // Canh bao o dev de admin biet nen dua anh ve Supabase Storage hoac bo sung host
    log.warn('Host anh ngoai allowlist, render unoptimized', { src })
  }

  return (
    <Image
      {...rest}
      src={src}
      alt={alt}
      unoptimized={!optimizable}
      onError={() => {
        log.error('Tai anh that bai, dung fallback', { src })
        setFailed(true)
      }}
    />
  )
}
