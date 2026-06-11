'use client'

import { useState } from 'react'
import { updateChannelNotes } from '@/actions/channels'

interface ChannelRow {
  id: string
  type: string
  label: string | null
  platform_notes: string | null
  businessName: string
}

export function SettingsChannels({ channels }: { channels: ChannelRow[] }) {
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(channels.map((c) => [c.id, c.platform_notes ?? '']))
  )
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  async function handleSave(channelId: string) {
    setSaving((prev) => ({ ...prev, [channelId]: true }))
    await updateChannelNotes(channelId, notes[channelId])
    setSaving((prev) => ({ ...prev, [channelId]: false }))
    setSaved((prev) => ({ ...prev, [channelId]: true }))
    setTimeout(() => setSaved((prev) => ({ ...prev, [channelId]: false })), 2000)
  }

  if (channels.length === 0) {
    return (
      <p className="text-sm px-5 py-4" style={{ color: 'var(--color-text-muted)' }}>
        No active channels. Add channels from the dashboard.
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {channels.map((channel, i) => {
        const label = channel.label ? `${channel.type} · ${channel.label}` : channel.type
        const isSaving = saving[channel.id]
        const isSaved = saved[channel.id]

        return (
          <div
            key={channel.id}
            className="px-5 py-4 flex flex-col gap-2"
            style={{
              borderBottom: i < channels.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium capitalize" style={{ color: 'var(--color-text)' }}>
                {label}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {channel.businessName}
              </span>
            </div>
            <div className="flex gap-2 items-end">
              <textarea
                value={notes[channel.id]}
                onChange={(e) => setNotes((prev) => ({ ...prev, [channel.id]: e.target.value }))}
                placeholder="e.g. Reverb.com — music gear sales only, no community features"
                rows={2}
                className="flex-1 border rounded-xl px-3 py-2 text-xs resize-none focus:outline-none"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
              <button
                onClick={() => handleSave(channel.id)}
                disabled={isSaving}
                className="px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-opacity disabled:opacity-60 flex-shrink-0"
                style={{
                  backgroundColor: isSaved ? '#22C55E' : 'var(--color-accent)',
                  color: '#FFFFFF',
                }}
              >
                {isSaving ? 'Saving…' : isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
