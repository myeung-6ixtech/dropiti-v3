'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import AllIncomingOffers from '@/components/common/AllIncomingOffers';
import { OffersHeader } from './_components/offers-header';
import PullToRefreshWrapper from '@/components/common/PullToRefreshWrapper';

export default function OffersPage() {
  const { user: authUser } = useAuth();
  const { t } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(async () => {
    setRefreshKey((k) => k + 1);
  }, []);

  if (!authUser?.id) {
    return <CenteredLoadingSpinner size="lg" />;
  }

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <OffersHeader
        title={t('offers.incomingOffers')}
        description={t('offers.manageOffersDescription')}
      />

      <AllIncomingOffers key={refreshKey} recipientUserId={authUser.id} />
    </div>
    </PullToRefreshWrapper>
  );
}