'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-gray-100 select-none mb-4">500</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h1>
        <p className="text-gray-500 mb-8">
          Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc quay về trang chủ.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
