'use client'

import { useState, useEffect, useRef } from 'react'
import { completeTask, deferTask } from '@/actions/tasks'

interface TodayTaskProps {
  task: {
    id: string
    title: string
    description: string | null
    scheduled_date: string
    deferred_count: number
    ai_prompt_angle: string | null
    ai_prompt_opening: string | null
    businesses: { name: string; content_themes: string[] } | null
    channels: { type: string; label: string | null } | null
  }
}

function getChannelIcon(channelType: string): string {
  const iconMap: Record<string, string> = {
    email: '📧',
    instagram: '📱',
    linkedin: '🔗',
    tiktok: '🎵',
    youtube: '🎬',
    twitter: '𝕏',
    facebook: 'f',
  }
  return iconMap[channelType.toLowerCase()] || '📌'
}

export function TodayTask({ task }: TodayTaskProps) {
  const [completing, setCompleting] = useState(false)
  const [confirmingDefer, setConfirmingDefer] = useState(false)
  const deferTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const channelDisplay = task.channels
    ? task.channels.label
      ? `${task.channels.type} · ${task.channels.label}`
      : task.channels.type
    : ''

  const channelIcon = task.channels ? getChannelIcon(task.channels.type) : ''

  async function handleComplete() {
    setCompleting(true)
    // Allow animation to play for ~400ms before server action
    setTimeout(async () => {
      await completeTask(task.id)
      // revalidatePath in server action will refresh the page
    }, 400)
  }

  async function handleDeferClick() {
    if (confirmingDefer) {
      // Second click: confirm and defer
      if (deferTimeoutRef.current) clearTimeout(deferTimeoutRef.current)
      setConfirmingDefer(false)
      await deferTask(task.id)
    } else {
      // First click: show confirmation state
      setConfirmingDefer(true)
      deferTimeoutRef.current = setTimeout(() => {
        setConfirmingDefer(false)
      }, 3000)
    }
  }

  useEffect(() => {
    return () => {
      if (deferTimeoutRef.current) clearTimeout(deferTimeoutRef.current)
    }
  }, [])

  return (
    <div
      className="rounded-2xl p-6 border transition-all duration-600 relative"
      style={{
        backgroundColor: completing ? '#22C55E' : '#FFFFFF',
        borderColor: completing ? '#22C55E' : '#E8E4DC',
        opacity: completing ? 0.9 : 1,
      }}
    >
      {completing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-2xl">
          <div className="text-6xl text-white animate-pulse">✓</div>
        </div>
      )}

      <div style={{ opacity: completing ? 0 : 1, transition: 'opacity 200ms ease-out' }}>
        {/* Business + Channel context */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {task.businesses && (
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: '#F7F5F1', color: '#736C5E' }}
            >
              {task.businesses.name}
            </span>
          )}
          {channelDisplay && (
            <span
              className="text-xs font-medium px-2 py-1 rounded-full capitalize flex items-center gap-1"
              style={{ backgroundColor: '#F7F5F1', color: '#736C5E' }}
            >
              <span>{channelIcon}</span>
              {task.channels?.label ? `${task.channels.type} · ${task.channels.label}` : task.channels?.type}
            </span>
          )}
          {task.deferred_count > 0 && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
            >
              Deferred {task.deferred_count}×
            </span>
          )}
        </div>

        {/* Task title */}
        <h2
          className="text-xl font-semibold mb-2 leading-snug"
          style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
        >
          {task.title}
        </h2>

        {/* Description */}
        {task.description && (
          <p className="text-sm mb-4 leading-relaxed" style={{ color: '#736C5E' }}>
            {task.description}
          </p>
        )}

        {/* AI angle + opening */}
        {task.ai_prompt_opening && (
          <div
            className="rounded-xl p-4 mb-5 border-l-4"
            style={{ backgroundColor: '#FDF8F4', borderLeftColor: '#B8601F' }}
          >
            {task.ai_prompt_angle && (
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#B8601F' }}>
                ✦ {task.ai_prompt_angle}
              </p>
            )}
            <p className="text-sm italic leading-relaxed" style={{ color: '#18160F' }}>
              &ldquo;{task.ai_prompt_opening}&rdquo;
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleComplete}
            disabled={completing || confirmingDefer}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-60"
            style={{
              backgroundColor: '#B8601F',
              color: '#FFFFFF',
            }}
          >
            {completing ? 'Marking done...' : 'Done for today'}
          </button>
          <button
            onClick={handleDeferClick}
            disabled={completing}
            className="py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-60"
            style={{
              backgroundColor: confirmingDefer ? '#B8601F' : '#F7F5F1',
              color: confirmingDefer ? '#FFFFFF' : '#736C5E',
              border: confirmingDefer ? 'none' : '1px solid #E8E4DC',
            }}
          >
            {confirmingDefer ? 'Confirm defer →' : 'Tomorrow'}
          </button>
        </div>
      </div>
    </div>
  )
}
