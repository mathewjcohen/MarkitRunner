export default function WeeklyLoading() {
  return (
    <div className="px-4 py-8 max-w-6xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-7 rounded-lg mb-2" style={{ backgroundColor: '#E8E4DC', width: '8rem' }} />
        <div className="h-4 rounded-lg" style={{ backgroundColor: '#E8E4DC', width: '14rem' }} />
      </div>

      {/* Button skeleton */}
      <div className="mb-8 h-10 rounded-xl" style={{ backgroundColor: '#E8E4DC' }} />

      {/* Grid skeleton - 7 columns on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="rounded-xl border" style={{ borderColor: '#E8E4DC' }}>
            {/* Day header */}
            <div className="px-4 py-3 border-b h-12" style={{ borderBottomColor: '#E8E4DC', backgroundColor: '#F7F5F1' }} />

            {/* Tasks placeholder */}
            <div className="px-4 py-3 flex flex-col gap-3 min-h-48">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="h-16 rounded-lg" style={{ backgroundColor: '#E8E4DC' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
