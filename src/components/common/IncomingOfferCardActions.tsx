import { useState } from 'react';
import { CheckIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { offersAPI } from '@/lib/api-client';
import { useToast } from '@/context/ToastContext';
import FinalDealDisplay from './FinalDealDisplay';

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
    finalRentPrice?: number;
    finalRentPriceCurrency?: string;
    finalNumLeasingMonths?: number;
    finalPaymentFrequency?: string;
    finalMoveInDate?: string;
  };
  onAcceptOffer?: (offerId: string) => void;
  onRejectOffer?: (offerId: string) => void;
  onCounterOffer?: (offerId: string) => void;
  currentUserId: string;
  onOfferStatusChange?: () => void;
}

export default function IncomingOfferCardActions({
  offer,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  currentUserId,
  onOfferStatusChange
}: IncomingOfferCardActionsProps) {
  const { showToast } = useToast();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  // Show final deal display if offer has been accepted
  if (isAccepted) {
    return <FinalDealDisplay offer={offer} />;
  }

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

  const handleAcceptOffer = async () => {
    setIsAccepting(true);
    try {
      const response = await offersAPI.acceptOffer(offer.id, currentUserId);
      
      // Determine the final accepted terms from the database final_* fields
      const finalTerms = {
        rentPrice: offer.finalRentPrice || offer.proposingRentPrice,
        currency: offer.finalRentPriceCurrency || offer.proposingRentPriceCurrency || 'HKD',
        leasingMonths: offer.finalNumLeasingMonths || offer.numLeasingMonths,
        paymentFrequency: offer.finalPaymentFrequency || offer.paymentFrequency,
        moveInDate: offer.finalMoveInDate || offer.moveInDate
      };

      // Handle different response types based on two-stage acceptance
      if (response.requiresConfirmation) {
        // Tenant tentative acceptance
        showToast('success', 'Offer tentatively accepted! Awaiting landlord confirmation.');
        setIsAccepted(true);
        onOfferStatusChange?.();
      } else if (response.isFinalized) {
        // Landlord confirmation - deal finalized
        const bulkRejection = response?.data?.bulkRejection;
        let message = '';

        if (bulkRejection && bulkRejection.rejectedOffersCount > 0) {
          // Show comprehensive message about acceptance and bulk rejection
          const baseMessage = offer.lastActionType === 'RECIPIENT_COUNTERED' 
            ? `Deal confirmed! Final terms: ${formatCurrency(finalTerms.rentPrice, finalTerms.currency)}/month, ${finalTerms.leasingMonths} months, ${finalTerms.paymentFrequency} payments, move-in ${formatDate(finalTerms.moveInDate)}`
            : 'Deal confirmed and finalized!';
          
          const rejectionMessage = ` ${bulkRejection.rejectedOffersCount} other pending offer${bulkRejection.rejectedOffersCount === 1 ? '' : 's'} automatically rejected.`;
          
          message = baseMessage + rejectionMessage;
          
          // Show additional info toast about bulk rejection
          showToast('info', `${bulkRejection.rejectedOffersCount} other offer${bulkRejection.rejectedOffersCount === 1 ? '' : 's'} automatically rejected for this property.`);
        } else {
          // Show standard success message
          message = offer.lastActionType === 'RECIPIENT_COUNTERED' 
            ? `Deal confirmed! Final terms: ${formatCurrency(finalTerms.rentPrice, finalTerms.currency)}/month, ${finalTerms.leasingMonths} months, ${finalTerms.paymentFrequency} payments, move-in ${formatDate(finalTerms.moveInDate)}`
            : 'Deal confirmed and finalized!';
        }

        showToast('success', message);
        setIsAccepted(true);
        onOfferStatusChange?.();
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
      showToast('error', 'Failed to accept offer. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectOffer = async () => {
    setIsRejecting(true);
    try {
      await offersAPI.rejectOffer(offer.id, currentUserId);
      showToast('success', 'Offer rejected successfully');
      onOfferStatusChange?.();
    } catch (error) {
      console.error('Error rejecting offer:', error);
      showToast('error', 'Failed to reject offer. Please try again.');
    } finally {
      setIsRejecting(false);
    }
  };

  // Rule 2: For pending offers, recipient (landlord) can Accept, Reject, or Counter
  if (offer.offerStatus === 'pending') {
    return (
      <div className="pt-4 border-t border-gray-200">
        <div className="flex space-x-3">
          {onAcceptOffer && (
            <button
              onClick={handleAcceptOffer}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
              disabled={isAccepting}
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Accept
            </button>
          )}
          {onRejectOffer && (
            <button
              onClick={handleRejectOffer}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
              disabled={isRejecting}
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
              Counter Offer
            </button>
          )}
        </div>
      </div>
    );
  }

  // New Rule: If offer is tentatively accepted, only recipient (landlord) can confirm
  if (offer.offerStatus === 'tentatively_accepted') {
    return (
      <div className="pt-4 border-t border-gray-200">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-800 mb-0">Tenant has tentatively accepted your offer</h3>
              <div className="mt-2 text-sm mb-0">
                <p className="text-sm text-gray-600 mb-0">
                  Please confirm to finalize the deal and reject other pending offers.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAcceptOffer}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
            disabled={isAccepting}
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            {isAccepting ? 'Confirming...' : 'Confirm & Finalize Deal'}
          </button>
          <button
            onClick={handleRejectOffer}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
            disabled={isRejecting}
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Decline
          </button>
        </div>
      </div>
    );
  }

  // Rule 6: If initiator made final counter, recipient can only Accept or Reject
  if (offer.offerStatus === 'countered' && offer.lastActionType === 'INITIATOR_COUNTERED') {
    return (
      <div className="pt-4 border-t border-gray-200">
        <div className="space-y-4">
          {/* Show final counter offer details */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 mb-3 text-sm">Final Counter Offer from Tenant</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-purple-700">
                  <span className="font-medium">Rent:</span> {formatCurrency(offer.currentRentPrice || offer.proposingRentPrice, offer.currentRentPriceCurrency || offer.proposingRentPriceCurrency || 'HKD')}/month
                </div>
                <div className="flex items-center text-sm text-purple-700">
                  <span className="font-medium">Lease:</span> {offer.currentNumLeasingMonths || offer.numLeasingMonths} month{(offer.currentNumLeasingMonths || offer.numLeasingMonths) !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-purple-700">
                  <span className="font-medium">Move-in:</span> {formatDate(offer.currentMoveInDate || offer.moveInDate)}
                </div>
                <div className="text-sm text-purple-700">
                  <span className="font-medium">Payment:</span> {offer.currentPaymentFrequency || offer.paymentFrequency}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-purple-700">
                <span className="font-medium">Note:</span> This is the tenant's final counter offer. You can only Accept or Reject.
              </p>
            </div>
          </div>
          
          {/* Accept/Reject buttons */}
          <div className="flex space-x-3">
            {onAcceptOffer && (
              <button
                onClick={handleAcceptOffer}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
                disabled={isAccepting}
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Accept Final Offer
              </button>
            )}
            {onRejectOffer && (
              <button
                onClick={handleRejectOffer}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                disabled={isRejecting}
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Reject Final Offer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No actions for other statuses
  return null;
}
