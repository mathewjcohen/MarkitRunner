'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateWeeklyPlan } from '@/actions/ai'
import type { Business } from '@/types'

interface GeneratePlanButtonProps {
  businesses: Business[]
  weekStartDate: string
  defaultBusinessId?: string
}

export function GeneratePlanButton({
  businesses,
  weekStartDate,
  defaultBusinessId,
}: GeneratePlanButtonProps) {
  const router = useRouter()
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(defaultBusinessId || businesses[0]?.id || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleGeneratePlan() {
    if (!selectedBusinessId) {
      setError('Please select a business')
      return
    }

    setLoading(true)
    setError(null)

    const result = await generateWeeklyPlan(selectedBusinessId, weekStartDate)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Refresh the page to show newly generated tasks
      timeoutRef.current = setTimeout(() => {
        router.refresh()
        setLoading(false)
      }, 500)
    }
  }

  if (businesses.length === 0) {
    return (
      <div
        className="rounded-xl p-4 text-sm text-center"
        style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
      >
        No businesses found. Create one on the dashboard to generate a weekly plan.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        {businesses.length > 1 && (
          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl border text-sm cursor-pointer disabled:opacity-60"
            style={{
              borderColor: '#E8E4DC',
              backgroundColor: '#FFFFFF',
              color: '#18160F',
            }}
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={handleGeneratePlan}
          disabled={loading}
          className="px-6 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-60"
          style={{
            backgroundColor: '#B8601F',
            color: '#FFFFFF',
          }}
        >
          {loading ? 'Generating...' : 'Generate plan'}
        </button>
      </div>

      {error && (
        <div
          className="rounded-xl p-3 text-sm"
          style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
        >
          {error}
        </div>
      )}
    </div>
  )
}
