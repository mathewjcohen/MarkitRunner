import { getTodayTask } from '@/actions/tasks'
import { TodayTask } from '@/components/today/TodayTask'

export default async function TodayPage() {
  const task = await getTodayTask()

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
        >
          Today
        </h1>
        <p className="text-sm mt-1" style={{ color: '#736C5E' }}>
          {today}
        </p>
      </div>

      {task ? (
        <TodayTask task={task} />
      ) : (
        <div
          className="rounded-2xl p-8 text-center border"
          style={{ borderColor: '#E8E4DC', color: '#736C5E' }}
        >
          <p className="text-sm">No tasks scheduled for today.</p>
          <p className="text-sm mt-1">
            <a href="/app/dashboard" className="underline" style={{ color: '#B8601F' }}>
              Go to dashboard
            </a>{' '}
            to generate your weekly plan.
          </p>
        </div>
      )}
    </div>
  )
}
