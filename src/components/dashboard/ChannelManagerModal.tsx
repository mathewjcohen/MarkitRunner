'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createChannel, deleteChannel } from '@/actions/channels'
import { formatChannelType } from '@/lib/utils/format'
import type { Channel, ChannelType, Cadence } from '@/types'

const CHANNEL_TYPES: ChannelType[] = [
  'instagram', 'tiktok', 'youtube', 'linkedin', 'facebook',
  'reddit', 'discord', 'email_newsletter', 'forum', 'marketplace', 'website_blog',
]

const CADENCE_OPTIONS: { value: Cadence; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: '2x_week', label: '2× per week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

interface Props {
  businessId: string
  businessName: string
  initialChannels: Channel[]
}

export function ChannelManagerModal({ businessId, businessName, initialChannels }: Props) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [channels, setChannels] = useState<Channel[]>(initialChannels)
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(null)
  const removeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [addType, setAddType] = useState<ChannelType | null>(null)
  const [addLabel, setAddLabel] = useState('')
  const [addCadence, setAddCadence] = useState<Cadence>('weekly')
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  function openModal() {
    setChannels(initialChannels)
    setIsOpen(true)
    setAddType(null)
    setAddLabel('')
    setAddCadence('weekly')
    setAddError(null)
    if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current)
    setConfirmingRemoveId(null)
  }

  function closeModal() {
    setIsOpen(false)
    setConfirmingRemoveId(null)
    setAddType(null)
    setAddLabel('')
    setAddCadence('weekly')
    setAddError(null)
    if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current)
  }

  function handleRemoveClick(channelId: string) {
    if (confirmingRemoveId === channelId) {
      if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current)
      setConfirmingRemoveId(null)
      const prev = channels
      setChannels(c => c.filter(ch => ch.id !== channelId))
      deleteChannel(channelId).then(result => {
        if (result?.error) setChannels(prev)
        else router.refresh()
      })
    } else {
      if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current)
      setConfirmingRemoveId(channelId)
      removeTimeoutRef.current = setTimeout(() => setConfirmingRemoveId(null), 3000)
    }
  }

  async function handleAdd() {
    if (!addType) return
    setIsAdding(true)
    setAddError(null)
    const result = await createChannel(businessId, addType, addCadence, addLabel.trim() || undefined)
    setIsAdding(false)
    if (result?.error) {
      setAddError(result.error)
    } else if (result?.data) {
      setChannels(c => [...c, result.data as Channel])
      setAddType(null)
      setAddLabel('')
      setAddCadence('weekly')
      router.refresh()
    }
  }

  const count = channels.length

  return (
    <>
      <button
        onClick={openModal}
        className="cursor-pointer"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          color: 'var(--color-text-muted)',
          fontSize: 'inherit',
          textDecoration: 'underline',
          textDecorationColor: 'var(--color-border)',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: '3px',
          cursor: 'pointer',
        }}
      >
        {count} channel{count !== 1 ? 's' : ''}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-xl"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                  Manage channels
                </h3>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{businessName}</p>
              </div>
              <button
                onClick={closeModal}
                className="cursor-pointer"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {channels.length === 0 ? (
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-subtle)' }}>No channels yet.</p>
            ) : (
              <ul className="mb-5 space-y-2">
                {channels.map(ch => {
                  const isConfirming = confirmingRemoveId === ch.id
                  return (
                    <li
                      key={ch.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ backgroundColor: 'var(--color-surface-raised)' }}
                    >
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          {formatChannelType(ch.type)}{ch.label ? ` — ${ch.label}` : ''}
                        </span>
                        <span className="ml-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {CADENCE_OPTIONS.find(c => c.value === ch.cadence)?.label ?? ch.cadence}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveClick(ch.id)}
                        className="cursor-pointer text-xs ml-3 flex-shrink-0"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isConfirming ? 'var(--color-accent)' : 'var(--color-text-subtle)',
                          cursor: 'pointer',
                          padding: '2px 6px',
                        }}
                      >
                        {isConfirming ? 'Confirm' : 'Remove'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            <div style={{ borderTop: '1px solid var(--color-border)', marginBottom: '1.25rem' }} />

            <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>Add a channel</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {CHANNEL_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setAddType(t === addType ? null : t)}
                  className="cursor-pointer text-xs px-2.5 py-1 rounded-full border"
                  style={{
                    backgroundColor: addType === t ? 'var(--color-accent)' : 'transparent',
                    borderColor: addType === t ? 'var(--color-accent)' : 'var(--color-border)',
                    color: addType === t ? '#fff' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {formatChannelType(t)}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Label (optional, e.g. Reverb)"
                value={addLabel}
                onChange={e => setAddLabel(e.target.value)}
                className="flex-1 text-sm rounded-lg px-3 py-2 border"
                style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  outline: 'none',
                }}
              />
              <select
                value={addCadence}
                onChange={e => setAddCadence(e.target.value as Cadence)}
                className="cursor-pointer text-sm rounded-lg px-3 py-2 border"
                style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {CADENCE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {addError && (
              <p className="text-xs mb-2" style={{ color: 'var(--color-accent)' }}>{addError}</p>
            )}

            <button
              onClick={handleAdd}
              disabled={!addType || isAdding}
              className="cursor-pointer w-full text-sm py-2 rounded-lg font-medium"
              style={{
                backgroundColor: addType ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                color: addType ? '#fff' : 'var(--color-text-subtle)',
                border: 'none',
                cursor: addType ? 'pointer' : 'not-allowed',
                opacity: isAdding ? 0.7 : 1,
              }}
            >
              {isAdding ? 'Adding…' : 'Add channel'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
