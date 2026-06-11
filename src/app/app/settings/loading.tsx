export default function SettingsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="h-8 w-28 rounded-lg mb-8 animate-pulse" style={{ backgroundColor: '#E8E4DC' }} />
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-6">
          <div className="h-3 w-20 rounded mb-3 animate-pulse" style={{ backgroundColor: '#E8E4DC' }} />
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' }}>
            {[1, 2].map((j) => (
              <div key={j} className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#E8E4DC' }}>
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 w-32 rounded animate-pulse" style={{ backgroundColor: '#E8E4DC' }} />
                  <div className="h-3 w-48 rounded animate-pulse" style={{ backgroundColor: '#F0EDE8' }} />
                </div>
                <div className="h-8 w-24 rounded-xl animate-pulse" style={{ backgroundColor: '#E8E4DC' }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
