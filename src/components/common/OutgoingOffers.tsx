'use client';

import { useState, useEffect } from 'react';
import { offersAPI } from '@/lib/api-client';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import CounterOfferModal from './CounterOfferModal';
import FinalCounterOfferModal from './FinalCounterOfferModal';
import OfferCard from './OfferCard';
import Toast from '@/components/ui/Toast';

interface Offer {
  id: string;
  offerKey: string;
  propertyUuid: string;
  initiatorFirebaseUid: string;
  recipientFirebaseUid: string;
  proposingRentPrice: number;
  proposingRentPriceCurrency: string;
  numLeasingMonths: number;
  paymentFrequency: string;
  moveInDate: string;
  offerStatus: string;
  isActive: boolean;
  createdAt: string;
  // Recipient (landlord) details
  recipient?: {
    uuid: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    photoUrl: string;
  } | null;
  // Property details
  property?: {
    title: string;
    location: string;
    rentalPrice: number;
    rentalPriceCurrency: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    imageUrl: string;
  } | null;
  // For counter offer details
  currentRentPrice?: number;
  currentRentPriceCurrency?: string;
  currentNumLeasingMonths?: number;
  currentPaymentFrequency?: string;
  currentMoveInDate?: string;
  // Negotiation fields
  negotiationRound?: number;
  lastActionBy?: 'initiator' | 'recipient';
  lastActionType?: string;
  lastActionAt?: string;
}

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
  
  // Counter offer modal state
  const [selectedCounterOffer, setSelectedCounterOffer] = useState<Offer | null>(null);
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [loadingCounterDetails, setLoadingCounterDetails] = useState(false);
  
  // Final counter offer modal state
  const [showFinalCounterModal, setShowFinalCounterModal] = useState(false);
  
  // Track submitted final counters
  const [finalCounterSubmitted, setFinalCounterSubmitted] = useState<Set<string>>(new Set());
  
  // Loading states
  const [respondingToCounter, setRespondingToCounter] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | 'info' | 'warning';
    isVisible: boolean;
  }>({
    message: '',
    type: 'error',
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
        
        console.log('Fetching offers by initiator:', initiatorFirebaseUid);
        
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

  // Handle viewing counter offer
  const handleViewCounterOffer = async (offer: Offer) => {
    setSelectedCounterOffer(offer);
    setShowCounterOfferModal(true);
    setLoadingCounterDetails(true);

    try {
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error setting up counter offer view:', error);
      setError('Failed to load counter offer view');
    } finally {
      setLoadingCounterDetails(false);
    }
  };

  // Handle final counter offer
  const handleFinalCounterOffer = () => {
    setShowFinalCounterModal(true);
  };

  // Handle submitting final counter offer
  const handleSubmitFinalCounterOffer = async (counterData: {
    rentalPrice: number;
    leaseDuration: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
    moveInDate: string;
    currency?: string;
    message?: string;
  }) => {
    if (!selectedCounterOffer) return;

    setRespondingToCounter(true);
    try {
      // Debug: Log what we're sending
      const apiPayload = {
        rentPrice: counterData.rentalPrice,
        numLeasingMonths: counterData.leaseDuration,
        paymentFrequency: counterData.paymentFrequency,
        moveInDate: counterData.moveInDate,
        message: counterData.message
      };
      
      console.log('Submitting final counter offer with payload:', apiPayload);
      console.log('Selected counter offer:', selectedCounterOffer);

      // Call the counter-offer API
      const response = await offersAPI.counterOffer(
        selectedCounterOffer.id,
        initiatorFirebaseUid, // Send the actual Firebase UID
        apiPayload
      );

      if (response.success) {
        // Close modals and refresh offers
        setShowFinalCounterModal(false);
        setShowCounterOfferModal(false);
        setSelectedCounterOffer(null);
        
        // Mark this offer as having a final counter submitted
        if (selectedCounterOffer) {
          setFinalCounterSubmitted(prev => new Set(prev).add(selectedCounterOffer.id));
        }
        
        // Show success toast
        showToast('Final counter offer submitted successfully!', 'success');
        
        // Refresh the offers list
        setOffers([]);
        setLoading(true);
        try {
          const refreshResponse = await offersAPI.getOffersByInitiator(initiatorFirebaseUid);
          if (refreshResponse.success && refreshResponse.data) {
            setOffers(refreshResponse.data);
          }
        } catch (refreshError) {
          console.error('Error refreshing offers:', refreshError);
          showToast('Counter offer submitted but failed to refresh list', 'warning');
        }
        setError(null);
      } else {
        const errorMessage = response.error || 'Failed to submit counter offer';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error submitting final counter offer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit counter offer';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setRespondingToCounter(false);
    }
  };

  // Handle withdrawing offer
  const handleWithdrawOffer = (offerId: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, offerStatus: 'withdrawn' }
          : offer
      )
    );
    // TODO: Make API call to withdraw the offer
    console.log('Withdrawing offer:', offerId);
  };

  // Handle accepting counter offer
  const handleAcceptCounterOffer = async (offerId: string) => {
    if (!selectedCounterOffer) return;
    
    try {
      setRespondingToCounter(true);
      
      // Call the accept offer API
      const response = await offersAPI.acceptOffer(offerId, initiatorFirebaseUid);
      
      if (response.success) {
        showToast('Counter offer accepted successfully!', 'success');
        
        // Close modals and refresh offers
        setShowCounterOfferModal(false);
        setSelectedCounterOffer(null);
        
        // Refresh the offers list
        const refreshResponse = await offersAPI.getOffersByInitiator(initiatorFirebaseUid);
        if (refreshResponse.success && refreshResponse.data) {
          setOffers(refreshResponse.data);
        }
      } else {
        const errorMessage = response.error || 'Failed to accept counter offer';
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error accepting counter offer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept counter offer';
      showToast(errorMessage, 'error');
    } finally {
      setRespondingToCounter(false);
    }
  };

  // Handle rejecting counter offer
  const handleRejectCounterOffer = async (offerId: string) => {
    if (!selectedCounterOffer) return;
    
    try {
      setRespondingToCounter(true);
      
      // Call the reject offer API
      const response = await offersAPI.rejectOffer(offerId, initiatorFirebaseUid);
      
      if (response.success) {
        showToast('Counter offer rejected successfully!', 'success');
        
        // Close modals and refresh offers
        setShowCounterOfferModal(false);
        setSelectedCounterOffer(null);
        
        // Refresh the offers list
        const refreshResponse = await offersAPI.getOffersByInitiator(initiatorFirebaseUid);
        if (refreshResponse.success && refreshResponse.data) {
          setOffers(refreshResponse.data);
        }
      } else {
        const errorMessage = response.error || 'Failed to reject counter offer';
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error rejecting counter offer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject counter offer';
      showToast(errorMessage, 'error');
    } finally {
      setRespondingToCounter(false);
    }
  };

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
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <div className="text-gray-400 mb-4">
            <div className="mx-auto h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Applications Yet</h3>
          <p className="text-gray-600 mb-4">
            You haven't submitted any rental applications yet.
          </p>
          <a
            href="/search"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Properties
          </a>
        </div>
      </div>
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
            finalCounterSubmitted={finalCounterSubmitted.has(offer.id)}
            onViewCounterOffer={handleViewCounterOffer}
            onWithdrawOffer={handleWithdrawOffer}
          />
        ))}
      </div>

      {/* Counter Offer Modal */}
      <CounterOfferModal
        isOpen={showCounterOfferModal}
        onClose={() => setShowCounterOfferModal(false)}
        offer={selectedCounterOffer}
        loading={loadingCounterDetails}
        responding={respondingToCounter}
        finalCounterSubmitted={selectedCounterOffer ? finalCounterSubmitted.has(selectedCounterOffer.id) : false}
        onAccept={handleAcceptCounterOffer}
        onFinalCounter={handleFinalCounterOffer}
        onReject={handleRejectCounterOffer}
        isIncomingOffer={false}
      />

      {/* Final Counter Offer Modal */}
      <FinalCounterOfferModal
        isOpen={showFinalCounterModal}
        onClose={() => setShowFinalCounterModal(false)}
        onSubmit={handleSubmitFinalCounterOffer}
        offer={selectedCounterOffer}
        loading={respondingToCounter}
      />

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