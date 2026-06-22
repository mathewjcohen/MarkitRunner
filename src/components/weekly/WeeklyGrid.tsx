'use client'

import { isToday } from '@/lib/utils/date'
import { WeeklyTaskCard } from './WeeklyTaskCard'

interface GridTask {
  id: string
  title: string
  completed_at: string | null
  replaced_at: string | null
  channels: { type: string; label: string | null } | null
}

interface WeeklyGridProps {
  weekDates: Array<{ date: string; dayName: string; dayNum: number }>
  tasksByDate: Record<string, GridTask[]>
}

export function WeeklyGrid({ weekDates, tasksByDate }: WeeklyGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {weekDates.map((dayInfo) => {
        const todayDay = isToday(dayInfo.date)
        return (
          <div
            key={dayInfo.date}
            className="rounded-xl border"
            style={{
              borderColor: todayDay ? 'var(--color-accent)' : 'var(--color-border)',
              backgroundColor: todayDay ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
              borderLeftWidth: todayDay ? '4px' : '1px',
            }}
          >
            <div
              className="px-4 py-3 border-b font-semibold text-sm"
              style={{
                borderBottomColor: 'var(--color-border)',
                color: todayDay ? 'var(--color-accent)' : 'var(--color-text)',
                fontFamily: 'var(--font-display)',
              }}
            >
              <div>{dayInfo.dayName}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 'normal' }}>
                {dayInfo.dayNum}
              </div>
            </div>
            <div className="px-4 py-3 flex flex-col gap-3 min-h-48">
              {tasksByDate[dayInfo.date]?.length > 0 ? (
                tasksByDate[dayInfo.date].map((task) => (
                  <WeeklyTaskCard key={task.id} task={task} />
                ))
              ) : (
                <div
                  className="text-xs text-center py-8 flex items-center justify-center h-full"
                  style={{ color: 'var(--color-border)' }}
                >
                  —
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
