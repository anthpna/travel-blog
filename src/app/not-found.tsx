import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-gray-100 select-none mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trang không tồn tại</h1>
        <p className="text-gray-500 mb-8">
          Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Về trang chủ
        </Link>
      </div>
    </div>
  )
}
