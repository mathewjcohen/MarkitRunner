import type { Tier } from '@/types'

interface UsageBarProps {
  used: number
  limit: number
  tier: Tier
}

export function UsageBar({ used, limit, tier }: UsageBarProps) {
  const pct = Math.min((used / limit) * 100, 100)
  const atLimit = used >= limit
  const nearLimit = pct >= 80

  const barColor = atLimit ? '#DC2626' : nearLimit ? '#D97706' : '#B8601F'

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: '6px', backgroundColor: '#E8E4DC' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="text-xs whitespace-nowrap" style={{ color: '#736C5E' }}>
        {used}/{limit} AI uses
        {tier === 'trial' && (
          <a
            href="/upgrade"
            className="ml-1 underline cursor-pointer"
            style={{ color: '#B8601F' }}
          >
            Upgrade
          </a>
        )}
      </span>
    </div>
  )
}
