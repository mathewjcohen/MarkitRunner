import type { Cadence } from '@/types'

/**
 * Returns expected task dates for a channel in a given month.
 * 'daily' → 5 weekdays per week (Mon–Fri)
 * 'weekly' → 1 date per week (Monday)
 * '2x_week' → 2 dates per week (Mon + Thu)
 * 'monthly' → 1 date per month (1st of month)
 */
export function getPeriodDates(cadence: Cadence, year: number, month: number): string[] {
  const dates: string[] = []
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  function fmt(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }

  if (cadence === 'monthly') {
    dates.push(fmt(firstDay))
    return dates
  }

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
    const dateStr = fmt(new Date(d))

    if (cadence === 'daily' && dow >= 1 && dow <= 5) {
      dates.push(dateStr)
    } else if (cadence === 'weekly' && dow === 1) {
      dates.push(dateStr)
    } else if (cadence === '2x_week' && (dow === 1 || dow === 4)) {
      dates.push(dateStr)
    }
  }

  return dates
}

/**
 * Calculates the current streak for a channel (consecutive completed periods).
 * A "period" is one expected task date. Streak counts backwards from today.
 */
export function calculateStreakForChannel(
  channelId: string,
  tasks: Array<{ channel_id: string; scheduled_date: string; completed_at: string | null }>,
  cadence: Cadence,
  today: string
): number {
  const channelTasks = tasks.filter((t) => t.channel_id === channelId)
  const completedDates = new Set(
    channelTasks
      .filter((t) => t.completed_at)
      .map((t) => t.scheduled_date)
  )

  const [year, month] = today.split('-').map(Number)

  // Collect expected dates for the past 3 months (enough for streak calc)
  const allExpected: string[] = []
  for (let i = 0; i < 3; i++) {
    let m = month - i
    let y = year
    if (m <= 0) {
      m += 12
      y -= 1
    }
    allExpected.push(...getPeriodDates(cadence, y, m))
  }

  // Sort descending, only dates up to and including today
  const pastExpected = allExpected
    .filter((d) => d <= today)
    .sort()
    .reverse()

  let streak = 0
  for (const date of pastExpected) {
    if (completedDates.has(date)) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/**
 * Calculates consistency score for a channel in the current month.
 * Returns a number 0–100 (percentage of expected tasks completed).
 */
export function calculateConsistencyScore(
  channelId: string,
  tasks: Array<{ channel_id: string; scheduled_date: string; completed_at: string | null }>,
  cadence: Cadence,
  year: number,
  month: number
): number {
  const expected = getPeriodDates(cadence, year, month)
  if (expected.length === 0) return 100

  const channelTasks = tasks.filter((t) => t.channel_id === channelId)
  const completedDates = new Set(
    channelTasks
      .filter((t) => t.completed_at)
      .map((t) => t.scheduled_date)
  )

  const completed = expected.filter((d) => completedDates.has(d)).length
  return Math.round((completed / expected.length) * 100)
}
