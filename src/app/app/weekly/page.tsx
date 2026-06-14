import { createClient } from '@/lib/supabase/server'
import { getTasksForWeek } from '@/actions/tasks'
import { getBusinesses } from '@/actions/businesses'
import { GeneratePlanButton } from '@/components/weekly/GeneratePlanButton'
import { WeeklyTaskCard } from '@/components/weekly/WeeklyTaskCard'
import { buildWeekRange, getWeekDates, formatDateRange, isToday } from '@/lib/utils/date'
import { redirect } from 'next/navigation'
import type { Task, Business } from '@/types'

interface TaskWithRelations extends Task {
  businesses: { name: string } | null
  channels: { type: string; label: string | null } | null
}

export default async function WeeklyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('week_start_day')
    .eq('id', user.id)
    .single()

  const weekStartDay = profile?.week_start_day ?? 1

  const today = new Date().toISOString().split('T')[0]

  const [tasks, businesses] = await Promise.all([
    getTasksForWeek(today, weekStartDay),
    getBusinesses(),
  ])

  const weekRange = buildWeekRange(today, weekStartDay)
  const weekDates = getWeekDates(weekRange.start)
  const dateRangeText = formatDateRange(weekRange.start)

  // Group tasks by date
  const tasksByDate = (tasks as TaskWithRelations[]).reduce(
    (acc, task) => {
      if (!acc[task.scheduled_date]) {
        acc[task.scheduled_date] = []
      }
      acc[task.scheduled_date].push(task)
      return acc
    },
    {} as Record<string, TaskWithRelations[]>
  )

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
        >
          This Week
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {dateRangeText}
        </p>
      </div>

      {/* Generate Plan Button */}
      <div className="mb-8">
        <GeneratePlanButton businesses={businesses} weekStartDate={weekRange.start} />
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDates.map((dayInfo) => (
          <div
            key={dayInfo.date}
            className="rounded-xl border"
            style={{
              borderColor: isToday(dayInfo.date) ? 'var(--color-accent)' : 'var(--color-border)',
              backgroundColor: isToday(dayInfo.date) ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
              borderLeftWidth: isToday(dayInfo.date) ? '4px' : '1px',
            }}
          >
            {/* Day header */}
            <div
              className="px-4 py-3 border-b font-semibold text-sm"
              style={{
                borderBottomColor: 'var(--color-border)',
                color: isToday(dayInfo.date) ? 'var(--color-accent)' : 'var(--color-text)',
                fontFamily: 'var(--font-display)',
              }}
            >
              <div>{dayInfo.dayName}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 'normal' }}>
                {dayInfo.dayNum}
              </div>
            </div>

            {/* Tasks for this day */}
            <div className="px-4 py-3 flex flex-col gap-3 min-h-48">
              {tasksByDate[dayInfo.date]?.length > 0 ? (
                tasksByDate[dayInfo.date].map((task) => (
                  <WeeklyTaskCard key={task.id} task={task} />
                ))
              ) : (
                <div
                  className="text-xs text-center py-8 flex items-center justify-center h-full"
                  style={{ color: 'var(--color-border)' }}
                >
                  —
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
