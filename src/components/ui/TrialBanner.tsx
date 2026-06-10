'use client'

import { useState } from 'react'

interface TrialBannerProps {
  daysLeft: number
  tier: string
}

export function TrialBanner({ daysLeft, tier }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || tier !== 'trial' || daysLeft > 7) {
    return null
  }

  return (
    <div
      className="sticky top-14 z-9 border-b"
      style={{ backgroundColor: '#FFFBF5', borderColor: '#E8E4DC' }}
    >
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span style={{ color: '#B8601F', fontSize: '14px', fontWeight: '500' }}>
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left in your trial
          </span>
          <a
            href="/upgrade"
            className="text-sm underline cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: '#B8601F' }}
          >
            Upgrade now
          </a>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-lg leading-none cursor-pointer transition-opacity hover:opacity-50"
          style={{ color: '#736C5E' }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
