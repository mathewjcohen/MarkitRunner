'use client'

import { createPortalSession } from '@/actions/stripe'
import { useState } from 'react'

export function SettingsBillingButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePortal() {
    setLoading(true)
    setError(null)
    const result = await createPortalSession()
    // createPortalSession redirects on success; only reaches here on error
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
      <button
        onClick={handlePortal}
        disabled={loading}
        className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-60"
        style={{ backgroundColor: '#F7F5F1', color: '#736C5E', border: '1px solid #E8E4DC' }}
      >
        {loading ? 'Loading…' : 'Manage billing'}
      </button>
    </div>
  )
}
