'use client';

import { useState } from 'react';
import { Offer } from '@/types/offer';
import { offersAPI } from '@/lib/api-client';
import FinalCounterOfferModal2 from './FinalCounterOfferModal2';

interface OutgoingOfferCardStatusProps {
  offer: Offer;
  currentUserId: string;
  onOfferStatusChange?: () => void;
}

export default function OutgoingOfferCardStatus({
  offer,
  currentUserId,
  onOfferStatusChange
}: OutgoingOfferCardStatusProps) {
  const [isFinalCounterModalOpen, setIsFinalCounterModalOpen] = useState(false);
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
      <>
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <h4 className="text-green-900 text-sm font-semibold mb-3">
          Final Accepted Terms
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-green-800 text-sm font-semibold">Monthly Rent:</span>
                <span className="text-green-800 text-sm font-medium">
                  {formatCurrency(
                    offer.finalRentPrice || offer.proposingRentPrice, 
                    offer.finalRentPriceCurrency || offer.proposingRentPriceCurrency || 'HKD'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-800 text-sm font-semibold">Lease Duration:</span>
                <span className="text-green-800 text-sm font-medium">
                  {offer.finalNumLeasingMonths || offer.numLeasingMonths} month{(offer.finalNumLeasingMonths || offer.numLeasingMonths) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
              <span className="text-green-800 text-sm font-semibold">Payment Frequency:</span>
                <span className="text-green-800 text-sm font-medium">
                  {offer.finalPaymentFrequency || offer.paymentFrequency}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-green-800 text-sm font-semibold">Move-in Date:</span>
                <span className="text-green-800 text-sm font-medium">
                  {formatDate(offer.finalMoveInDate || offer.moveInDate)}
                </span>
              </div>
            </div>
        </div>
      </div>
       <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-green-800 text-sm font-medium">
          🎉 Great news! The landlord accepted your offer
        </p>
        <p className="text-green-700 text-xs mt-1">
          Contact the landlord to proceed with the rental agreement
        </p>
      </div>
      </>
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
              <p className="text-blue-700 text-xs mt-1">
                Review the terms and decide whether to accept, reject, or counter
              </p>             
            </div>
          </div>
        );
      }
    } else if (offer.lastActionType === 'INITIATOR_COUNTERED') {
      if (offer.negotiationRound === 2) {
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
