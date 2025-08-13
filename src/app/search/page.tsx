'use client';

import { Suspense } from 'react';
import SearchPageContent from './SearchPageContent';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div>Loading...</div>}>
        <SearchPageContent />
      </Suspense>
    </div>
  );
}
