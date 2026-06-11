'use client'

import { signOut } from '@/actions/auth'
import { useState } from 'react'

export function SettingsSignOut() {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await signOut()
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-60"
      style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
