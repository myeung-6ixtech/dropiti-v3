import { Metadata } from 'next';
import Footer from '@/components/common/Footer';
import HeroSection from '@/components/common/HeroSection';
import CommercialSections from '@/components/common/CommercialSections';

export const metadata: Metadata = {
  title: 'dropiti - real estate platform',
  description: 'Find your perfect home with dropiti - the leading real estate platform for property rentals and sales. Discover amazing properties with detailed listings, photos, and direct communication with landlords.',
  keywords: ['real estate', 'property rental', 'apartments', 'houses', 'rent', 'property search', 'real estate platform', 'dropiti'],
  openGraph: {
    title: 'dropiti - real estate platform',
    description: 'Find your perfect home with dropiti - the leading real estate platform for property rentals and sales.',
    images: ['/images/dropiti_logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'dropiti - real estate platform',
    description: 'Find your perfect home with dropiti - the leading real estate platform for property rentals and sales.',
    images: ['/images/dropiti_logo.png'],
  },
};

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
