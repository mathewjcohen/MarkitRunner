'use client'

import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/providers/ThemeProvider'
import { UsageBar } from '@/components/ui/UsageBar'
import type { Tier } from '@/types'

interface TopNavProps {
  usage: { used: number; limit: number; tier: Tier }
}

const NAV_LINKS = [
  { href: '/app/dashboard', label: 'Dashboard' },
  { href: '/app/metrics', label: 'Metrics' },
]

export function TopNav({ usage }: TopNavProps) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <a
              href="/app/dashboard"
              className="text-sm font-medium cursor-pointer mr-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
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
                      color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                      backgroundColor: active ? 'var(--color-bg)' : 'transparent',
                      fontWeight: active ? 500 : 400,
                    }}
                  >
                    {label}
                  </a>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block w-36">
              <UsageBar used={usage.used} limit={usage.limit} tier={usage.tier} />
            </div>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:opacity-80"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <a
              href="/app/settings"
              aria-label="Settings"
              className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
              style={{
                color: pathname === '/app/settings' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                backgroundColor: pathname === '/app/settings' ? 'var(--color-accent-subtle)' : 'transparent',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
