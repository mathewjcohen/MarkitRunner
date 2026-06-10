'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signUp(formData: FormData) {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }

    redirect('/onboarding/step-1')
  } catch (err) {
    if ((err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw err
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
