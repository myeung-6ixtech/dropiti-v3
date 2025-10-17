'use client';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hide navigation for onboarding flow */}
      <style jsx global>{`
        nav { display: none !important; }
        .mobile-bottom-nav { display: none !important; }
        .fixed.top-0 { display: none !important; }
        .fixed.bottom-0 { display: none !important; }
      `}</style>
      <div className="max-w-md mx-auto px-4 py-6 md:py-8">
        {children}
      </div>
    </div>
  );
}
