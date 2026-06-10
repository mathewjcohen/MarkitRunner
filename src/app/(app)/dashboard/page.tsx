import { getBusinesses } from '@/actions/businesses'
import { getChannelsForBusiness } from '@/actions/channels'
import { getTasksForWeek } from '@/actions/tasks'
import { BusinessCard } from '@/components/dashboard/BusinessCard'

export default async function DashboardPage() {
  const businesses = await getBusinesses()
  const today = new Date().toISOString().split('T')[0]

  const now = Date.now()
  const businessesWithData = await Promise.all(
    businesses.map(async (b) => {
      const [channels, weekTasks] = await Promise.all([
        getChannelsForBusiness(b.id),
        getTasksForWeek(today),
      ])
      const bizTasks = weekTasks.filter((t) => t.business_id === b.id)
      const completed = bizTasks.filter((t) => t.completed_at).length
      const total = bizTasks.length

      const completedTasks = bizTasks.filter((t) => t.completed_at)
      const lastCompleted = completedTasks.sort(
        (a, b) =>
          new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
      )[0]
      const daysSince = lastCompleted
        ? Math.floor(
            (now - new Date(lastCompleted.completed_at!).getTime()) / 86400000
          )
        : null

      const nextTask = bizTasks
        .filter((t) => !t.completed_at)
        .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))[0]

      return {
        business: b,
        channels,
        completed,
        total,
        daysSince,
        nextTaskDate: nextTask?.scheduled_date ?? null,
      }
    })
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1
        className="text-2xl font-semibold mb-8"
        style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
      >
        Dashboard
      </h1>
      {businesses.length === 0 ? (
        <p style={{ color: '#736C5E' }}>
          No businesses yet.{' '}
          <a href="/onboarding/step-1" className="underline" style={{ color: '#B8601F' }}>
            Add one
          </a>
          .
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {businessesWithData.map(
            ({ business, channels, completed, total, daysSince, nextTaskDate }) => (
              <BusinessCard
                key={business.id}
                business={business}
                channels={channels}
                completedThisWeek={completed}
                totalThisWeek={total}
                daysSinceLastTask={daysSince}
                nextTaskDate={nextTaskDate}
              />
            )
          )}
        </div>
      )}
    </div>
  )
}
