import type { Task } from '@/types'
import { formatDateRange } from '@/lib/utils/date'
import { formatChannelType } from '@/lib/utils/format'

interface TaskWithRelations extends Task {
  businesses: { name: string } | null
  channels: { type: string; label: string | null } | null
}

interface WeekGroup {
  weekStart: string
  tasks: TaskWithRelations[]
}

interface HistoryListProps {
  weekGroups: WeekGroup[]
}

function channelLabel(task: TaskWithRelations): string {
  return task.channels?.label || (task.channels?.type ? formatChannelType(task.channels.type) : 'Task')
}

function StatusBadge({ task }: { task: TaskWithRelations }) {
  if (task.completed_at) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' }}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2 6 5 9 10 3" />
        </svg>
        Done
      </span>
    )
  }
  if (task.replaced_at) {
    return (
      <span
        className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
      >
        Replaced
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#DC2626' }}
    >
      Missed
    </span>
  )
}

export function HistoryList({ weekGroups }: HistoryListProps) {
  if (weekGroups.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No previous tasks yet. Generate your first weekly plan to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {weekGroups.map((group) => (
        <section key={group.weekStart}>
          <h2
            className="text-sm font-semibold mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {formatDateRange(group.weekStart)}
          </h2>
          <div
            className="rounded-xl border divide-y"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            {group.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium leading-snug"
                    style={{
                      color: 'var(--color-text)',
                      textDecoration: task.replaced_at ? 'line-through' : 'none',
                      opacity: task.replaced_at ? 0.5 : 1,
                    }}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {task.businesses?.name && (
                      <span
                        className="text-xs"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {task.businesses.name}
                      </span>
                    )}
                    <span style={{ color: 'var(--color-border)' }}>·</span>
                    <span
                      className="text-xs"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {channelLabel(task)}
                    </span>
                    <span style={{ color: 'var(--color-border)' }}>·</span>
                    <span
                      className="text-xs"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {task.scheduled_date}
                    </span>
                  </div>
                </div>
                <StatusBadge task={task} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
