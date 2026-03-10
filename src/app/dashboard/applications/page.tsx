'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import AllOutgoingOffers from '@/components/common/AllOutgoingOffers';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import { ApplicationsHeader } from './_components/applications-header';

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
      <ApplicationsHeader
        title={t('applications.yourApplications')}
        description={t('applications.trackApplicationsDescription')}
      />

      {/* All Outgoing Offers Component with Tabs */}
      <AllOutgoingOffers
        initiatorUserId={authUser.id}
        showPropertyInfo={true}
      />
    </div>
  );
}
