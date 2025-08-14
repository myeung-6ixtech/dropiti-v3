import { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { offersAPI } from '@/lib/api-client';

interface IncomingOfferCardActionsProps {
  offer: {
    id: string;
    offerStatus: string;
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
  };
  onAcceptOffer?: (offerId: string) => void;
  onRejectOffer?: (offerId: string) => void;
  onCounterOffer?: (offerId: string) => void;
  onViewCounterOffer?: (offer: { id: string; offerStatus: string; lastActionType?: string; negotiationRound?: number; currentRentPrice?: number; currentRentPriceCurrency?: string; currentNumLeasingMonths?: number; currentPaymentFrequency?: string; currentMoveInDate?: string; proposingRentPrice: number; proposingRentPriceCurrency: string; numLeasingMonths: number; moveInDate: string; paymentFrequency: string; }) => void;
  respondingToCounter?: boolean;
  currentUserId: string;
  onOfferStatusChange?: () => void;
}

export default function IncomingOfferCardActions({
  offer,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  respondingToCounter = false,
  currentUserId,
  onOfferStatusChange
}: IncomingOfferCardActionsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'HKD') => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

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

  // For incoming offers (landlord perspective)
  if (offer.offerStatus === 'pending') {
    if (offer.lastActionType === 'RECIPIENT_COUNTERED') {
      // Landlord has countered, waiting for tenant response
      return (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 font-medium">Pending Counter Offer</p>
            <p className="text-sm text-gray-500 mt-1">Waiting for tenant's response</p>
          </div>
        </div>
      );
    } else if (offer.negotiationRound && offer.negotiationRound >= 1) {
      // Landlord has already countered and cannot counter again
      return (
        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 font-medium">Counter Offer Already Made</p>
              <p className="text-sm text-yellow-600 mt-1">You have already made a counter offer for this property</p>
            </div>
            <div className="flex space-x-3">
              {onAcceptOffer && (
                <button
                  onClick={handleAcceptOffer}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
                  disabled={isAccepting || respondingToCounter}
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Accept
                </button>
              )}
              {onRejectOffer && (
                <button
                  onClick={handleRejectOffer}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                  disabled={isRejecting || respondingToCounter}
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      // First time - show Accept/Reject/Counter buttons
      return (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex space-x-3">
            {onAcceptOffer && (
              <button
                onClick={handleAcceptOffer}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Accept
              </button>
            )}
            {onRejectOffer && (
              <button
                onClick={handleRejectOffer}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Reject
              </button>
            )}
            {onCounterOffer && (
              <button
                onClick={() => onCounterOffer(offer.id)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Counter
              </button>
            )}
          </div>
        </div>
      );
    }
  }

  if (offer.offerStatus === 'countered') {
    if (offer.lastActionType === 'RECIPIENT_COUNTERED') {
      // Show counter offer details and Accept/Reject buttons when landlord has countered
      return (
        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-4">
            {/* Counter Offer Details */}
            {offer.negotiationRound === 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-3 text-sm">Your Counter Offer Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-blue-700">
                      <span className="font-medium">Counter:</span> {formatCurrency(offer.currentRentPrice || offer.proposingRentPrice, offer.currentRentPriceCurrency || offer.proposingRentPriceCurrency || 'HKD')}/month
                    </div>
                    <div className="flex items-center text-sm text-blue-700">
                      <span className="font-medium">Lease:</span> {offer.currentNumLeasingMonths || offer.numLeasingMonths} month{(offer.currentNumLeasingMonths || offer.numLeasingMonths) !== 1 ? 's' : ''} lease
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-blue-700">
                      <span className="font-medium">Move-in:</span> {formatDate(offer.currentMoveInDate || offer.moveInDate)}
                    </div>
                    <div className="text-sm text-blue-700">
                      <span className="font-medium">Payment:</span> {offer.currentPaymentFrequency || offer.paymentFrequency}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    <span className="font-medium">Note:</span> This is your counter offer. You cannot make another counter offer at this stage.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // Show Accept/Reject buttons and View Counter Offer button for other countered offers
      return (
        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex space-x-3">
              {onAcceptOffer && (
                <button
                  onClick={handleAcceptOffer}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Accept
                </button>
              )}
              {onRejectOffer && (
                <button
                  onClick={handleRejectOffer}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // No actions for other statuses
  return null;
}
