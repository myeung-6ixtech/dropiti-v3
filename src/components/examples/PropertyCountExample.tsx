'use client';

import { useState, useEffect } from 'react';
import { getTotalPropertyCount, getPublishedPropertyCountByStatus } from '@/lib/utils';

interface PropertyCountExampleProps {
  landlordUserId: string;
}

export default function PropertyCountExample({ landlordUserId }: PropertyCountExampleProps) {
  const [propertyCounts, setPropertyCounts] = useState({
    totalProperties: 0,
    publishedProperties: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyCounts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [totalCount, publishedCount] = await Promise.all([
          getTotalPropertyCount(landlordUserId),
          getPublishedPropertyCountByStatus(landlordUserId)
        ]);
        
        setPropertyCounts({
          totalProperties: totalCount,
          publishedProperties: publishedCount
        });
      } catch (err) {
        console.error('Error fetching property counts:', err);
        setError('Failed to load property counts');
      } finally {
        setIsLoading(false);
      }
    };

    if (landlordUserId) {
      fetchPropertyCounts();
    }
  }, [landlordUserId]);

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Loading property counts...</p>
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{propertyCounts.totalProperties}</p>
          <p className="text-sm text-gray-600">
            {propertyCounts.totalProperties === 1 ? 'Property' : 'Properties'} Total
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{propertyCounts.publishedProperties}</p>
          <p className="text-sm text-gray-600">
            {propertyCounts.publishedProperties === 1 ? 'Property' : 'Properties'} Published
          </p>
        </div>
      </div>
    </div>
  );
}
