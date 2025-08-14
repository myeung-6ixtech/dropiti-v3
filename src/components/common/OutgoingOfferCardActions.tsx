import { useState } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { offersAPI } from '@/lib/api-client';
import FinalCounterOfferModal2 from './FinalCounterOfferModal2';
import { useToast } from '@/context/ToastContext';
import FinalDealDisplay from './FinalDealDisplay';

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
    finalRentPrice?: number;
    finalRentPriceCurrency?: string;
    finalNumLeasingMonths?: number;
    finalPaymentFrequency?: string;
    finalMoveInDate?: string;
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
  const { showToast } = useToast();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isFinalCounterModalOpen, setIsFinalCounterModalOpen] = useState(false);
  const [isSubmittingFinalCounter, setIsSubmittingFinalCounter] = useState(false);
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
      await offersAPI.acceptOffer(offer.id, currentUserId);
      
      // Determine the final accepted terms from the database final_* fields
      const finalTerms = {
        rentPrice: offer.finalRentPrice || offer.proposingRentPrice,
        currency: offer.finalRentPriceCurrency || offer.proposingRentPriceCurrency || 'HKD',
        leasingMonths: offer.finalNumLeasingMonths || offer.numLeasingMonths,
        paymentFrequency: offer.finalPaymentFrequency || offer.paymentFrequency,
        moveInDate: offer.finalMoveInDate || offer.moveInDate
      };

      // Show success toast with final deal details
      const message = offer.lastActionType === 'RECIPIENT_COUNTERED' 
        ? `Offer accepted! Final deal: ${formatCurrency(finalTerms.rentPrice, finalTerms.currency)}/month, ${finalTerms.leasingMonths} months, ${finalTerms.paymentFrequency} payments, move-in ${formatDate(finalTerms.moveInDate)}`
        : 'Offer accepted successfully!';
      
      showToast('success', message);
      setIsAccepted(true);
      onOfferStatusChange?.();
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

  const handleWithdrawOffer = async () => {
    setIsWithdrawing(true);
    try {
      await offersAPI.withdrawOffer(offer.id, currentUserId);
      showToast('success', 'Offer withdrawn successfully');
      onOfferStatusChange?.();
    } catch (error) {
      console.error('Error withdrawing offer:', error);
      showToast('error', 'Failed to withdraw offer. Please try again.');
    } finally {
      setIsWithdrawing(false);
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
      showToast('success', 'Final counter offer submitted successfully');
      onOfferStatusChange?.();
      setIsFinalCounterModalOpen(false);
    } catch (error) {
      console.error('Error submitting final counter offer:', error);
      showToast('error', 'Failed to submit final counter offer. Please try again.');
    } finally {
      setIsSubmittingFinalCounter(false);
    }
  };

  // CORRECTED FLOW LOGIC:
  // For outgoing offers (tenant perspective)
  if (offer.offerStatus === 'accepted') {
    return (
      <div className="mt-4 space-y-3">
        {/* Final Accepted Terms Display */}
        <div className="p-4 bg-green-100 border border-green-300 rounded-md">
          <h4 className="text-green-900 text-sm font-semibold mb-3">
            🎯 Final Accepted Terms
          </h4>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Rent and Lease Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-green-800 text-xs font-medium">Monthly Rent:</span>
                <span className="text-green-900 text-sm font-semibold">
                  {formatCurrency(
                    offer.finalRentPrice || offer.proposingRentPrice, 
                    offer.finalRentPriceCurrency || offer.proposingRentPriceCurrency || 'HKD'
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-green-800 text-xs font-medium">Lease Duration:</span>
                <span className="text-green-900 text-sm font-semibold">
                  {offer.finalNumLeasingMonths || offer.numLeasingMonths} month{(offer.finalNumLeasingMonths || offer.numLeasingMonths) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            {/* Payment Frequency and Move-in Date */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-green-800 text-xs font-medium">Payment Frequency:</span>
                <span className="text-green-900 text-sm font-semibold">
                  {offer.finalPaymentFrequency || offer.paymentFrequency}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-green-800 text-xs font-medium">Move-in Date:</span>
                <span className="text-green-900 text-sm font-semibold">
                  {formatDate(offer.finalMoveInDate || offer.moveInDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }  

  // Rule 1: For pending offers, initiator (tenant) can only withdraw or view property
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

  // Rule 4: For countered offers (RECIPIENT_COUNTERED), initiator can Accept, Final Counter, or Reject
  if (offer.offerStatus === 'countered' && offer.lastActionType === 'RECIPIENT_COUNTERED') {
    return (
      <>
        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-4">
            {/* Show counter offer details */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-900 mb-3 text-sm">Landlord's Counter Offer</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-blue-700">
                    <span className="font-medium">New Rent:</span> {formatCurrency(offer.currentRentPrice || offer.proposingRentPrice, offer.currentRentPriceCurrency || offer.proposingRentPriceCurrency || 'HKD')}/month
                  </div>
                  <div className="flex items-center text-sm text-blue-700">
                    <span className="font-medium">New Lease:</span> {offer.currentNumLeasingMonths || offer.numLeasingMonths} month{(offer.currentNumLeasingMonths || offer.numLeasingMonths) !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-blue-700">
                    <span className="font-medium">New Move-in:</span> {formatDate(offer.currentMoveInDate || offer.moveInDate)}
                  </div>
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">New Payment:</span> {offer.currentPaymentFrequency || offer.paymentFrequency}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleAcceptOffer}
                disabled={isAccepting}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {isAccepting ? 'Accepting...' : 'Accept Counter Offer'}
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
                {isRejecting ? 'Rejecting...' : 'Reject Counter Offer'}
              </button>
            </div>
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

  // No actions for other statuses
  return null;
}
