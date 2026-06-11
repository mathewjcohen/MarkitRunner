'use client'

import { useState } from 'react'
import { updateWeekStartDay } from '@/actions/settings'

const DAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

interface SettingsWeekStartProps {
  currentDay: number
}

export function SettingsWeekStart({ currentDay }: SettingsWeekStartProps) {
  const [selected, setSelected] = useState(currentDay)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(value: number) {
    setSelected(value)
    setLoading(true)
    setSaved(false)
    setError(null)

    const result = await updateWeekStartDay(value)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
      setSelected(currentDay)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          Week starts on
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Affects how weekly plans and task views are grouped
        </p>
      </div>
      <div className="flex items-center gap-2">
        {error && <span className="text-xs" style={{ color: '#DC2626' }}>{error}</span>}
        {saved && <span className="text-xs" style={{ color: '#16A34A' }}>Saved</span>}
        {loading && (
          <svg
            className="animate-spin"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        )}
        <select
          value={selected}
          onChange={(e) => handleChange(Number(e.target.value))}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl text-sm cursor-pointer disabled:opacity-60"
          style={{
            backgroundColor: 'var(--color-surface-raised)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }}
        >
          {DAY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
