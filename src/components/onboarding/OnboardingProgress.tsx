interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex gap-1.5 mb-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{
              backgroundColor: i < currentStep ? '#B8601F' : '#E8E4DC',
            }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: '#736C5E' }}>
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  )
}
