import { createClient } from '@/lib/supabase/server'
import { getTaskHistory } from '@/actions/tasks'
import { HistoryList } from '@/components/history/HistoryList'
import { buildWeekRange } from '@/lib/utils/date'
import { redirect } from 'next/navigation'
import type { Task } from '@/types'

interface TaskWithRelations extends Task {
  businesses: { name: string } | null
  channels: { type: string; label: string | null } | null
}

export default async function HistoryPage() {
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
  const { start: currentWeekStart } = buildWeekRange(today, weekStartDay)

  const tasks = (await getTaskHistory(currentWeekStart)) as TaskWithRelations[]

  // Group tasks by week start date
  const weekMap = new Map<string, TaskWithRelations[]>()
  for (const task of tasks) {
    const { start } = buildWeekRange(task.scheduled_date, weekStartDay)
    if (!weekMap.has(start)) weekMap.set(start, [])
    weekMap.get(start)!.push(task)
  }

  const weekGroups = Array.from(weekMap.entries()).map(([weekStart, weekTasks]) => ({
    weekStart,
    tasks: weekTasks,
  }))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
        >
          History
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          All tasks from previous weeks
        </p>
      </div>

      <HistoryList weekGroups={weekGroups} />
    </div>
  )
}
