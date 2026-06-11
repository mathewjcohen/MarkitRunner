'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Business } from '@/types'
import { restoreBusiness, deleteBusiness } from '@/actions/businesses'

interface ArchivedSectionProps {
  businesses: Business[]
}

export function ArchivedSection({ businesses }: ArchivedSectionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  if (businesses.length === 0) return null

  async function handleRestore(id: string) {
    setLoading(`restore-${id}`)
    await restoreBusiness(id)
    router.refresh()
    setLoading(null)
  }

  async function handleDelete(id: string) {
    setLoading(`delete-${id}`)
    await deleteBusiness(id)
    router.refresh()
    setLoading(null)
    setDeleteConfirm(null)
  }

  return (
    <div className="mt-10">
      <h2
        className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'var(--color-text-subtle)' }}
      >
        Archived Ventures
      </h2>
      <div className="flex flex-col gap-2">
        {businesses.map((b) => {
          const purgeDate = b.archived_at
            ? new Date(new Date(b.archived_at).getTime() + 30 * 86400000)
            : null
          const daysLeft = purgeDate
            ? Math.ceil((purgeDate.getTime() - Date.now()) / 86400000)
            : null

          return (
            <div
              key={b.id}
              className="rounded-xl border px-4 py-3 flex items-center justify-between gap-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                opacity: 0.7,
              }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-muted)' }}>
                  {b.name}
                </p>
                {daysLeft !== null && daysLeft > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>
                    Permanently deleted in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {deleteConfirm === b.id ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(b.id)}
                    disabled={loading === `delete-${b.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-opacity disabled:opacity-60 hover:opacity-80"
                    style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                  >
                    {loading === `delete-${b.id}` ? 'Deleting…' : 'Delete permanently'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRestore(b.id)}
                    disabled={loading === `restore-${b.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-opacity disabled:opacity-60 hover:opacity-70"
                    style={{ color: 'var(--color-accent)', border: '1px solid var(--color-accent)' }}
                  >
                    {loading === `restore-${b.id}` ? 'Restoring…' : 'Restore'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(b.id)}
                    className="px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-opacity hover:opacity-70"
                    style={{ color: '#DC2626' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
