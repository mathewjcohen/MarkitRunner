export default function HistoryLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 w-24 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="h-4 w-48 rounded mt-2 animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
      </div>

      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <section key={i}>
            <div className="h-4 w-40 rounded animate-pulse mb-3" style={{ backgroundColor: 'var(--color-border)' }} />
            <div className="rounded-xl border divide-y" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-start gap-3 px-4 py-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
                    <div className="h-3 w-1/2 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
                  </div>
                  <div className="h-5 w-14 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
