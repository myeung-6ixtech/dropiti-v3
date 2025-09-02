import { Metadata } from 'next';
import { Suspense } from 'react';
import SearchPageContent from './SearchPageContent';

export const metadata: Metadata = {
  title: 'Search Properties - dropiti',
  description: 'Search and discover amazing properties for rent on dropiti. Find your perfect home with our advanced search filters and detailed property listings.',
  keywords: ['property search', 'real estate search', 'apartment search', 'house search', 'rental search', 'dropiti'],
  openGraph: {
    title: 'Search Properties - dropiti',
    description: 'Search and discover amazing properties for rent on dropiti. Find your perfect home with our advanced search filters.',
    images: ['/images/dropiti_logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search Properties - dropiti',
    description: 'Search and discover amazing properties for rent on dropiti. Find your perfect home with our advanced search filters.',
    images: ['/images/dropiti_logo.png'],
  },
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div>Loading...</div>}>
        <SearchPageContent />
      </Suspense>
    </div>
  );
}
