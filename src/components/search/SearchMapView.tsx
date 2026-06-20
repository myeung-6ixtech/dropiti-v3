'use client';

import dynamic from 'next/dynamic';
import SearchMapViewSkeleton from './SearchMapViewSkeleton';

const SearchMapViewInner = dynamic(() => import('./SearchMapViewInner'), {
  ssr: false,
  loading: () => <SearchMapViewSkeleton />,
});

export default SearchMapViewInner;
