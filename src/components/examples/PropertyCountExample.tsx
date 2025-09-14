'use client';

import { useState, useEffect } from 'react';
import { getPublishedPropertyCount } from '@/lib/utils';

interface PropertyCountExampleProps {
  landlordFirebaseUid: string;
}

export default function PropertyCountExample({ landlordFirebaseUid }: PropertyCountExampleProps) {
  const [propertyCount, setPropertyCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyCount = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const count = await getPublishedPropertyCount(landlordFirebaseUid);
        setPropertyCount(count);
      } catch (err) {
        console.error('Error fetching property count:', err);
        setError('Failed to load property count');
      } finally {
        setIsLoading(false);
      }
    };

    if (landlordFirebaseUid) {
      fetchPropertyCount();
    }
  }, [landlordFirebaseUid]);

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Loading property count...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Published Properties</h3>
      <p className="text-2xl font-bold text-blue-600">{propertyCount}</p>
      <p className="text-sm text-gray-600 mt-1">
        {propertyCount === 1 ? 'property' : 'properties'} published
      </p>
    </div>
  );
}
