'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import AllIncomingOffers from '@/components/common/AllIncomingOffers';

export default function OffersPage() {
  const { user: authUser } = useAuth();
  const { t } = useLanguage();

  if (!authUser?.id) {
    return <CenteredLoadingSpinner size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">{t('offers.incomingOffers')}</h1>
          <p className="text-gray-600 mt-2">
            {t('offers.manageOffersDescription')}
          </p>
        </div>
      </div>

      {/* All Incoming Offers Component */}
      <AllIncomingOffers recipientFirebaseUid={authUser.id} />
    </div>
  );
}