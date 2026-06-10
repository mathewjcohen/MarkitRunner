import { getOnboardingStep } from '@/app/onboarding/utils'

describe('getOnboardingStep', () => {
  it('returns step 1 when no businesses exist', () => {
    expect(getOnboardingStep({ hasBusinesses: false, hasColdStart: false })).toBe(1)
  })

  it('returns step 5 when business exists but no cold start', () => {
    expect(getOnboardingStep({ hasBusinesses: true, hasColdStart: false })).toBe(5)
  })

  it('returns null (done) when all steps complete', () => {
    expect(getOnboardingStep({ hasBusinesses: true, hasColdStart: true })).toBeNull()
  })
})
