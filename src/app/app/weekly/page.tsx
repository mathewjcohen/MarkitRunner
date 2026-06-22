import { createClient } from '@/lib/supabase/server'
import { getTasksForWeek } from '@/actions/tasks'
import { getBusinesses } from '@/actions/businesses'
import { GeneratePlanButton } from '@/components/weekly/GeneratePlanButton'
import { WeeklyGrid } from '@/components/weekly/WeeklyGrid'
import { buildWeekRange, getWeekDates, formatDateRange } from '@/lib/utils/date'
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
      <WeeklyGrid weekDates={weekDates} tasksByDate={tasksByDate} />
    </div>
  )
}
