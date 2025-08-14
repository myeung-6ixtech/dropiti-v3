import { useState } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { offersAPI } from '@/lib/api-client';
import FinalCounterOfferModal2 from './FinalCounterOfferModal2';

interface OutgoingOfferCardActionsProps {
  offer: {
    id: string;
    offerStatus: string;
    propertyUuid: string;
    lastActionType?: string;
    negotiationRound?: number;
    currentRentPrice?: number;
    currentRentPriceCurrency?: string;
    currentNumLeasingMonths?: number;
    currentPaymentFrequency?: string;
    currentMoveInDate?: string;
    proposingRentPrice: number;
    proposingRentPriceCurrency: string;
    numLeasingMonths: number;
    moveInDate: string;
    paymentFrequency: string;
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
  };
  onWithdrawOffer?: (offerId: string) => void;
  currentUserId: string;
  onOfferStatusChange?: () => void;
  finalCounterSubmitted?: boolean;
}

export default function OutgoingOfferCardActions({
  offer,
  onWithdrawOffer,
  currentUserId,
  onOfferStatusChange,
  finalCounterSubmitted = false
}: OutgoingOfferCardActionsProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isFinalCounterModalOpen, setIsFinalCounterModalOpen] = useState(false);
  const [isSubmittingFinalCounter, setIsSubmittingFinalCounter] = useState(false);

  const handleWithdrawOffer = async () => {
    setIsWithdrawing(true);
    try {
      await offersAPI.withdrawOffer(offer.id, currentUserId);
      onOfferStatusChange?.();
    } catch (error) {
      console.error('Error withdrawing offer:', error);
      // Optionally show an error message to the user
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleAcceptOffer = async () => {
    setIsAccepting(true);
    try {
      await offersAPI.acceptOffer(offer.id, currentUserId);
      onOfferStatusChange?.();
    } catch (error) {
      console.error('Error accepting offer:', error);
      // Optionally show an error message to the user
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
      // Optionally show an error message to the user
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

  // For outgoing offers (tenant perspective), only show actions for pending offers
  if (offer.offerStatus === 'pending') {
    return (
      <div className="pt-4 border-t border-gray-200">
        <div className="flex space-x-3">
          {onWithdrawOffer && (
            <button
              onClick={handleWithdrawOffer}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
              disabled={isWithdrawing}
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
            </button>
          )}
          {offer.property && (
            <Link
              href={`/property/${offer.propertyUuid}`}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors flex items-center justify-center"
            >
              <span>View Property</span>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // For countered offers, show Accept, Final Counter Offer, and Reject buttons
  if (offer.offerStatus === 'countered') {
    if (offer.lastActionType === 'RECIPIENT_COUNTERED') {
      if (offer.negotiationRound === 1) {
        return (
          <>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={handleAcceptOffer}
                  disabled={isAccepting}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {isAccepting ? 'Accepting...' : 'Accept Offer'}
                </button>
                
                {!finalCounterSubmitted && (
                  <button
                    onClick={() => setIsFinalCounterModalOpen(true)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center"
                  >
                    Final Counter Offer
                  </button>
                )}
                
                <button
                  onClick={handleRejectOffer}
                  disabled={isRejecting}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  {isRejecting ? 'Rejecting...' : 'Reject Offer'}
                </button>
              </div>
            </div>

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
    }
  }

  // No actions for other statuses
  return null;
}
