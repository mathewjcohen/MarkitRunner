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

  const barColor = atLimit ? '#DC2626' : nearLimit ? '#D97706' : 'var(--color-accent)'

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: '6px', backgroundColor: 'var(--color-border)' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="relative group">
        <span
          className="text-xs whitespace-nowrap cursor-default"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {used}/{limit} AI uses
          {tier === 'trial' && (
            <a
              href="/upgrade"
              className="ml-1 underline cursor-pointer"
              style={{ color: 'var(--color-accent)' }}
            >
              Upgrade
            </a>
          )}
        </span>
        <div
          className="absolute bottom-full right-0 mb-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
          style={{
            backgroundColor: 'var(--color-surface-raised)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          role="tooltip"
        >
          AI actions used this month. Resets on the 1st.
        </div>
      </div>
    </div>
  )
}
