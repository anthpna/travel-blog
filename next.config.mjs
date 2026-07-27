// Danh sach host anh remote lay tu file config dung chung voi runtime (SafeImage)
import { REMOTE_IMAGE_PATTERNS } from './src/config/image-hosts.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: REMOTE_IMAGE_PATTERNS,
  },
}

export default nextConfig;
