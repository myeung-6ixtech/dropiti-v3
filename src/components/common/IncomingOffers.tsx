'use client';

import { useState, useEffect } from 'react';
import { offersAPI } from '@/lib/api-client';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import CreateOfferModal from '@/components/common/CreateOfferModal';
import CounterOfferModal from '@/components/common/CounterOfferModal';
import OfferCard from '@/components/common/OfferCard';
import { Offer } from '@/types/offer';



interface IncomingOffersProps {
  recipientFirebaseUid: string;
  propertyUuid?: string; // Optional: filter by specific property
  title?: string;
  showPropertyInfo?: boolean;
}

export default function IncomingOffers({ 
  recipientFirebaseUid, 
  propertyUuid, 
  title = "Incoming Offers",
  showPropertyInfo = true 
}: IncomingOffersProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCounterOfferModalOpen, setIsCounterOfferModalOpen] = useState(false);
  const [selectedOfferForCounter, setSelectedOfferForCounter] = useState<Offer | null>(null);
  const [isCounterOfferViewModalOpen, setIsCounterOfferViewModalOpen] = useState(false);
  const [selectedOfferForView, setSelectedOfferForView] = useState<Offer | null>(null);
  const [respondingToCounter, setRespondingToCounter] = useState(false);

  // Fetch offers for the recipient (landlord)
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await offersAPI.getOffersByRecipient(recipientFirebaseUid, propertyUuid);

        if (response.success && response.data) {
          setOffers(response.data);
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

    if (recipientFirebaseUid) {
      fetchOffers();
    }
  }, [recipientFirebaseUid, propertyUuid]);

  const handleAcceptOffer = (offerId: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, offerStatus: 'accepted' }
          : offer
      )
    );
    // TODO: Make API call to accept the offer
    console.log('Accepting offer:', offerId);
  };

  const handleRejectOffer = (offerId: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, offerStatus: 'rejected' }
          : offer
      )
    );
    // TODO: Make API call to reject the offer
    console.log('Rejecting offer:', offerId);
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
      // Call the counter offer API
      const response = await offersAPI.counterOffer(
        selectedOfferForCounter.id,
        recipientFirebaseUid, // Current user (landlord) is countering
        {
          rentPrice: offerData.rentalPrice,
          numLeasingMonths: offerData.leaseDuration,
          paymentFrequency: offerData.paymentFrequency,
          moveInDate: offerData.moveInDate
        }
      );

      if (response.success) {
        // Update the local state to reflect the counter offer
        setOffers(prev => 
          prev.map(offer => 
            offer.id === selectedOfferForCounter.id 
              ? { ...offer, offerStatus: 'countered' }
              : offer
          )
        );
        
        // Close the modal
        setIsCounterOfferModalOpen(false);
        setSelectedOfferForCounter(null);
        
        // Show success message (you can add a toast notification here)
        console.log('Counter offer submitted successfully');
      } else {
        console.error('Failed to submit counter offer:', response.error);
      }
    } catch (error) {
      console.error('Error submitting counter offer:', error);
    }
  };

  // Handle viewing counter offer details
  const handleViewCounterOffer = (offer: Offer) => {
    setSelectedOfferForView(offer);
    setIsCounterOfferViewModalOpen(true);
  };

  // Handle accepting counter offer
  const handleAcceptCounterOffer = async (offerId: string) => {
    try {
      setRespondingToCounter(true);
      
      // Call the accept offer API
      const response = await offersAPI.acceptOffer(offerId, recipientFirebaseUid);
      
      if (response.success) {
        // Close modal and refresh offers
        setIsCounterOfferViewModalOpen(false);
        setSelectedOfferForView(null);
        
        // Refresh the offers list
        const refreshResponse = await offersAPI.getOffersByRecipient(recipientFirebaseUid);
        if (refreshResponse.success && refreshResponse.data) {
          setOffers(refreshResponse.data);
        }
      } else {
        console.error('Failed to accept counter offer:', response.error);
      }
    } catch (error) {
      console.error('Error accepting counter offer:', error);
    } finally {
      setRespondingToCounter(false);
    }
  };

  // Handle rejecting counter offer
  const handleRejectCounterOffer = async (offerId: string) => {
    try {
      setRespondingToCounter(true);
      
      // Call the reject offer API
      const response = await offersAPI.rejectOffer(offerId, recipientFirebaseUid);
      
      if (response.success) {
        // Close modal and refresh offers
        setIsCounterOfferViewModalOpen(false);
        setSelectedOfferForView(null);
        
        // Refresh the offers list
        const refreshResponse = await offersAPI.getOffersByRecipient(recipientFirebaseUid);
        if (refreshResponse.success && refreshResponse.data) {
          setOffers(refreshResponse.data);
        }
      } else {
        console.error('Failed to reject counter offer:', response.error);
      }
    } catch (error) {
      console.error('Error rejecting counter offer:', error);
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
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Offers Yet</h3>
          <p className="text-gray-600 mb-4">
            {propertyUuid ? 'This property has no offers yet.' : 'You have no incoming offers yet.'}
          </p>
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
          {offers.length} offer{offers.length !== 1 ? 's' : ''} received
        </p>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            showPropertyInfo={showPropertyInfo}
            isIncomingOffer={true}
            onAcceptOffer={handleAcceptOffer}
            onRejectOffer={handleRejectOffer}
            onCounterOffer={handleCounterOffer}
            onViewCounterOfferDetails={handleViewCounterOffer}
            respondingToCounter={respondingToCounter}
            currentUserId={recipientFirebaseUid}
            onOfferStatusChange={() => {
              // Refresh the offers list when an offer status changes
              if (recipientFirebaseUid) {
                offersAPI.getOffersByRecipient(recipientFirebaseUid, propertyUuid)
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
          />
        ))}
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

      {/* Counter Offer View Modal */}
      {selectedOfferForView && (
        <CounterOfferModal
          isOpen={isCounterOfferViewModalOpen}
          onClose={() => {
            setIsCounterOfferViewModalOpen(false);
            setSelectedOfferForView(null);
          }}
          offer={selectedOfferForView}
          loading={false}
          responding={respondingToCounter}
          finalCounterSubmitted={false}
          onAccept={handleAcceptCounterOffer}
          onFinalCounter={() => {}} // Not applicable for incoming offers
          onReject={handleRejectCounterOffer}
          isIncomingOffer={true}
        />
      )}
    </div>
  );
}
