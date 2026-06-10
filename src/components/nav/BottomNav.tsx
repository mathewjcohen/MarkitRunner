'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export function BottomNav(): ReactNode {
  const pathname = usePathname()

  const isActive = (href: string): boolean => {
    return pathname === href
  }

  const tabs: Array<{
    href: string
    label: string
    icon: ReactNode
  }> = [
    {
      href: '/app/today',
      label: 'Today',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      href: '/app/weekly',
      label: 'Weekly',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      href: '/app/metrics',
      label: 'Metrics',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      href: '/app/dashboard',
      label: 'Dashboard',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden border-t"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E8E4DC',
        height: '56px',
        zIndex: 40,
      }}
    >
      <div className="flex items-center justify-around h-full">
        {tabs.map((tab) => {
          const active = isActive(tab.href)
          return (
            <a
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors"
              style={{
                color: active ? '#B8601F' : '#736C5E',
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {tab.icon}
                <span
                  className="text-xs font-medium"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {tab.label}
                </span>
              </div>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
