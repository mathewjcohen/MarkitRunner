'use client'

import { sendPasswordReset } from '@/actions/auth'
import { useState } from 'react'

export function SettingsPasswordReset() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReset() {
    setLoading(true)
    setError(null)
    const result = await sendPasswordReset()
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <span className="text-sm font-medium" style={{ color: '#10B981' }}>
        Reset link sent
      </span>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
      <button
        onClick={handleReset}
        disabled={loading}
        className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-60"
        style={{ backgroundColor: '#F7F5F1', color: '#736C5E', border: '1px solid #E8E4DC' }}
      >
        {loading ? 'Sending…' : 'Send reset link'}
      </button>
    </div>
  )
}
