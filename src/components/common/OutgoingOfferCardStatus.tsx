'use client';

import { useState } from 'react';
import { Offer } from '@/types/offer';
import { offersAPI } from '@/lib/api-client';
import FinalCounterOfferModal2 from './FinalCounterOfferModal2';

interface OutgoingOfferCardStatusProps {
  offer: Offer;
  finalCounterSubmitted?: boolean;
  currentUserId: string;
  onOfferStatusChange?: () => void;
  onCounterOffer?: (offerId: string) => void;
}

export default function OutgoingOfferCardStatus({
  offer,
  finalCounterSubmitted = false,
  currentUserId,
  onOfferStatusChange,
  onCounterOffer
}: OutgoingOfferCardStatusProps) {
  const [isFinalCounterModalOpen, setIsFinalCounterModalOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSubmittingFinalCounter, setIsSubmittingFinalCounter] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAcceptOffer = async () => {
    setIsAccepting(true);
    try {
      await offersAPI.acceptOffer(offer.id, currentUserId);
      onOfferStatusChange?.();
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('Failed to accept offer. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectOffer = async () => {
    setIsRejecting(true);
    try {
      await offersAPI.rejectOffer(offer.id, currentUserId);
      onOfferStatusChange?.();
    } catch (error) {
      console.error('Error rejecting offer:', error);
      alert('Failed to reject offer. Please try again.');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleFinalCounterOffer = async (counterData: {
    rentalPrice: number;
    leaseDuration: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
    moveInDate: string;
    message?: string;
  }) => {
    setIsSubmittingFinalCounter(true);
    try {
      await offersAPI.counterOffer(offer.id, currentUserId, {
        rentPrice: counterData.rentalPrice,
        numLeasingMonths: counterData.leaseDuration,
        paymentFrequency: counterData.paymentFrequency,
        moveInDate: counterData.moveInDate,
        message: counterData.message
      });
      onOfferStatusChange?.();
      setIsFinalCounterModalOpen(false);
    } catch (error) {
      console.error('Error submitting final counter offer:', error);
      alert('Failed to submit final counter offer. Please try again.');
    } finally {
      setIsSubmittingFinalCounter(false);
    }
  };

  // For outgoing offers (tenant perspective)
  if (offer.offerStatus === 'accepted') {
    return (
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-green-800 text-sm font-medium">
          🎉 Great news! The landlord accepted your offer
        </p>
        <p className="text-green-700 text-xs mt-1">
          Contact the landlord to proceed with the rental agreement
        </p>
      </div>
    );
  }

  if (offer.offerStatus === 'rejected') {
    return (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800 text-sm font-medium">
          😔 The landlord rejected your offer
        </p>
        <p className="text-red-700 text-xs mt-1">
          You can search for other properties or try a different offer
        </p>
      </div>
    );
  }

  if (offer.offerStatus === 'withdrawn') {
    return (
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-gray-800 text-sm font-medium">
          You withdrew this offer
        </p>
      </div>
    );
  }

  if (offer.offerStatus === 'countered') {
    if (offer.lastActionType === 'RECIPIENT_COUNTERED') {
      if (offer.negotiationRound === 1) {
        return (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm font-medium">
                  The landlord sent you a counter offer
              </p>     
              {/* Counter Offer Details */}
              <div className="mt-3 p-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-blue-800">Rent:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {offer.currentRentPrice ? formatCurrency(offer.currentRentPrice, offer.currentRentPriceCurrency || 'USD') : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-800">Lease Duration:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {offer.currentNumLeasingMonths ? `${offer.currentNumLeasingMonths} months` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-800">Move-in Date:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {offer.currentMoveInDate ? formatDate(offer.currentMoveInDate) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-800">Payment Frequency:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {offer.currentPaymentFrequency ? offer.currentPaymentFrequency : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-blue-700 text-xs mt-1">
                Review the terms and decide whether to accept, reject, or counter
              </p>             
            </div>
          </div>
        );
      }
    } else if (offer.lastActionType === 'INITIATOR_COUNTERED') {
      if (offer.negotiationRound === 1) {
        if (finalCounterSubmitted) {
          return (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm font-medium">
                🔄 You sent a final counter offer to the landlord
              </p>
              <p className="text-yellow-700 text-xs mt-1">
                Waiting for landlord's final decision...
              </p>
            </div>
          );
        } else {
          return (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-orange-800 text-sm font-medium">
                ⚠️ This is your final chance to counter
              </p>
              <p className="text-orange-700 text-xs mt-1">
                You can send one more counter offer or wait for landlord's response
              </p>
              <button
                onClick={() => onCounterOffer?.(offer.id)}
                className="mt-2 w-full bg-orange-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                Send Final Counter Offer
              </button>
            </div>
          );
        }
      }
    }
  }

  // Default case for pending offers
  if (offer.offerStatus === 'pending') {
    return (
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-blue-800 text-sm font-medium">
          📋 Your offer is pending landlord review
        </p>
        <p className="text-blue-700 text-xs mt-1">
          The landlord will review your offer and respond soon
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Final Counter Offer Modal */}
      <FinalCounterOfferModal2
        isOpen={isFinalCounterModalOpen}
        onClose={() => setIsFinalCounterModalOpen(false)}
        offer={offer}
        onSubmit={handleFinalCounterOffer}
        loading={isSubmittingFinalCounter}
      />
    </>
  );
}
