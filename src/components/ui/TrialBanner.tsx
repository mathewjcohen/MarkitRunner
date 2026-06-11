'use client'

import { useState } from 'react'

interface TrialBannerProps {
  daysLeft: number
  tier: string
}

export function TrialBanner({ daysLeft, tier }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || tier !== 'trial' || daysLeft <= 0 || daysLeft > 7) {
    return null
  }

  return (
    <div
      className="sticky top-14 z-[9] border-b"
      style={{ backgroundColor: 'var(--color-accent-subtle)', borderColor: 'var(--color-border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--color-accent)', fontSize: '14px', fontWeight: '500' }}>
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left in your trial
          </span>
          <a
            href="/upgrade"
            className="text-sm underline cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-accent)' }}
          >
            Upgrade now
          </a>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-lg leading-none cursor-pointer transition-opacity hover:opacity-50"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
