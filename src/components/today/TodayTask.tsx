'use client'

import { useState } from 'react'
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

export function TodayTask({ task }: TodayTaskProps) {
  const [completing, setCompleting] = useState(false)
  const [deferring, setDeferring] = useState(false)

  const channelDisplay = task.channels
    ? task.channels.label
      ? `${task.channels.type} · ${task.channels.label}`
      : task.channels.type
    : ''

  async function handleComplete() {
    setCompleting(true)
    await completeTask(task.id)
    // revalidatePath in server action will refresh the page
  }

  async function handleDefer() {
    setDeferring(true)
    await deferTask(task.id)
  }

  return (
    <div
      className="rounded-2xl p-6 border"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' }}
    >
      {/* Business + Channel context */}
      <div className="flex items-center gap-2 mb-4">
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
            className="text-xs font-medium px-2 py-1 rounded-full capitalize"
            style={{ backgroundColor: '#F7F5F1', color: '#736C5E' }}
          >
            {channelDisplay}
          </span>
        )}
        {task.deferred_count > 0 && (
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
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
              {task.ai_prompt_angle}
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
          disabled={completing || deferring}
          className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-opacity cursor-pointer disabled:opacity-60"
          style={{ backgroundColor: '#B8601F', color: '#FFFFFF' }}
        >
          {completing ? 'Marking done...' : 'Done for today'}
        </button>
        <button
          onClick={handleDefer}
          disabled={completing || deferring}
          className="py-3 px-4 rounded-xl text-sm font-medium transition-opacity cursor-pointer disabled:opacity-60"
          style={{ backgroundColor: '#F7F5F1', color: '#736C5E', border: '1px solid #E8E4DC' }}
        >
          {deferring ? 'Moving...' : 'Tomorrow'}
        </button>
      </div>
    </div>
  )
}
