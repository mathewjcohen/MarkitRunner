import type { Business, Channel } from '@/types'
import { BusinessCardActions } from './BusinessCardActions'
import { BusinessCardMenu } from './BusinessCardMenu'
import { ChannelManagerModal } from './ChannelManagerModal'

interface BusinessCardProps {
  business: Business
  channels: Channel[]
  completedThisWeek: number
  totalThisWeek: number
  daysSinceLastTask: number | null
  nextTaskDate: string | null
  weekStartDate: string
  onViewWeek?: () => void
}

export function BusinessCard({
  business,
  channels,
  completedThisWeek,
  totalThisWeek,
  daysSinceLastTask,
  nextTaskDate,
  weekStartDate,
  onViewWeek,
}: BusinessCardProps) {
  const consistencyPct = totalThisWeek > 0
    ? Math.round((completedThisWeek / totalThisWeek) * 100)
    : null

  return (
    <div
      className="rounded-2xl p-6 border"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
              {business.name}
            </h2>
            {!business.is_active && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-text-muted)' }}
              >
                Paused
              </span>
            )}
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{business.description}</p>
        </div>
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          {consistencyPct !== null && (
            <span className="text-2xl font-bold" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>
              {consistencyPct}%
            </span>
          )}
          <BusinessCardMenu
            businessId={business.id}
            businessName={business.name}
            isActive={business.is_active}
            archivedAt={business.archived_at}
          />
        </div>
      </div>
      <div className="flex gap-4 text-sm flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
        <ChannelManagerModal
          businessId={business.id}
          businessName={business.name}
          initialChannels={channels}
        />
        {daysSinceLastTask !== null && (
          <span>{daysSinceLastTask === 0 ? 'Active today' : `${daysSinceLastTask}d since last task`}</span>
        )}
        {nextTaskDate && <span>Next: {nextTaskDate}</span>}
      </div>
      <BusinessCardActions
        businessId={business.id}
        weekStartDate={weekStartDate}
        hasTasks={totalThisWeek > 0}
        onViewWeek={onViewWeek}
      />
    </div>
  )
}
