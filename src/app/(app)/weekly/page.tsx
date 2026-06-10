import { getTasksForWeek } from '@/actions/tasks'
import { getBusinesses } from '@/actions/businesses'
import { GeneratePlanButton } from '@/components/weekly/GeneratePlanButton'
import { buildWeekRange, getWeekDates, formatDateRange, isToday } from '@/lib/utils/date'
import type { Task, Business } from '@/types'

interface TaskWithRelations extends Task {
  businesses: { name: string } | null
  channels: { type: string; label: string | null } | null
}

export default async function WeeklyPage() {
  const today = new Date().toISOString().split('T')[0]

  const [tasks, businesses] = await Promise.all([
    getTasksForWeek(today),
    getBusinesses(),
  ])

  const weekRange = buildWeekRange(today)
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
          style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
        >
          This Week
        </h1>
        <p className="text-sm mt-1" style={{ color: '#736C5E' }}>
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
              borderColor: isToday(dayInfo.date) ? '#B8601F' : '#E8E4DC',
              backgroundColor: isToday(dayInfo.date) ? '#FDF8F4' : '#FFFFFF',
              borderLeftWidth: isToday(dayInfo.date) ? '4px' : '1px',
            }}
          >
            {/* Day header */}
            <div
              className="px-4 py-3 border-b font-semibold text-sm"
              style={{
                borderBottomColor: '#E8E4DC',
                color: isToday(dayInfo.date) ? '#B8601F' : '#18160F',
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
                  <div
                    key={task.id}
                    className="text-xs rounded-lg p-2 border flex flex-col gap-1"
                    style={{
                      borderColor: '#E8E4DC',
                      backgroundColor: task.completed_at ? '#F0FDF4' : '#FFFFFF',
                    }}
                  >
                    {/* Channel label */}
                    <div
                      style={{
                        color: '#736C5E',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        opacity: task.completed_at ? 0.6 : 1,
                      }}
                    >
                      {task.channels?.label || task.channels?.type || 'Unknown'}
                    </div>

                    {/* Task title */}
                    <div
                      style={{
                        color: '#18160F',
                        fontSize: '0.85rem',
                        fontWeight: task.completed_at ? 'normal' : 'semibold',
                        opacity: task.completed_at ? 0.6 : 1,
                        textDecoration: task.completed_at ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </div>

                    {/* Completion indicator */}
                    {task.completed_at && (
                      <div
                        style={{
                          color: '#22C55E',
                          fontSize: '0.75rem',
                          marginTop: '0.25rem',
                        }}
                      >
                        ✓ Done
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div
                  className="text-xs text-center py-8 flex items-center justify-center h-full"
                  style={{ color: '#E8E4DC' }}
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
