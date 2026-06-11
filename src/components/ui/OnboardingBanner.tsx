'use client'

export function OnboardingBanner() {
  return (
    <div
      className="sticky top-14 z-[9] border-b"
      style={{ backgroundColor: 'var(--color-accent-subtle)', borderColor: 'var(--color-border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-medium flex-shrink-0" style={{ color: 'var(--color-accent)' }}>
            Setup not complete
          </span>
          <span className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>
            Finish setup to generate your first marketing plan.
          </span>
        </div>
        <a
          href="/onboarding"
          className="text-sm font-medium underline flex-shrink-0 cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-accent)' }}
        >
          Finish setup →
        </a>
      </div>
    </div>
  )
}
