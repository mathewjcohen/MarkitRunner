import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, success_definition, content_themes')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)

  const biz = businesses?.[0]
  if (!biz) redirect('/onboarding/step-1')

  const { count } = await supabase
    .from('channels')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', biz.id)
    .eq('is_active', true)

  if (!count || count === 0) redirect(`/onboarding/step-2?business_id=${biz.id}`)
  if (!biz.success_definition) redirect(`/onboarding/step-3?business_id=${biz.id}`)
  if (!biz.content_themes || biz.content_themes.length === 0) redirect(`/onboarding/step-4?business_id=${biz.id}`)
  redirect(`/onboarding/step-5?business_id=${biz.id}`)
}
