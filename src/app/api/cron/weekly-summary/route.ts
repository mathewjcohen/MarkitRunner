import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { weeklySummaryEmail } from '@/lib/email/templates'
import { sendEmail } from '@/lib/email/sender'

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Validate CRON_SECRET header
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Initialize Supabase service role client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Calculate date range: past 7 days
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Find tasks completed in the past 7 days
    const { data: completedTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, user_id, business_id')
      .not('completed_at', 'is', null)
      .gte('completed_at', sevenDaysAgo.toISOString())
      .lte('completed_at', now.toISOString())

    if (tasksError) {
      console.error('Error fetching completed tasks:', tasksError)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    if (!completedTasks || completedTasks.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    // Group tasks by user
    const userTasksMap = new Map<
      string,
      { completed: string[]; businessIds: Set<string> }
    >()

    for (const task of completedTasks) {
      const userId = task.user_id as string
      if (!userTasksMap.has(userId)) {
        userTasksMap.set(userId, { completed: [], businessIds: new Set() })
      }
      const entry = userTasksMap.get(userId)!
      entry.completed.push(task.id)
      entry.businessIds.add(task.business_id)
    }

    // Process each user
    let sent = 0

    for (const [userId, { completed, businessIds }] of userTasksMap) {
      try {
        // Get user email via admin API
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
          userId
        )

        if (authError || !authUser.user?.email) {
          console.error(`Failed to get email for user ${userId}:`, authError)
          continue
        }

        const email = authUser.user.email

        // Get user profile (first_name)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', userId)
          .single()

        if (profileError) {
          console.error(`Failed to get profile for user ${userId}:`, profileError)
          continue
        }

        const firstName = profile?.display_name ?? null

        // Count total tasks scheduled in the same 7-day window
        const { data: allTasks, error: allTasksError } = await supabase
          .from('tasks')
          .select('id')
          .eq('user_id', userId)
          .gte('scheduled_date', sevenDaysAgo.toISOString().split('T')[0])
          .lte('scheduled_date', now.toISOString().split('T')[0])

        if (allTasksError) {
          console.error(`Failed to get all tasks for user ${userId}:`, allTasksError)
          continue
        }

        const totalTasks = allTasks?.length ?? 0
        const completedCount = completed.length

        // Get distinct business names
        const { data: businesses, error: businessesError } = await supabase
          .from('businesses')
          .select('name')
          .in('id', Array.from(businessIds))

        if (businessesError) {
          console.error(`Failed to get businesses for user ${userId}:`, businessesError)
          continue
        }

        const businessNames = (businesses ?? []).map((b) => b.name)

        // Format week of string (start of 7-day window)
        const weekStart = new Date(sevenDaysAgo)
        const weekOfString = weekStart.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })

        // Generate and send email
        const { subject, html } = weeklySummaryEmail({
          firstName,
          completedTasks: completedCount,
          totalTasks,
          businessNames,
          weekOf: weekOfString,
        })

        const { error: sendError } = await sendEmail(email, subject, html)

        if (!sendError) {
          sent++
        } else {
          console.error(`Failed to send email to ${email}:`, sendError)
        }
      } catch (err) {
        console.error(`Error processing user ${userId}:`, err)
        continue
      }
    }

    return NextResponse.json({ sent })
  } catch (err) {
    console.error('Unexpected error in weekly-summary:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
