import type { Business, Channel } from '@/types'

interface BusinessCardProps {
  business: Business
  channels: Channel[]
  completedThisWeek: number
  totalThisWeek: number
  daysSinceLastTask: number | null
  nextTaskDate: string | null
}

export function BusinessCard({
  business,
  channels,
  completedThisWeek,
  totalThisWeek,
  daysSinceLastTask,
  nextTaskDate,
}: BusinessCardProps) {
  const consistencyPct = totalThisWeek > 0
    ? Math.round((completedThisWeek / totalThisWeek) * 100)
    : null

  return (
    <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}>
            {business.name}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#736C5E' }}>{business.description}</p>
        </div>
        {consistencyPct !== null && (
          <span className="text-2xl font-bold" style={{ color: '#B8601F', fontFamily: 'var(--font-display)' }}>
            {consistencyPct}%
          </span>
        )}
      </div>
      <div className="flex gap-4 text-sm" style={{ color: '#736C5E' }}>
        <span>{channels.length} channel{channels.length !== 1 ? 's' : ''}</span>
        {daysSinceLastTask !== null && (
          <span>{daysSinceLastTask === 0 ? 'Active today' : `${daysSinceLastTask}d since last task`}</span>
        )}
        {nextTaskDate && <span>Next: {nextTaskDate}</span>}
      </div>
    </div>
  )
}
