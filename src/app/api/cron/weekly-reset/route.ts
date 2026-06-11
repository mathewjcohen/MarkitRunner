import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    // Find profiles where ai_actions_reset_at is null OR < (now - 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: profiles, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .or(`ai_actions_reset_at.is.null,ai_actions_reset_at.lt.${thirtyDaysAgo.toISOString()}`)

    if (selectError) {
      console.error('Error fetching profiles:', selectError)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ reset: 0 })
    }

    // Update each profile: ai_actions_used = 0, ai_actions_reset_at = now
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        ai_actions_used: 0,
        ai_actions_reset_at: now,
      })
      .in(
        'id',
        profiles.map((p) => p.id)
      )

    if (updateError) {
      console.error('Error updating profiles:', updateError)
      return NextResponse.json({ error: 'Failed to update profiles' }, { status: 500 })
    }

    // Purge businesses archived more than 30 days ago
    const archiveCutoff = new Date()
    archiveCutoff.setDate(archiveCutoff.getDate() - 30)

    const { error: purgeError } = await supabase
      .from('businesses')
      .delete()
      .not('archived_at', 'is', null)
      .lt('archived_at', archiveCutoff.toISOString())

    if (purgeError) {
      console.error('Error purging archived businesses:', purgeError)
    }

    return NextResponse.json({ reset: profiles.length })
  } catch (err) {
    console.error('Unexpected error in weekly-reset:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
