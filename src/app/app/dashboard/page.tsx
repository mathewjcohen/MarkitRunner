import { getBusinesses } from '@/actions/businesses'
import { getChannelsForBusiness } from '@/actions/channels'
import { getTasksForWeek } from '@/actions/tasks'
import { BusinessCard } from '@/components/dashboard/BusinessCard'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { DashboardTabs } from '@/components/dashboard/DashboardTabs'
import { ArchivedSection } from '@/components/dashboard/ArchivedSection'
import { buildWeekRange, getWeekDates } from '@/lib/utils/date'
import type { Channel } from '@/types'

export default async function DashboardPage() {
  const today = new Date().toISOString().split('T')[0]
  const { start: weekStartDate } = buildWeekRange(today)
  const weekDates = getWeekDates(weekStartDate)

  const allBusinesses = await getBusinesses(true)
  const activeBusinesses = allBusinesses.filter((b) => !b.archived_at)
  const archivedBusinesses = allBusinesses.filter((b) => b.archived_at !== null)

  // Fetch all week tasks once — filtered per business below
  const allWeekTasks = await getTasksForWeek(today)

  const now = Date.now()
  const businessesWithData = await Promise.all(
    activeBusinesses.map(async (b) => {
      const channels: Channel[] = await getChannelsForBusiness(b.id)
      const bizWeekTasks = allWeekTasks.filter((t) => t.business_id === b.id)
      const bizTodayTasks = bizWeekTasks.filter((t) => t.scheduled_date === today)
      const completed = bizWeekTasks.filter((t) => t.completed_at).length
      const total = bizWeekTasks.length

      const lastCompleted = [...bizWeekTasks]
        .filter((t) => t.completed_at)
        .sort((a, c) => new Date(c.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0]

      const daysSince = lastCompleted
        ? Math.floor((now - new Date(lastCompleted.completed_at!).getTime()) / 86400000)
        : null

      const nextTask = bizWeekTasks
        .filter((t) => !t.completed_at)
        .sort((a, c) => a.scheduled_date.localeCompare(c.scheduled_date))[0]

      return {
        business: b,
        channels,
        todayTasks: bizTodayTasks,
        weekTasks: bizWeekTasks,
        completedThisWeek: completed,
        totalThisWeek: total,
        daysSinceLastTask: daysSince,
        nextTaskDate: nextTask?.scheduled_date ?? null,
        weekStartDate,
      }
    })
  )

  const todayTasksAll = allWeekTasks.filter((t) => t.scheduled_date === today)
  const completedToday = todayTasksAll.filter((t) => t.completed_at).length
  const completedWeek = allWeekTasks.filter((t) => t.completed_at).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
        >
          Dashboard
        </h1>
        <a
          href="/onboarding/step-1"
          className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--color-accent)', color: '#FFFFFF' }}
        >
          + Add venture
        </a>
      </div>

      <DashboardStats
        totalToday={todayTasksAll.length}
        completedToday={completedToday}
        totalWeek={allWeekTasks.length}
        completedWeek={completedWeek}
        activeBusinesses={activeBusinesses.length}
      />

      {activeBusinesses.length === 0 && archivedBusinesses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            No ventures yet. Add your first to get started.
          </p>
          <a
            href="/onboarding/step-1"
            className="px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--color-accent)', color: '#FFFFFF' }}
          >
            Add venture
          </a>
        </div>
      ) : (
        <>
          {businessesWithData.length > 0 && (
            <div className="flex flex-col gap-4 mb-8">
              {businessesWithData.map(
                ({ business, channels, completedThisWeek, totalThisWeek, daysSinceLastTask, nextTaskDate }) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    channels={channels}
                    completedThisWeek={completedThisWeek}
                    totalThisWeek={totalThisWeek}
                    daysSinceLastTask={daysSinceLastTask}
                    nextTaskDate={nextTaskDate}
                    weekStartDate={weekStartDate}
                  />
                )
              )}
            </div>
          )}

          {businessesWithData.length > 0 && (
            <DashboardTabs
              businessesWithData={businessesWithData}
              weekDates={weekDates}
            />
          )}
        </>
      )}

      <ArchivedSection businesses={archivedBusinesses} />
    </div>
  )
}
