'use client'

export function OnboardingBanner() {
  return (
    <div
      className="sticky top-14 z-[9] border-b"
      style={{ backgroundColor: '#FFFBF5', borderColor: '#E8E4DC' }}
    >
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-medium flex-shrink-0" style={{ color: '#B8601F' }}>
            Setup not complete
          </span>
          <span className="text-sm truncate" style={{ color: '#736C5E' }}>
            Finish setup to generate your first marketing plan.
          </span>
        </div>
        <a
          href="/onboarding"
          className="text-sm font-medium underline flex-shrink-0 cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: '#B8601F' }}
        >
          Finish setup →
        </a>
      </div>
    </div>
  )
}
