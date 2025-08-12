'use client';

import { useAuth } from '@/context/AuthContext';
import OutgoingOffers from '@/components/common/OutgoingOffers';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';

export default function ApplicationsPage() {
  const { user: authUser, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <CenteredLoadingSpinner size="lg" />;
  }

  if (!isAuthenticated || !authUser?.id) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Authentication Required</h3>
          <p className="text-yellow-600 mb-4">Please sign in to view your applications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Applications</h1>
          <p className="text-gray-600">Track the status of your rental applications</p>
        </div>
      </div>

      {/* Outgoing Offers Component */}
      <OutgoingOffers
        initiatorFirebaseUid={authUser.id}
        title="Your Rental Applications"
        showPropertyInfo={true}
      />
    </div>
  );
}
