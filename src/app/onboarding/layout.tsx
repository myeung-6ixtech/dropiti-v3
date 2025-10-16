export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-6 md:py-8">
        {children}
      </div>
    </div>
  );
}
