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
    return <CenteredLoadingSpinner size="lg" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Outgoing Offers Component */}
      <OutgoingOffers
        initiatorFirebaseUid={authUser.id}
        title="Your Rental Applications"
        showPropertyInfo={true}
      />
    </div>
  );
}
