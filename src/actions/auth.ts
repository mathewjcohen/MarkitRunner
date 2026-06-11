'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signUp(formData: FormData) {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${appUrl}/auth/confirm` },
    })
    if (error) return { error: error.message }

    return { success: true }
  } catch (err) {
    console.error('signUp error:', err)
    return { error: err instanceof Error ? err.message : 'Something went wrong. Please try again.' }
  }
}

export async function signIn(formData: FormData) {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    redirect('/app/today')
  } catch (err) {
    if ((err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error('signIn error:', err)
    return { error: err instanceof Error ? err.message : 'Something went wrong. Please try again.' }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function sendPasswordReset() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'No email found' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${appUrl}/auth/confirm`,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function completeOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: user.id, onboarding_complete: true, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )

  if (error) return { error: error.message }
  return { success: true }
}

export async function scheduleAccountDeletion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const deletionDate = new Date()
  deletionDate.setDate(deletionDate.getDate() + 30)

  const { error } = await supabase
    .from('users')
    .update({ deletion_scheduled_at: deletionDate.toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true, deletionDate: deletionDate.toISOString() }
}

export async function cancelAccountDeletion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({ deletion_scheduled_at: null })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
