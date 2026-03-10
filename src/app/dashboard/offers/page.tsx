'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import AllIncomingOffers from '@/components/common/AllIncomingOffers';
import { OffersHeader } from './_components/offers-header';

export default function OffersPage() {
  const { user: authUser } = useAuth();
  const { t } = useLanguage();

  if (!authUser?.id) {
    return <CenteredLoadingSpinner size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <OffersHeader
        title={t('offers.incomingOffers')}
        description={t('offers.manageOffersDescription')}
      />

      {/* All Incoming Offers Component */}
      <AllIncomingOffers recipientUserId={authUser.id} />
    </div>
  );
}