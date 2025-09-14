'use client';

import { useState, useEffect } from 'react';
import { offersAPI } from '@/lib/api-client';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import OfferCard from '@/components/common/OfferCard';
import EmptyState from '@/components/common/EmptyState';
import Toast from '@/components/ui/Toast';
import { Offer } from '@/types/offer';

interface AllOutgoingOffersProps {
  initiatorFirebaseUid: string;
  showPropertyInfo?: boolean;
}

type FilterStatus = 'all' | 'pending' | 'countered' | 'accepted' | 'rejected' | 'withdrawn';

export default function AllOutgoingOffers({ 
  initiatorFirebaseUid, 
  showPropertyInfo = true 
}: AllOutgoingOffersProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

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
        } else {
          throw new Error(response.error || 'Failed to fetch applications');
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    if (initiatorFirebaseUid) {
      fetchOffers();
    }
  }, [initiatorFirebaseUid]);

  // Filter offers based on status
  const filteredOffers = offers.filter(offer => {
    if (filterStatus === 'all') return true;
    return offer.offerStatus === filterStatus;
  });

  const handleWithdrawOffer = async (offerId: string) => {
    try {
      const response = await offersAPI.withdrawOffer(offerId, initiatorFirebaseUid);
      if (response.success) {
        setOffers(prev => 
          prev.map(offer => 
            offer.id === offerId 
              ? { ...offer, offerStatus: 'withdrawn' }
              : offer
          )
        );
        showToast('Application withdrawn successfully', 'success');
      } else {
        showToast(response.error || 'Failed to withdraw application', 'error');
      }
    } catch (error) {
      console.error('Error withdrawing offer:', error);
      showToast('Failed to withdraw application', 'error');
    }
  };

  const getStatusCounts = () => {
    return {
      all: offers.length,
      pending: offers.filter(o => o.offerStatus === 'pending').length,
      countered: offers.filter(o => o.offerStatus === 'countered').length,
      accepted: offers.filter(o => o.offerStatus === 'accepted').length,
      rejected: offers.filter(o => o.offerStatus === 'rejected').length,
      withdrawn: offers.filter(o => o.offerStatus === 'withdrawn').length,
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
      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Applications', count: statusCounts.all },
            { key: 'pending', label: 'Pending', count: statusCounts.pending },
            { key: 'countered', label: 'Countered', count: statusCounts.countered },
            { key: 'accepted', label: 'Accepted', count: statusCounts.accepted },
            { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
            { key: 'withdrawn', label: 'Withdrawn', count: statusCounts.withdrawn },
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

      {/* Applications List */}
      <div className="space-y-4">
        {filteredOffers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            showPropertyInfo={showPropertyInfo}
            isIncomingOffer={false}
            onWithdrawOffer={handleWithdrawOffer}
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
          />
        ))}
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
