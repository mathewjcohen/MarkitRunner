'use client'

import { usePathname } from 'next/navigation'
import { UsageBar } from '@/components/ui/UsageBar'
import type { Tier } from '@/types'

interface TopNavProps {
  usage: { used: number; limit: number; tier: Tier }
}

const NAV_LINKS = [
  { href: '/app/today', label: 'Today' },
  { href: '/app/weekly', label: 'Weekly' },
  { href: '/app/dashboard', label: 'Dashboard' },
  { href: '/app/metrics', label: 'Metrics' },
]

export function TopNav({ usage }: TopNavProps) {
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' }}
    >
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <a
              href="/app/today"
              className="text-sm font-medium cursor-pointer mr-4"
              style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
            >
              MarkitRunner
            </a>
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href
                return (
                  <a
                    key={href}
                    href={href}
                    className="px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors"
                    style={{
                      color: active ? '#18160F' : '#736C5E',
                      backgroundColor: active ? '#F7F5F1' : 'transparent',
                      fontWeight: active ? 500 : 400,
                    }}
                  >
                    {label}
                  </a>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block w-36">
              <UsageBar used={usage.used} limit={usage.limit} tier={usage.tier} />
            </div>
            <a
              href="/app/settings"
              aria-label="Settings"
              className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
              style={{
                color: pathname === '/app/settings' ? '#B8601F' : '#736C5E',
                backgroundColor: pathname === '/app/settings' ? '#FDF8F4' : 'transparent',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
