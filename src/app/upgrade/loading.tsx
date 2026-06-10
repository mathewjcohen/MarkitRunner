export default function UpgradeLoading() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F5F1' }}>
      {/* Header skeleton */}
      <header
        className="border-b"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="h-5 rounded-lg w-48 animate-pulse" style={{ backgroundColor: '#E8E4DC' }} />
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="h-10 rounded-lg w-64 mb-2 animate-pulse" style={{ backgroundColor: '#E8E4DC' }} />
            <div className="h-6 rounded-lg w-96 animate-pulse" style={{ backgroundColor: '#E8E4DC' }} />
          </div>

          {/* Toggle skeleton */}
          <div className="flex items-center gap-4 mb-8 justify-center animate-pulse">
            <div className="h-10 rounded-lg w-20" style={{ backgroundColor: '#E8E4DC' }} />
            <div className="h-10 rounded-lg w-24" style={{ backgroundColor: '#E8E4DC' }} />
            <div className="h-10 rounded-lg w-20" style={{ backgroundColor: '#E8E4DC' }} />
          </div>

          {/* Pricing cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl border p-8 animate-pulse" style={{ borderColor: '#E8E4DC', backgroundColor: '#FFFFFF' }}>
                <div className="h-6 rounded-lg w-20 mb-4" style={{ backgroundColor: '#E8E4DC' }} />
                <div className="h-12 rounded-lg w-32 mb-6" style={{ backgroundColor: '#E8E4DC' }} />
                <div className="space-y-3 mb-6">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="h-4 rounded-lg w-full" style={{ backgroundColor: '#E8E4DC' }} />
                  ))}
                </div>
                <div className="h-10 rounded-lg w-full" style={{ backgroundColor: '#E8E4DC' }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
