'use client';

import Footer from '@/components/common/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hide top navigation only on mobile for onboarding flow */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          nav { display: none !important; }
          .fixed.top-0 { display: none !important; }
        }
      `}</style>
      
      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-xl mx-auto px-4 py-6 md:py-8">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
