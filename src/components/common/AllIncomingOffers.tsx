'use client';

import { useState, useEffect } from 'react';
import { offersAPI } from '@/lib/api-client';
import { enhanceOffersWithProperty } from '@/lib/enhance-offers-list';
import { useLanguage } from '@/context/LanguageContext';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import OfferCard from '@/components/common/OfferCard';
import CreateOfferModal from '@/components/common/CreateOfferModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Offer } from '@/types/offer';
import MobileTabs from '@/components/common/MobileTabs';
interface AllIncomingOffersProps {
  recipientUserId: string;
}

interface OfferWithProperty extends Offer {
  propertyTitle?: string;
  propertyLocation?: string;
  propertyImage?: string;
}

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

interface PropertyGroup {
  propertyTitle: string;
  propertyLocation: string;
  propertyImage?: string;
  offers: OfferWithProperty[];
}

export default function AllIncomingOffers({ recipientUserId }: AllIncomingOffersProps) {
  const { t } = useLanguage();
  const [offers, setOffers] = useState<OfferWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCounterOfferModalOpen, setIsCounterOfferModalOpen] = useState(false);
  const [selectedOfferForCounter, setSelectedOfferForCounter] = useState<OfferWithProperty | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');

  // Fetch all offers for the recipient (landlord)
  useEffect(() => {
    const fetchAllOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all offers without property filter to get offers from all properties
        const response = await offersAPI.getOffersByRecipient(recipientUserId);

        if (response.success && response.data) {
          if (response.data.length === 0) {
            setOffers([]);
            return;
          }

          setOffers(await enhanceOffersWithProperty(response.data));
        } else {
          throw new Error(response.error || 'Failed to fetch offers');
        }
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch offers');
      } finally {
        setLoading(false);
      }
    };

    if (recipientUserId) {
      fetchAllOffers();
    }
  }, [recipientUserId]);

  // Filter offers based on status - combine pending, tentatively_accepted, and countered into "pending"
  const filteredOffers = offers.filter(offer => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') {
      return ['pending', 'tentatively_accepted', 'countered'].includes(offer.offerStatus);
    }
    return offer.offerStatus === filterStatus;
  });

  // Group offers by property for better organization
  const groupedOffers = filteredOffers.reduce((acc, offer) => {
    const propertyKey = offer.propertyUuid;
    if (!acc[propertyKey]) {
      acc[propertyKey] = {
        propertyTitle: offer.property?.title || offer.propertyTitle || 'Unknown Property',
        propertyLocation: offer.property?.location || offer.propertyLocation || 'Unknown Location',
        propertyImage: offer.property?.imageUrl || offer.propertyImage,
        offers: []
      };
    }
    acc[propertyKey].offers.push(offer);
    return acc;
  }, {} as Record<string, PropertyGroup>);

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const response = await offersAPI.acceptOffer(offerId, recipientUserId);
      if (response.success) {
        setOffers(prev => 
          prev.map(offer => 
            offer.id === offerId 
              ? { ...offer, offerStatus: 'accepted' }
              : offer
          )
        );
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      const response = await offersAPI.rejectOffer(offerId, recipientUserId);
      if (response.success) {
        setOffers(prev => 
          prev.map(offer => 
            offer.id === offerId 
              ? { ...offer, offerStatus: 'rejected' }
              : offer
          )
        );
      }
    } catch (error) {
      console.error('Error rejecting offer:', error);
    }
  };

  const handleCounterOffer = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      setSelectedOfferForCounter(offer);
      setIsCounterOfferModalOpen(true);
    }
  };

  const handleCounterOfferSubmit = async (offerData: {
    rentalPrice: number;
    leaseDuration: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
    moveInDate: string;
  }) => {
    if (!selectedOfferForCounter) return;
    
    try {
      const response = await offersAPI.counterOffer(
        selectedOfferForCounter.id,
        recipientUserId,
        {
          rentPrice: offerData.rentalPrice,
          numLeasingMonths: offerData.leaseDuration,
          paymentFrequency: offerData.paymentFrequency,
          moveInDate: offerData.moveInDate
        }
      );

      if (response.success) {
        setOffers(prev => 
          prev.map(offer => 
            offer.id === selectedOfferForCounter.id 
              ? { ...offer, offerStatus: 'countered' }
              : offer
          )
        );
        
        setIsCounterOfferModalOpen(false);
        setSelectedOfferForCounter(null);
      }
    } catch (error) {
      console.error('Error submitting counter offer:', error);
    }
  };

  const getStatusCounts = () => {
    const pendingCount = offers.filter(o => 
      ['pending', 'tentatively_accepted', 'countered'].includes(o.offerStatus)
    ).length;
    
    return {
      all: offers.length,
      pending: pendingCount,
      accepted: offers.filter(o => o.offerStatus === 'accepted').length,
      rejected: offers.filter(o => o.offerStatus === 'rejected').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return <CenteredLoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Offers</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <EmptyState
        icon="📬"
        title={t('offers.noOffersYet')}
        description={t('offers.noOffersDescription')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile Tabs */}
      <MobileTabs
        tabs={[
          { id: 'pending', name: t('offers.pendingOffers'), count: statusCounts.pending },
          { id: 'accepted', name: t('offers.acceptedOffers'), count: statusCounts.accepted },
          { id: 'rejected', name: t('offers.rejectedOffers'), count: statusCounts.rejected },
          { id: 'all', name: t('offers.allOffers'), count: statusCounts.all },
        ]}
        activeTab={filterStatus}
        onTabChange={(tabId) => setFilterStatus(tabId as FilterStatus)}
      />

      {/* Desktop Tabs */}

      <div className="desktop-tabs border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'pending', label: t('offers.pendingOffers'), count: statusCounts.pending },
            { key: 'accepted', label: t('offers.acceptedOffers'), count: statusCounts.accepted },
            { key: 'rejected', label: t('offers.rejectedOffers'), count: statusCounts.rejected },
            { key: 'all', label: t('offers.allOffers'), count: statusCounts.all },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key as FilterStatus)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filterStatus === key
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </nav>
      </div>

      {/* Offers by Property */}
      <div className="space-y-8">
        {Object.keys(groupedOffers).length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filterStatus === 'pending' && t('offers.noPendingOffers')}
              {filterStatus === 'accepted' && t('offers.noAcceptedOffers')}
              {filterStatus === 'rejected' && t('offers.noRejectedOffers')}
              {filterStatus === 'all' && t('offers.noAllOffers')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus === 'pending' && t('offers.noPendingOffersDescription')}
              {filterStatus === 'accepted' && t('offers.noAcceptedOffersDescription')}
              {filterStatus === 'rejected' && t('offers.noRejectedOffersDescription')}
              {filterStatus === 'all' && t('offers.noAllOffersDescription')}
            </p>
          </div>
        ) : (
          Object.entries(groupedOffers).map(([propertyUuid, propertyGroup]) => (
            <div key={propertyUuid} className="space-y-4">
              {/* Offers for this Property */}
              <div className="space-y-4">
                {propertyGroup.offers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    showPropertyInfo={true} // Now show property info in individual cards
                    isIncomingOffer={true}
                    onAcceptOffer={handleAcceptOffer}
                    onRejectOffer={handleRejectOffer}
                    onCounterOffer={handleCounterOffer}
                    currentUserId={recipientUserId}
                    onOfferStatusChange={() => {
                      // Refresh offers when status changes
                      window.location.reload();
                    }}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Counter Offer Modal */}
      {selectedOfferForCounter && (
        <CreateOfferModal
          isOpen={isCounterOfferModalOpen}
          onClose={() => {
            setIsCounterOfferModalOpen(false);
            setSelectedOfferForCounter(null);
          }}
          propertyId={selectedOfferForCounter.propertyUuid}
          currentPrice={selectedOfferForCounter.proposingRentPrice}
          mode="counter"
          offerId={selectedOfferForCounter.id}
          existingOffer={{
            rentalPrice: selectedOfferForCounter.proposingRentPrice,
            leaseDuration: selectedOfferForCounter.numLeasingMonths,
            paymentFrequency: selectedOfferForCounter.paymentFrequency as 'monthly' | 'quarterly' | 'yearly',
            moveInDate: selectedOfferForCounter.moveInDate
          }}
          onOfferSubmit={handleCounterOfferSubmit}
        />
      )}
    </div>
  );
}