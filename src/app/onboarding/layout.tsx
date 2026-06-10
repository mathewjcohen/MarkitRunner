export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#F7F5F1' }}
    >
      <div
        className="w-full max-w-[460px] bg-white rounded-3xl p-10"
        style={{ boxShadow: '0 4px 24px rgba(24,22,15,0.08)' }}
      >
        {children}
      </div>
    </div>
  )
}
