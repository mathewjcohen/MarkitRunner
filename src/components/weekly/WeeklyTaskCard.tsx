'use client'

import { useState, useEffect, useRef } from 'react'
import { replaceTask } from '@/actions/tasks'

interface WeeklyTaskCardProps {
  task: {
    id: string
    title: string
    completed_at: string | null
    replaced_at: string | null
    channels: { type: string; label: string | null } | null
  }
}

export function WeeklyTaskCard({ task }: WeeklyTaskCardProps) {
  const [confirmingReplace, setConfirmingReplace] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const replaceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isReplaced = !!task.replaced_at

  async function handleReplaceClick() {
    if (confirmingReplace) {
      if (replaceTimeoutRef.current) clearTimeout(replaceTimeoutRef.current)
      setConfirmingReplace(false)
      setReplacing(true)
      await replaceTask(task.id)
    } else {
      setConfirmingReplace(true)
      replaceTimeoutRef.current = setTimeout(() => setConfirmingReplace(false), 3000)
    }
  }

  useEffect(() => {
    return () => { if (replaceTimeoutRef.current) clearTimeout(replaceTimeoutRef.current) }
  }, [])

  return (
    <div
      className="text-xs rounded-lg p-2 border flex flex-col gap-1"
      style={{
        borderColor: '#E8E4DC',
        backgroundColor: task.completed_at ? '#F0FDF4' : isReplaced ? '#F7F5F1' : '#FFFFFF',
        opacity: replacing ? 0.5 : 1,
      }}
    >
      <div
        style={{
          color: '#736C5E',
          fontSize: '0.7rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          opacity: isReplaced ? 0.5 : 1,
        }}
      >
        {task.channels?.label || task.channels?.type || 'Unknown'}
      </div>
      <div
        style={{
          color: '#18160F',
          fontSize: '0.85rem',
          opacity: task.completed_at || isReplaced ? 0.6 : 1,
          textDecoration: task.completed_at || isReplaced ? 'line-through' : 'none',
        }}
      >
        {task.title}
      </div>
      {task.completed_at && (
        <div style={{ color: '#22C55E', fontSize: '0.75rem' }}>Done</div>
      )}
      {isReplaced && !task.completed_at && (
        <div style={{ color: '#A89F94', fontSize: '0.75rem' }}>Replaced</div>
      )}
      {!task.completed_at && !isReplaced && !replacing && (
        <button
          onClick={handleReplaceClick}
          className="text-left cursor-pointer mt-0.5"
          style={{
            fontSize: '0.7rem',
            color: confirmingReplace ? '#B8601F' : '#8B8177',
            background: 'none',
            border: 'none',
            padding: 0,
          }}
        >
          {confirmingReplace ? 'Confirm replace' : 'Not doable'}
        </button>
      )}
      {replacing && (
        <div style={{ fontSize: '0.7rem', color: '#A89F94' }}>Replacing…</div>
      )}
    </div>
  )
}
