import { createClient } from '@/lib/supabase/server'
import { Step5Form } from './Step5Form'

export default async function OnboardingStep5({
  searchParams,
}: {
  searchParams: Promise<{ business_id?: string }>
}) {
  const { business_id = '' } = await searchParams

  let initialNotes = ''

  if (business_id) {
    const supabase = await createClient()
    const { data: biz } = await supabase
      .from('businesses')
      .select('cold_start_notes')
      .eq('id', business_id)
      .single()

    initialNotes = biz?.cold_start_notes ?? ''
  }

  return <Step5Form businessId={business_id} initialNotes={initialNotes} />
}
