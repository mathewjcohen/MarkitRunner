'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateWeeklyPlan } from '@/actions/ai'

interface BusinessCardActionsProps {
  businessId: string
  weekStartDate: string
  hasTasks: boolean
}

export function BusinessCardActions({ businessId, weekStartDate, hasTasks }: BusinessCardActionsProps) {
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
      router.push('/app/weekly')
    }
  }

  return (
    <div className="flex flex-col gap-2 mt-4 pt-4 border-t" style={{ borderColor: '#E8E4DC' }}>
      {error && (
        <p className="text-xs" style={{ color: '#991B1B' }}>{error}</p>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGeneratePlan}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-opacity disabled:opacity-60 hover:opacity-80"
          style={{ backgroundColor: '#B8601F', color: '#FFFFFF' }}
        >
          {loading ? 'Generating…' : hasTasks ? 'Regenerate plan' : 'Generate plan'}
        </button>
        {hasTasks && (
          <a
            href="/app/weekly"
            className="text-sm font-medium cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: '#B8601F' }}
          >
            View week →
          </a>
        )}
        <a
          href="/app/today"
          className="text-sm cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: '#736C5E' }}
        >
          Today
        </a>
      </div>
    </div>
  )
}
