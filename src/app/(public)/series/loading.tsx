export default function SeriesLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-40 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-56 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 overflow-hidden bg-white">
            <div className="aspect-[16/9] bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
