export default function AboutLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-9 bg-gray-200 rounded w-48 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-56 mb-10" />
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="flex-shrink-0 w-36 h-36 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white py-6 px-4">
            <div className="h-10 bg-gray-200 rounded w-16 mx-auto mb-2" />
            <div className="h-4 bg-gray-100 rounded w-24 mx-auto" />
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-gray-200" style={{ height: 280 }} />
    </div>
  )
}
