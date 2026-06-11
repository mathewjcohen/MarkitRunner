'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { scheduleAccountDeletion, cancelAccountDeletion } from '@/actions/auth'

interface SettingsDeleteAccountProps {
  deletionScheduledAt: string | null
}

export function SettingsDeleteAccount({ deletionScheduledAt }: SettingsDeleteAccountProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scheduledDate = deletionScheduledAt ? new Date(deletionScheduledAt) : null
  const isScheduled = scheduledDate !== null && scheduledDate > new Date()

  async function handleSchedule() {
    if (confirmText !== 'DELETE') return
    setLoading(true)
    setError(null)
    const result = await scheduleAccountDeletion()
    if ('error' in result && result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  async function handleCancel() {
    setLoading(true)
    const result = await cancelAccountDeletion()
    if ('error' in result && result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  if (isScheduled && scheduledDate) {
    return (
      <div>
        <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Account scheduled for deletion on{' '}
          <strong style={{ color: '#DC2626' }}>
            {scheduledDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </strong>
          .
        </p>
        {error && (
          <p className="text-xs mb-2" style={{ color: '#DC2626' }}>
            {error}
          </p>
        )}
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-sm underline cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-50"
          style={{ color: 'var(--color-accent)' }}
        >
          {loading ? 'Cancelling…' : 'Cancel deletion'}
        </button>
      </div>
    )
  }

  if (confirming) {
    return (
      <div
        className="rounded-xl p-4 border"
        style={{
          backgroundColor: 'rgba(220,38,38,0.04)',
          borderColor: 'rgba(220,38,38,0.2)',
        }}
      >
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          This will schedule your account for deletion. Your data will be held for 30 days, then permanently deleted.
        </p>
        <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Type DELETE to confirm
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="w-full rounded-lg px-3 py-2 text-sm border mb-3 outline-none"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        {error && (
          <p className="text-xs mb-2" style={{ color: '#DC2626' }}>
            {error}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSchedule}
            disabled={confirmText !== 'DELETE' || loading}
            className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-opacity disabled:opacity-40 hover:opacity-80"
            style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
          >
            {loading ? 'Scheduling…' : 'Schedule deletion'}
          </button>
          <button
            onClick={() => {
              setConfirming(false)
              setConfirmText('')
            }}
            className="text-sm cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm px-4 py-2 rounded-xl border cursor-pointer transition-opacity hover:opacity-80"
      style={{
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-muted)',
      }}
    >
      Delete account
    </button>
  )
}
