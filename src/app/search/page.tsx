import { Metadata } from 'next';
import { Suspense } from 'react';
import SearchPageContent from './SearchPageContent';
import { prefetchSearchListings } from '@/lib/listings-server';

export const metadata: Metadata = {
  title: 'Search Properties - dropiti',
  description: 'Search and discover amazing properties for rent on dropiti. Find your perfect home with our advanced search filters and detailed property listings.',
  keywords: ['property search', 'real estate search', 'apartment search', 'house search', 'rental search', 'dropiti'],
  openGraph: {
    title: 'Search Properties - dropiti',
    description: 'Search and discover amazing properties for rent on dropiti. Find your perfect home with our advanced search filters.',
    images: ['/images/dropiti-homepage-001.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search Properties - dropiti',
    description: 'Search and discover amazing properties for rent on dropiti. Find your perfect home with our advanced search filters.',
    images: ['/images/dropiti-homepage-001.webp'],
  },
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const filters = {
    location: readParam(params, 'location'),
    bedrooms: readParam(params, 'bedrooms'),
    maxPrice: readParam(params, 'maxPrice'),
  };
  const initialData = await prefetchSearchListings(filters);

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div>Loading...</div>}>
        <SearchPageContent initialData={initialData ?? undefined} />
      </Suspense>
    </div>
  );
}
