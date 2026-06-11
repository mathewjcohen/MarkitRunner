'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateWeeklyPlan } from '@/actions/ai'

interface BusinessCardActionsProps {
  businessId: string
  weekStartDate: string
  hasTasks: boolean
  onViewWeek?: () => void
}

export function BusinessCardActions({ businessId, weekStartDate, hasTasks, onViewWeek }: BusinessCardActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGeneratePlan() {
    setLoading(true)
    setError(null)
    const result = await generateWeeklyPlan(businessId, weekStartDate)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/app/dashboard')
    }
  }

  return (
    <div className="flex flex-col gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
      {error && (
        <p className="text-xs" style={{ color: '#991B1B' }}>{error}</p>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGeneratePlan}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-opacity disabled:opacity-60 hover:opacity-80"
          style={{ backgroundColor: 'var(--color-accent)', color: '#FFFFFF' }}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Generating plan…
            </>
          ) : (
            hasTasks ? 'Regenerate plan' : 'Generate plan'
          )}
        </button>
        {hasTasks && onViewWeek && (
          <button
            onClick={onViewWeek}
            className="text-sm font-medium cursor-pointer transition-opacity hover:opacity-70 bg-transparent border-0 p-0"
            style={{ color: 'var(--color-accent)' }}
          >
            View week →
          </button>
        )}
      </div>
      {!hasTasks && !loading && (
        <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
          Creates a focused task per channel for this week — run it at the start of each week.
        </p>
      )}
    </div>
  )
}
