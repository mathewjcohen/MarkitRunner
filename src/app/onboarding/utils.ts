interface OnboardingState {
  hasBusinesses: boolean
  hasColdStart: boolean
}

export function getOnboardingStep(state: OnboardingState): number | null {
  if (!state.hasBusinesses) return 1
  if (!state.hasColdStart) return 5
  return null
}
