'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createChannel, deleteChannel } from '@/actions/channels'
import { updateChannelNotes } from '@/actions/channels'
import { formatChannelType } from '@/lib/utils/format'
import type { ChannelType, Cadence } from '@/types'

interface ChannelRow {
  id: string
  type: string
  label: string | null
  platform_notes: string | null
  cadence: string
  businessId: string
}

interface Venture {
  id: string
  name: string
  channels: ChannelRow[]
}

interface Props {
  ventures: Venture[]
}

const CHANNEL_TYPES: ChannelType[] = [
  'instagram',
  'tiktok',
  'youtube',
  'linkedin',
  'facebook',
  'reddit',
  'discord',
  'email_newsletter',
  'forum',
  'marketplace',
  'website_blog',
]

const CADENCE_OPTIONS: { value: Cadence; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: '2x_week', label: '2x per week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

interface VentureAddFormState {
  selectedType: ChannelType | null
  label: string
  cadence: Cadence
  isAdding: boolean
  addError: string | null
}

export function SettingsChannels({ ventures }: Props) {
  const router = useRouter()

  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(
      ventures.flatMap((v) =>
        v.channels.map((c) => [c.id, c.platform_notes ?? ''])
      )
    )
  )
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [confirming, setConfirming] = useState<Record<string, boolean>>({})
  const confirmTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const [ventureAddForms, setVentureAddForms] = useState<Record<string, VentureAddFormState>>(
    Object.fromEntries(
      ventures.map((v) => [
        v.id,
        {
          selectedType: null,
          label: '',
          cadence: 'weekly',
          isAdding: false,
          addError: null,
        } as VentureAddFormState,
      ])
    )
  )

  async function handleSave(channelId: string) {
    setSaving((prev) => ({ ...prev, [channelId]: true }))
    await updateChannelNotes(channelId, notes[channelId])
    setSaving((prev) => ({ ...prev, [channelId]: false }))
    setSaved((prev) => ({ ...prev, [channelId]: true }))
    setTimeout(() => setSaved((prev) => ({ ...prev, [channelId]: false })), 2000)
  }

  function handleRemoveClick(channelId: string) {
    if (confirming[channelId]) {
      if (confirmTimeoutsRef.current[channelId]) clearTimeout(confirmTimeoutsRef.current[channelId])
      setConfirming((prev) => {
        const next = { ...prev }
        delete next[channelId]
        return next
      })
      deleteChannel(channelId).then(() => {
        router.refresh()
      })
    } else {
      if (confirmTimeoutsRef.current[channelId]) clearTimeout(confirmTimeoutsRef.current[channelId])
      setConfirming((prev) => ({ ...prev, [channelId]: true }))
      confirmTimeoutsRef.current[channelId] = setTimeout(() => {
        setConfirming((prev) => {
          const next = { ...prev }
          delete next[channelId]
          return next
        })
      }, 3000)
    }
  }

  async function handleAdd(ventureId: string) {
    const formState = ventureAddForms[ventureId]
    if (!formState.selectedType) return

    setVentureAddForms((prev) => ({
      ...prev,
      [ventureId]: { ...prev[ventureId], isAdding: true, addError: null },
    }))

    const result = await createChannel(
      ventureId,
      formState.selectedType,
      formState.cadence,
      formState.label.trim() || undefined
    )

    if (result?.error) {
      setVentureAddForms((prev) => ({
        ...prev,
        [ventureId]: { ...prev[ventureId], isAdding: false, addError: result.error },
      }))
    } else {
      setVentureAddForms((prev) => ({
        ...prev,
        [ventureId]: {
          selectedType: null,
          label: '',
          cadence: 'weekly',
          isAdding: false,
          addError: null,
        },
      }))
      router.refresh()
    }
  }

  if (ventures.length === 0) {
    return (
      <p className="text-sm px-5 py-4" style={{ color: 'var(--color-text-muted)' }}>
        No active ventures yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {ventures.map((venture, ventureIndex) => {
        const formState = ventureAddForms[venture.id]
        const hasChannels = venture.channels.length > 0

        return (
          <div key={venture.id}>
            {ventureIndex > 0 && (
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
            )}

            <div className="px-5 py-4">
              <h3
                className="text-xs font-semibold mb-4 uppercase tracking-widest"
                style={{ color: 'var(--color-text-subtle)' }}
              >
                {venture.name}
              </h3>

              {hasChannels ? (
                <div className="mb-4 space-y-3">
                  {venture.channels.map((channel) => {
                    const label = channel.label ? `${formatChannelType(channel.type)} - ${channel.label}` : formatChannelType(channel.type)
                    const isSaving = saving[channel.id]
                    const isSaved = saved[channel.id]
                    const isConfirming = confirming[channel.id]

                    return (
                      <div key={channel.id} className="flex flex-col gap-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                            {label}
                          </span>
                          <button
                            onClick={() => handleRemoveClick(channel.id)}
                            className="text-xs cursor-pointer"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: isConfirming ? 'var(--color-accent)' : 'var(--color-text-subtle)',
                              cursor: 'pointer',
                              padding: 0,
                              textDecoration: 'none',
                            }}
                          >
                            {isConfirming ? 'Confirm remove' : 'Remove'}
                          </button>
                        </div>
                        <div className="flex gap-2 items-end">
                          <textarea
                            value={notes[channel.id]}
                            onChange={(e) =>
                              setNotes((prev) => ({
                                ...prev,
                                [channel.id]: e.target.value,
                              }))
                            }
                            placeholder="Platform notes (optional)"
                            rows={2}
                            className="flex-1 border rounded-xl px-3 py-2 text-xs resize-none focus:outline-none"
                            style={{
                              borderColor: 'var(--color-border)',
                              backgroundColor: 'var(--color-surface-raised)',
                              color: 'var(--color-text)',
                            }}
                          />
                          <button
                            onClick={() => handleSave(channel.id)}
                            disabled={isSaving}
                            className="px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-opacity disabled:opacity-60 flex-shrink-0"
                            style={{
                              backgroundColor: isSaved ? '#22C55E' : 'var(--color-accent)',
                              color: '#FFFFFF',
                              border: 'none',
                            }}
                          >
                            {isSaving ? 'Saving' : isSaved ? 'Saved' : 'Save'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-subtle)' }}>
                  No channels yet — add one below.
                </p>
              )}

              <div
                className="pt-4"
                style={{
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <p className="text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: 'var(--color-text-subtle)' }}>
                  Add channel
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {CHANNEL_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() =>
                        setVentureAddForms((prev) => ({
                          ...prev,
                          [venture.id]: {
                            ...prev[venture.id],
                            selectedType: formState.selectedType === t ? null : t,
                          },
                        }))
                      }
                      className="text-xs px-2.5 py-1 rounded-full border cursor-pointer"
                      style={{
                        backgroundColor:
                          formState.selectedType === t ? 'var(--color-accent)' : 'transparent',
                        borderColor:
                          formState.selectedType === t ? 'var(--color-accent)' : 'var(--color-border)',
                        color:
                          formState.selectedType === t ? '#fff' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {formatChannelType(t)}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Label (optional)"
                    value={formState.label}
                    onChange={(e) =>
                      setVentureAddForms((prev) => ({
                        ...prev,
                        [venture.id]: {
                          ...prev[venture.id],
                          label: e.target.value,
                        },
                      }))
                    }
                    className="flex-1 text-sm rounded-lg px-3 py-2 border cursor-pointer"
                    style={{
                      backgroundColor: 'var(--color-surface-raised)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      outline: 'none',
                    }}
                  />
                  <select
                    value={formState.cadence}
                    onChange={(e) =>
                      setVentureAddForms((prev) => ({
                        ...prev,
                        [venture.id]: {
                          ...prev[venture.id],
                          cadence: e.target.value as Cadence,
                        },
                      }))
                    }
                    className="text-sm rounded-lg px-3 py-2 border cursor-pointer"
                    style={{
                      backgroundColor: 'var(--color-surface-raised)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {CADENCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formState.addError && (
                  <p className="text-xs mb-2" style={{ color: 'var(--color-accent)' }}>
                    {formState.addError}
                  </p>
                )}

                <button
                  onClick={() => handleAdd(venture.id)}
                  disabled={!formState.selectedType || formState.isAdding}
                  className="w-full text-sm py-2 rounded-lg font-medium cursor-pointer"
                  style={{
                    backgroundColor: formState.selectedType ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                    color: formState.selectedType ? '#fff' : 'var(--color-text-subtle)',
                    border: 'none',
                    cursor: formState.selectedType ? 'pointer' : 'not-allowed',
                    opacity: formState.isAdding ? 0.7 : 1,
                  }}
                >
                  {formState.isAdding ? 'Adding...' : 'Add channel'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
