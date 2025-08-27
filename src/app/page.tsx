'use client';

import Footer from '@/components/common/Footer';
import HeroSection from '@/components/common/HeroSection';
import CommercialSections from '@/components/common/CommercialSections';

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Commercial Sections - Inspired by Zigbang */}
      <CommercialSections />

      {/* Footer */}
      <Footer />
    </div>
  );
}
