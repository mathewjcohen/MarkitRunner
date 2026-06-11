'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Task, Business, Channel } from '@/types'
import { isToday } from '@/lib/utils/date'
import { formatChannelType } from '@/lib/utils/format'
import { completeTask, uncompleteTask } from '@/actions/tasks'

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
  activeTab: 'today' | 'weekly'
  onTabChange: (tab: 'today' | 'weekly') => void
}

type Tab = 'today' | 'weekly'

export function DashboardTabs({ businessesWithData, weekDates, activeTab, onTabChange }: DashboardTabsProps) {
  const router = useRouter()
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
  const [localCompletions, setLocalCompletions] = useState<Record<string, boolean>>({})

  const allWeekTasks = businessesWithData.flatMap((b) => b.weekTasks)
  const tasksByDate = allWeekTasks.reduce(
    (acc, task) => {
      if (!acc[task.scheduled_date]) acc[task.scheduled_date] = []
      acc[task.scheduled_date].push(task)
      return acc
    },
    {} as Record<string, TaskWithRelations[]>
  )

  function isCompleted(task: TaskWithRelations): boolean {
    if (task.id in localCompletions) return localCompletions[task.id]
    return !!task.completed_at
  }

  async function toggleTask(task: TaskWithRelations) {
    if (pendingTaskId) return
    const wasCompleted = isCompleted(task)

    setPendingTaskId(task.id)
    setLocalCompletions((prev) => ({ ...prev, [task.id]: !wasCompleted }))

    const result = wasCompleted ? await uncompleteTask(task.id) : await completeTask(task.id)

    if (result?.error) {
      setLocalCompletions((prev) => {
        const next = { ...prev }
        delete next[task.id]
        return next
      })
    }

    setPendingTaskId(null)
    router.refresh()
  }

  function toggleExpanded(taskId: string) {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId))
  }

  function channelLabel(task: TaskWithRelations): string {
    return task.channels?.label || (task.channels?.type ? formatChannelType(task.channels.type) : 'Task')
  }

  return (
    <div>
      <div
        className="flex items-center gap-1 p-1 rounded-xl mb-6 w-fit"
        style={{ backgroundColor: 'var(--color-surface-raised)' }}
      >
        {(['today', 'weekly'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
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
                  {todayTasks.map((task) => {
                    const done = isCompleted(task)
                    const isPending = pendingTaskId === task.id
                    const isExpanded = expandedTaskId === task.id

                    return (
                      <div
                        key={task.id}
                        className="rounded-xl border overflow-hidden"
                        style={{
                          backgroundColor: done ? 'var(--color-surface-raised)' : 'var(--color-surface)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <div className="flex items-start gap-3 px-4 py-3">
                          {/* Completion toggle */}
                          <button
                            onClick={() => toggleTask(task)}
                            disabled={isPending}
                            aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                            className="flex-shrink-0 mt-0.5 cursor-pointer disabled:opacity-50 transition-opacity hover:opacity-70"
                          >
                            {isPending ? (
                              <svg
                                className="animate-spin"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                                style={{ color: 'var(--color-text-muted)' }}
                              >
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                              </svg>
                            ) : done ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" fill="#10B981" />
                                <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-border)' }} />
                              </svg>
                            )}
                          </button>

                          {/* Task content — click to expand */}
                          <button
                            onClick={() => task.description ? toggleExpanded(task.id) : undefined}
                            className="flex-1 text-left"
                            style={{ cursor: task.description ? 'pointer' : 'default' }}
                          >
                            <div
                              className="text-xs font-medium uppercase tracking-wider mb-1"
                              style={{
                                color: 'var(--color-text-subtle)',
                                opacity: done ? 0.6 : 1,
                              }}
                            >
                              {channelLabel(task)}
                            </div>
                            <div
                              className="text-sm"
                              style={{
                                color: 'var(--color-text)',
                                textDecoration: done ? 'line-through' : 'none',
                                opacity: done ? 0.6 : 1,
                              }}
                            >
                              {task.title}
                            </div>
                          </button>

                          {/* Expand chevron if description exists */}
                          {task.description && (
                            <button
                              onClick={() => toggleExpanded(task.id)}
                              aria-label={isExpanded ? 'Collapse details' : 'Show details'}
                              className="flex-shrink-0 cursor-pointer transition-transform"
                              style={{
                                color: 'var(--color-text-muted)',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Expanded description */}
                        {isExpanded && task.description && (
                          <div
                            className="px-4 pb-3 pt-0"
                            style={{ borderTop: '1px solid var(--color-border)' }}
                          >
                            <p
                              className="text-sm leading-relaxed"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              {task.description}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
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
                    tasksByDate[dayInfo.date].map((task) => {
                      const done = isCompleted(task)
                      const isPending = pendingTaskId === task.id
                      const isExpanded = expandedTaskId === task.id

                      return (
                        <div
                          key={task.id}
                          className="text-xs rounded-lg border overflow-hidden"
                          style={{
                            borderColor: 'var(--color-border)',
                            backgroundColor: done ? 'rgba(16,185,129,0.06)' : 'var(--color-surface)',
                          }}
                        >
                          <div className="flex items-start gap-1.5 p-2">
                            {/* Completion toggle */}
                            <button
                              onClick={() => toggleTask(task)}
                              disabled={isPending}
                              aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                              className="flex-shrink-0 mt-0.5 cursor-pointer disabled:opacity-50"
                            >
                              {isPending ? (
                                <svg
                                  className="animate-spin"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  aria-hidden="true"
                                  style={{ color: 'var(--color-text-muted)' }}
                                >
                                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                              ) : done ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <circle cx="12" cy="12" r="9" fill="#10B981" />
                                  <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-border)' }} />
                                </svg>
                              )}
                            </button>

                            {/* Task content */}
                            <button
                              onClick={() => task.description ? toggleExpanded(task.id) : undefined}
                              className="flex-1 text-left min-w-0"
                              style={{ cursor: task.description ? 'pointer' : 'default' }}
                            >
                              <div
                                className="uppercase font-medium mb-0.5 truncate"
                                style={{ color: 'var(--color-text-subtle)', fontSize: '0.65rem', opacity: done ? 0.6 : 1 }}
                              >
                                {channelLabel(task)}
                              </div>
                              <div
                                style={{
                                  color: 'var(--color-text)',
                                  fontSize: '0.8rem',
                                  textDecoration: done ? 'line-through' : 'none',
                                  opacity: done ? 0.6 : 1,
                                }}
                              >
                                {task.title}
                              </div>
                            </button>
                          </div>

                          {/* Expanded description */}
                          {isExpanded && task.description && (
                            <div
                              className="px-2 pb-2"
                              style={{ borderTop: '1px solid var(--color-border)' }}
                            >
                              <p
                                className="text-xs leading-relaxed pt-1.5"
                                style={{ color: 'var(--color-text-muted)' }}
                              >
                                {task.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })
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
