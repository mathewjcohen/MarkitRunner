'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateWeekStartDay(weekStartDay: number) {
  if (weekStartDay < 0 || weekStartDay > 6) return { error: 'Invalid day' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ week_start_day: weekStartDay })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/app/settings')
  revalidatePath('/app/dashboard')
  return { success: true }
}
