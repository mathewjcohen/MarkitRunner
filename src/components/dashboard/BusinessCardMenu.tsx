'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { pauseBusiness, resumeBusiness, archiveBusiness } from '@/actions/businesses'

interface BusinessCardMenuProps {
  businessId: string
  businessName: string
  isActive: boolean
  archivedAt: string | null
}

export function BusinessCardMenu({ businessId, businessName, isActive, archivedAt }: BusinessCardMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [archiveConfirm, setArchiveConfirm] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setArchiveConfirm(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handlePauseResume() {
    setLoading('pauseresume')
    if (isActive) {
      await pauseBusiness(businessId)
    } else {
      await resumeBusiness(businessId)
    }
    setOpen(false)
    router.refresh()
    setLoading(null)
  }

  async function handleArchive() {
    setLoading('archive')
    await archiveBusiness(businessId)
    setOpen(false)
    router.refresh()
    setLoading(null)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:opacity-80"
        style={{
          color: 'var(--color-text-subtle)',
          backgroundColor: open ? 'var(--color-surface-raised)' : 'transparent',
        }}
        aria-label="Business options"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-9 rounded-xl border shadow-lg z-20 overflow-hidden"
          style={{
            width: '200px',
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          {archiveConfirm ? (
            <div className="p-4">
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
                Archive <strong style={{ color: 'var(--color-text)' }}>{businessName}</strong>? It can be restored
                within 30 days.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleArchive}
                  disabled={loading === 'archive'}
                  className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-opacity disabled:opacity-60 hover:opacity-80"
                  style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                >
                  {loading === 'archive' ? 'Archiving…' : 'Archive'}
                </button>
                <button
                  onClick={() => setArchiveConfirm(false)}
                  className="flex-1 py-2 rounded-lg text-sm cursor-pointer transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={handlePauseResume}
                disabled={loading === 'pauseresume'}
                className="w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors disabled:opacity-50"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {loading === 'pauseresume' ? 'Updating…' : isActive ? 'Pause' : 'Resume'}
              </button>
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
              <button
                onClick={() => setArchiveConfirm(true)}
                className="w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors"
                style={{ color: '#DC2626' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Archive
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
