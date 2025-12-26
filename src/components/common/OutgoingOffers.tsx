'use client';

import { useState, useEffect } from 'react';
import { offersAPI } from '@/lib/api-client';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import OfferCard from '@/components/common/OfferCard';
import { EmptyState } from '@/components/common/EmptyState';
import Toast from '@/components/ui/Toast';
import { Offer } from '@/types/offer';



interface OutgoingOffersProps {
  initiatorFirebaseUid: string;
  title?: string;
  showPropertyInfo?: boolean;
}

export default function OutgoingOffers({ 
  initiatorFirebaseUid, 
  title = "Your Applications",
  showPropertyInfo = true 
}: OutgoingOffersProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState({
    message: '',
    type: 'error' as 'error' | 'success' | 'info' | 'warning',
    isVisible: false
  });

  const showToast = (message: string, type: 'error' | 'success' | 'info' | 'warning' = 'error') => {
    setToast({
      message,
      type,
      isVisible: true
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Fetch offers created by the initiator (logged-in user)
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
                
        const response = await offersAPI.getOffersByInitiator(initiatorFirebaseUid);

        if (response.success && response.data) {
          setOffers(response.data);
          console.log('Outgoing offers fetched successfully:', response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch offers');
        }
      } catch (err) {
        console.error('Error fetching outgoing offers:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch offers';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (initiatorFirebaseUid) {
      fetchOffers();
    }
  }, [initiatorFirebaseUid]);

  if (loading) {
    return <CenteredLoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Applications</h3>
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
        icon="📝"
        title="No Applications Yet"
        description="You haven't submitted any rental applications yet. Start by browsing available properties and submitting your first application."
        actionText="Browse Properties"
        actionHref="/search"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-1">
          {offers.length} application{offers.length !== 1 ? 's' : ''} submitted
        </p>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            showPropertyInfo={showPropertyInfo}

            onWithdrawOffer={() => {
              // Handle withdrawing offer
              setOffers(prev => 
                prev.map(o => 
                  o.id === offer.id 
                    ? { ...o, offerStatus: 'withdrawn' }
                    : o
                )
              );
              // TODO: Make API call to withdraw the offer
              console.log('Withdrawing offer:', offer.id);
            }}
            currentUserId={initiatorFirebaseUid}
            onOfferStatusChange={() => {
              // Refresh the offers list when an offer status changes
              if (initiatorFirebaseUid) {
                offersAPI.getOffersByInitiator(initiatorFirebaseUid)
                  .then(response => {
                    if (response.success && response.data) {
                      setOffers(response.data);
                    }
                  })
                  .catch(err => {
                    console.error('Error refreshing offers:', err);
                  });
              }
            }}
            onCounterOffer={(offerId: string) => {
              // Handle counter offer - open modal or navigate to counter offer form
              console.log('Counter offer requested for:', offerId);
              // TODO: Implement counter offer modal/form
            }}
            onAcceptOffer={async (offerId: string) => {
              try {
                const response = await offersAPI.acceptOffer(offerId, initiatorFirebaseUid);
                if (response.success) {
                  showToast('Offer accepted successfully!', 'success');
                  // Refresh offers list
                  const refreshResponse = await offersAPI.getOffersByInitiator(initiatorFirebaseUid);
                  if (refreshResponse.success && refreshResponse.data) {
                    setOffers(refreshResponse.data);
                  }
                } else {
                  showToast('Failed to accept offer', 'error');
                }
              } catch (error) {
                console.error('Error accepting offer:', error);
                showToast('Error accepting offer', 'error');
              }
            }}
            onRejectOffer={async (offerId: string) => {
              try {
                const response = await offersAPI.rejectOffer(offerId, initiatorFirebaseUid);
                if (response.success) {
                  showToast('Offer rejected successfully!', 'success');
                  // Refresh offers list
                  const refreshResponse = await offersAPI.getOffersByInitiator(initiatorFirebaseUid);
                  if (refreshResponse.success && refreshResponse.data) {
                    setOffers(refreshResponse.data);
                  }
                } else {
                  showToast('Failed to reject offer', 'error');
                }
              } catch (error) {
                console.error('Error rejecting offer:', error);
                showToast('Error rejecting offer', 'error');
              }
            }}

          />
        ))}
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}