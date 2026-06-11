import { createClient } from '@/lib/supabase/server'
import type { PrimaryGoal } from '@/types'
import { Step3Form } from './Step3Form'

export default async function OnboardingStep3({
  searchParams,
}: {
  searchParams: Promise<{ business_id?: string }>
}) {
  const { business_id = '' } = await searchParams

  let initialGoal: PrimaryGoal | '' = ''
  let initialSuccess = ''

  if (business_id) {
    const supabase = await createClient()
    const { data: biz } = await supabase
      .from('businesses')
      .select('primary_goal, success_definition')
      .eq('id', business_id)
      .single()

    if (biz?.success_definition) {
      initialGoal = biz.primary_goal as PrimaryGoal
      initialSuccess = biz.success_definition
    }
  }

  return (
    <Step3Form
      businessId={business_id}
      initialGoal={initialGoal}
      initialSuccess={initialSuccess}
    />
  )
}
