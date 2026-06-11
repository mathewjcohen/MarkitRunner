'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelAccountDeletion } from '@/actions/auth'

interface DeletionBannerProps {
  deletionScheduledAt: string
}

export function DeletionBanner({ deletionScheduledAt }: DeletionBannerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const deletionDate = new Date(deletionScheduledAt)
  const formattedDate = deletionDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  async function handleCancel() {
    setLoading(true)
    await cancelAccountDeletion()
    router.refresh()
  }

  return (
    <div
      className="sticky top-14 z-[9] border-b"
      style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-medium flex-shrink-0" style={{ color: '#DC2626' }}>
            Account deletion scheduled
          </span>
          <span className="text-sm truncate" style={{ color: '#991B1B' }}>
            Your account and all data will be permanently deleted on {formattedDate}.
          </span>
        </div>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-sm font-medium underline flex-shrink-0 cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-50"
          style={{ color: '#DC2626' }}
        >
          {loading ? 'Cancelling…' : 'Cancel deletion'}
        </button>
      </div>
    </div>
  )
}
