import type { ReactNode } from 'react'

interface DashboardStatsProps {
  totalToday: number
  completedToday: number
  totalWeek: number
  completedWeek: number
  activeBusinesses: number
}

function StatCard({ color, value, label }: { color: string; value: string; label: string }): ReactNode {
  return (
    <div
      className="flex-1 rounded-xl border px-4 py-3 flex items-center gap-3 min-w-0"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="min-w-0">
        <p
          className="text-xl font-semibold leading-none mb-0.5"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
        >
          {value}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </p>
      </div>
    </div>
  )
}

export function DashboardStats({
  totalToday,
  completedToday,
  totalWeek,
  completedWeek,
  activeBusinesses,
}: DashboardStatsProps): ReactNode {
  const weekPct = totalWeek > 0 ? `${Math.round((completedWeek / totalWeek) * 100)}%` : '—'
  const todayStr = totalToday > 0 ? `${completedToday} / ${totalToday}` : '0'

  return (
    <div className="flex gap-3 mb-6">
      <StatCard color="#0EA5E9" value={todayStr} label="Tasks today" />
      <StatCard color="var(--color-accent)" value={weekPct} label="Weekly consistency" />
      <StatCard color="#10B981" value={String(activeBusinesses)} label="Active ventures" />
    </div>
  )
}
