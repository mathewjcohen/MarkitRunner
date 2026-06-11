import { createClient } from '@/lib/supabase/server'
import { Step4Form } from './Step4Form'

export default async function OnboardingStep4({
  searchParams,
}: {
  searchParams: Promise<{ business_id?: string }>
}) {
  const { business_id = '' } = await searchParams

  let initialThemes: [string, string, string] = ['', '', '']

  if (business_id) {
    const supabase = await createClient()
    const { data: biz } = await supabase
      .from('businesses')
      .select('content_themes')
      .eq('id', business_id)
      .single()

    if (biz?.content_themes?.length === 3) {
      initialThemes = biz.content_themes as [string, string, string]
    }
  }

  return <Step4Form businessId={business_id} initialThemes={initialThemes} />
}
