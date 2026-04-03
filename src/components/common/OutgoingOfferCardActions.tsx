import { useState } from 'react';
import { XMarkIcon, CheckIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { offersAPI } from '@/lib/api-client';
import FinalCounterOfferModal2 from './FinalCounterOfferModal2';
import { useToast } from '@/context/ToastContext';
import FinalDealDisplay from './FinalDealDisplay';
import { useResponsiveModal } from '@/hooks/useResponsiveModal';

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
  const [isWithdrawConfirmOpen, setIsWithdrawConfirmOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isFinalCounterModalOpen, setIsFinalCounterModalOpen] = useState(false);
  const [isSubmittingFinalCounter, setIsSubmittingFinalCounter] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const { ModalComponent: WithdrawConfirmModal } = useResponsiveModal({
    isOpen: isWithdrawConfirmOpen,
    onClose: () => setIsWithdrawConfirmOpen(false),
    mobileTitle: 'Withdraw Offer',
    mobileHeight: 'small',
    modalClassName: 'max-w-sm w-full mx-4',
    showCloseButton: false,
  });

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
        // This shouldn't happen for tenant/initiator, but handle gracefully
        const bulkRejection = response?.data?.bulkRejection;
        let message = '';

        if (bulkRejection && bulkRejection.rejectedOffersCount > 0) {
          const baseMessage = offer.lastActionType === 'RECIPIENT_COUNTERED' 
            ? `Deal confirmed! Final terms: ${formatCurrency(finalTerms.rentPrice, finalTerms.currency)}/month, ${finalTerms.leasingMonths} months, ${finalTerms.paymentFrequency} payments, move-in ${formatDate(finalTerms.moveInDate)}`
            : 'Deal confirmed and finalized!';
          
          const rejectionMessage = ` ${bulkRejection.rejectedOffersCount} other pending offer${bulkRejection.rejectedOffersCount === 1 ? '' : 's'} automatically rejected.`;
          message = baseMessage + rejectionMessage;
          
          showToast('info', `${bulkRejection.rejectedOffersCount} other offer${bulkRejection.rejectedOffersCount === 1 ? '' : 's'} automatically rejected for this property.`);
        } else {
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

  // Rule 1: For pending offers, initiator (tenant) can only withdraw or view property
  if (offer.offerStatus === 'pending') {
    return (
      <>
        <div className="pt-4 border-t border-gray-200 mb-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {onWithdrawOffer && (
              <button
                onClick={() => setIsWithdrawConfirmOpen(true)}
                className="btn-primary w-full sm:flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                disabled={isWithdrawing}
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
              </button>
            )}
            {offer.property && (
              <Link
                href={`/property/${offer.propertyUuid}`}
                className="btn-secondary w-full sm:flex-1 bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors flex items-center justify-center"
              >
                <span>View Property</span>
              </Link>
            )}
          </div>
        </div>

        <WithdrawConfirmModal>
          <div className="bg-white overflow-hidden">
            <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 pr-2 mb-0">Withdraw Offer</h2>
              <button
                type="button"
                onClick={() => setIsWithdrawConfirmOpen(false)}
                className="p-2 shrink-0 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700 font-medium mb-1">Are you sure you want to withdraw this offer?</p>
                  <p className="text-xs text-gray-500 mb-0">This action cannot be undone. You will need to create a new offer if you change your mind.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsWithdrawConfirmOpen(false);
                    handleWithdrawOffer();
                  }}
                  disabled={isWithdrawing}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isWithdrawing ? 'Withdrawing...' : 'Yes, Withdraw Offer'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsWithdrawConfirmOpen(false)}
                  className="w-full btn-secondary py-3 px-4 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </WithdrawConfirmModal>
      </>
    );
  }

  // New Rule: For tentatively accepted offers, show status to initiator (tenant)
  if (offer.offerStatus === 'tentatively_accepted') {
    return (
      <div className="pt-4 border-t border-gray-200">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-800 mb-0">Tentatively Accepted</h3>
              <div className="mt-2 text-sm mb-0">
                <p className="text-sm text-gray-600 mb-0">
                  Your acceptance is pending landlord confirmation. The landlord will review and finalize the deal.
                </p>
              </div>
            </div>
          </div>
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
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-3 text-sm">Landlord's Counter Offer</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-purple-700">
                    <span className="font-medium">New Rent:</span> {formatCurrency(offer.currentRentPrice || offer.proposingRentPrice, offer.currentRentPriceCurrency || offer.proposingRentPriceCurrency || 'HKD')}/month
                  </div>
                  <div className="flex items-center text-sm text-purple-700">
                    <span className="font-medium">New Lease:</span> {offer.currentNumLeasingMonths || offer.numLeasingMonths} month{(offer.currentNumLeasingMonths || offer.numLeasingMonths) !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-purple-700">
                    <span className="font-medium">New Move-in:</span> {formatDate(offer.currentMoveInDate || offer.moveInDate)}
                  </div>
                  <div className="text-sm text-purple-700">
                    <span className="font-medium">New Payment:</span> {offer.currentPaymentFrequency || offer.paymentFrequency}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleAcceptOffer}
                disabled={isAccepting}
                className="w-full sm:flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {isAccepting ? 'Accepting...' : 'Accept Counter Offer'}
              </button>
              
              {!finalCounterSubmitted && (
                <button
                  onClick={() => setIsFinalCounterModalOpen(true)}
                  className="w-full sm:flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center"
                >
                  Final Counter Offer
                </button>
              )}
              
              <button
                onClick={handleRejectOffer}
                disabled={isRejecting}
                className="w-full sm:flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
