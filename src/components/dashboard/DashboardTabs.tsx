'use client'

import { useState } from 'react'
import type { Task, Business, Channel } from '@/types'
import { isToday } from '@/lib/utils/date'

interface TaskWithRelations extends Task {
  businesses: { name: string } | null
  channels: { type: string; label: string | null } | null
}

interface BusinessWithData {
  business: Business
  channels: Channel[]
  todayTasks: TaskWithRelations[]
  weekTasks: TaskWithRelations[]
  completedThisWeek: number
  totalThisWeek: number
  daysSinceLastTask: number | null
  nextTaskDate: string | null
  weekStartDate: string
}

interface DashboardTabsProps {
  businessesWithData: BusinessWithData[]
  weekDates: Array<{ date: string; dayName: string; dayNum: number }>
  defaultTab?: 'today' | 'weekly'
}

type Tab = 'today' | 'weekly'

export function DashboardTabs({ businessesWithData, weekDates, defaultTab = 'today' }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)

  const allWeekTasks = businessesWithData.flatMap((b) => b.weekTasks)
  const tasksByDate = allWeekTasks.reduce(
    (acc, task) => {
      if (!acc[task.scheduled_date]) acc[task.scheduled_date] = []
      acc[task.scheduled_date].push(task)
      return acc
    },
    {} as Record<string, TaskWithRelations[]>
  )

  return (
    <div>
      <div
        className="flex items-center gap-1 p-1 rounded-xl mb-6 w-fit"
        style={{ backgroundColor: 'var(--color-surface-raised)' }}
      >
        {(['today', 'weekly'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all capitalize"
            style={{
              backgroundColor: activeTab === tab ? 'var(--color-accent)' : 'transparent',
              color: activeTab === tab ? '#FFFFFF' : 'var(--color-text-muted)',
            }}
          >
            {tab === 'today' ? 'Today' : 'This Week'}
          </button>
        ))}
      </div>

      {activeTab === 'today' && (
        <div className="flex flex-col gap-6">
          {businessesWithData.map(({ business, todayTasks }) => (
            <div key={business.id}>
              <h3
                className="text-sm font-semibold mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)' }}
              >
                {business.name}
              </h3>
              {todayTasks.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>
                  No tasks scheduled for today.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border px-4 py-3"
                      style={{
                        backgroundColor: task.completed_at ? 'var(--color-surface-raised)' : 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <div
                        className="text-xs font-medium uppercase tracking-wider mb-1"
                        style={{
                          color: 'var(--color-text-subtle)',
                          opacity: task.completed_at ? 0.6 : 1,
                        }}
                      >
                        {task.channels?.label || task.channels?.type || 'Task'}
                      </div>
                      <div
                        className="text-sm"
                        style={{
                          color: 'var(--color-text)',
                          textDecoration: task.completed_at ? 'line-through' : 'none',
                          opacity: task.completed_at ? 0.6 : 1,
                        }}
                      >
                        {task.title}
                      </div>
                      {task.completed_at && (
                        <div className="text-xs mt-1" style={{ color: '#10B981' }}>
                          ✓ Done
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {businessesWithData.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No active businesses.{' '}
              <a href="/onboarding/step-1" className="underline" style={{ color: 'var(--color-accent)' }}>
                Add one
              </a>
            </p>
          )}
        </div>
      )}

      {activeTab === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDates.map((dayInfo) => {
            const todayDay = isToday(dayInfo.date)
            return (
              <div
                key={dayInfo.date}
                className="rounded-xl border overflow-hidden"
                style={{
                  borderColor: todayDay ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor: todayDay ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                  borderLeftWidth: todayDay ? '3px' : '1px',
                }}
              >
                <div
                  className="px-3 py-2.5 border-b text-sm font-semibold"
                  style={{
                    borderBottomColor: 'var(--color-border)',
                    color: todayDay ? 'var(--color-accent)' : 'var(--color-text)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  <div>{dayInfo.dayName}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                    {dayInfo.dayNum}
                  </div>
                </div>
                <div className="px-3 py-2.5 flex flex-col gap-2 min-h-32">
                  {tasksByDate[dayInfo.date]?.length > 0 ? (
                    tasksByDate[dayInfo.date].map((task) => (
                      <div
                        key={task.id}
                        className="text-xs rounded-lg p-2 border"
                        style={{
                          borderColor: 'var(--color-border)',
                          backgroundColor: task.completed_at ? 'rgba(16,185,129,0.06)' : 'var(--color-surface)',
                        }}
                      >
                        <div
                          className="uppercase font-medium mb-0.5"
                          style={{ color: 'var(--color-text-subtle)', fontSize: '0.65rem' }}
                        >
                          {task.channels?.label || task.channels?.type || '—'}
                        </div>
                        <div
                          style={{
                            color: 'var(--color-text)',
                            fontSize: '0.8rem',
                            textDecoration: task.completed_at ? 'line-through' : 'none',
                            opacity: task.completed_at ? 0.6 : 1,
                          }}
                        >
                          {task.title}
                        </div>
                        {task.completed_at && (
                          <div style={{ color: '#10B981', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                            ✓ Done
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div
                      className="flex items-center justify-center h-full text-xs"
                      style={{ color: 'var(--color-border)', minHeight: '48px' }}
                    >
                      —
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
