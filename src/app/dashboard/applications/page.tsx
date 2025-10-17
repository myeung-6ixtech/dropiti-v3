'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import AllOutgoingOffers from '@/components/common/AllOutgoingOffers';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';

export default function ApplicationsPage() {
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return <CenteredLoadingSpinner size="lg" />;
  }

  if (!isAuthenticated || !authUser?.id) {
    return <CenteredLoadingSpinner size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">{t('applications.yourApplications')}</h1>
          <p className="text-gray-600 mt-2">
            {t('applications.trackApplicationsDescription')}
          </p>
        </div>
      </div>

      {/* All Outgoing Offers Component with Tabs */}
      <AllOutgoingOffers
        initiatorFirebaseUid={authUser.id}
        showPropertyInfo={true}
      />
    </div>
  );
}
