import { createClient } from '@/lib/supabase/server'
import type { ChannelType } from '@/types'
import { Step2Form } from './Step2Form'

export default async function OnboardingStep2({
  searchParams,
}: {
  searchParams: Promise<{ business_id?: string }>
}) {
  const { business_id = '' } = await searchParams

  let initialSelected: ChannelType[] = []
  if (business_id) {
    const supabase = await createClient()
    const { data: channels } = await supabase
      .from('channels')
      .select('type')
      .eq('business_id', business_id)
      .eq('is_active', true)
    initialSelected = (channels ?? []).map(c => c.type as ChannelType)
  }

  return <Step2Form businessId={business_id} initialSelected={initialSelected} />
}
