export default function DestinationsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-40 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-64 mb-8" />
      <div className="rounded-2xl bg-gray-200 mb-12" style={{ height: 480 }} />
      <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 overflow-hidden bg-white">
            <div className="aspect-[16/9] bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
