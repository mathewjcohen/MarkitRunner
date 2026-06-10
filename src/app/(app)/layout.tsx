import { getUsageWallState } from '@/actions/usage'
import { UsageBar } from '@/components/ui/UsageBar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const usage = await getUsageWallState()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F5F1' }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <a
                href="/app/today"
                className="text-sm font-medium cursor-pointer"
                style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
              >
                Tempo
              </a>
              <nav className="flex items-center gap-4">
                <a
                  href="/app/today"
                  className="text-sm cursor-pointer transition-colors hover:opacity-70"
                  style={{ color: '#736C5E' }}
                >
                  Today
                </a>
                <a
                  href="/app/dashboard"
                  className="text-sm cursor-pointer transition-colors hover:opacity-70"
                  style={{ color: '#736C5E' }}
                >
                  Dashboard
                </a>
              </nav>
            </div>
            <div className="w-48">
              <UsageBar used={usage.used} limit={usage.limit} tier={usage.tier} />
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
