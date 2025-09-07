'use client';

import { Offer } from '@/types/offer';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface OutgoingOfferCardStatusProps {
  offer: Offer;
  bulkRejectionInfo?: {
    rejectedOffersCount: number;
    rejectedOffers: Array<{ id: string; offerKey: string }>;
  };
}

export default function OutgoingOfferCardStatus({
  offer,
  bulkRejectionInfo
}: OutgoingOfferCardStatusProps) {
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

  // For outgoing offers (tenant perspective)
  if (offer.offerStatus === 'accepted') {
    return (
      <div className="space-y-4">
        {/* Final Accepted Terms Display */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-800 mb-0">
                🎯 Final Accepted Terms
              </h3>
              <div className="mt-2 text-sm mb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rent and Lease Duration */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-purple-700">
                      <span className="font-medium capitalize">Monthly Rent: </span> {formatCurrency(
                        offer.finalRentPrice || offer.proposingRentPrice, 
                        offer.finalRentPriceCurrency || offer.proposingRentPriceCurrency || 'HKD'
                      )}
                    </div>
                    <div className="flex items-center text-sm text-purple-700">
                      <span className="font-medium capitalize">Lease Duration: </span> {offer.finalNumLeasingMonths || offer.numLeasingMonths} month{(offer.finalNumLeasingMonths || offer.numLeasingMonths) !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {/* Payment Frequency and Move-in Date */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-purple-700">
                      <span className="font-medium capitalize">Payment Frequency: </span> {offer.finalPaymentFrequency || offer.paymentFrequency}
                    </div>
                    <div className="flex items-center text-sm text-purple-700">
                      <span className="font-medium capitalize">Move-in Date: </span> {formatDate(offer.finalMoveInDate || offer.moveInDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Message */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-800 mb-0">
                🎉 Great news! The landlord accepted your offer
              </h3>
              <div className="mt-2 text-sm mb-0">
                <p className="text-sm text-gray-600 mb-0">
                  Contact the landlord to proceed with the rental agreement
                </p>
                {offer.finalAcceptedAt && (
                  <p className="text-sm text-gray-600 mb-0 mt-1">
                    Accepted on {formatDate(offer.finalAcceptedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bulk Rejection Information */}
        {bulkRejectionInfo && bulkRejectionInfo.rejectedOffersCount > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-5 w-5 text-purple-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800 mb-0">
                  ⚠️ Property Deal Finalized
                </h3>
                <div className="mt-2 text-sm mb-0">
                  <p className="text-sm text-gray-600 mb-0">
                    {bulkRejectionInfo.rejectedOffersCount} other pending offer{bulkRejectionInfo.rejectedOffersCount === 1 ? '' : 's'} automatically rejected when your offer was accepted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (offer.offerStatus === 'rejected') {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800 mb-0">
              😔 The landlord rejected your offer
            </h3>
            <div className="mt-2 text-sm mb-0">
              <p className="text-sm text-gray-600 mb-0">
                You can search for other properties or try a different offer
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (offer.offerStatus === 'withdrawn') {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800 mb-0">
              You withdrew this offer
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (offer.offerStatus === 'countered') {
    if (offer.lastActionType === 'RECIPIENT_COUNTERED') {
      if (offer.negotiationRound === 1) {
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-5 w-5 text-purple-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800 mb-0">
                  The landlord sent you a counter offer
                </h3>
                <div className="mt-2 text-sm mb-0">
                  <p className="text-sm text-gray-600 mb-0">
                    Review the terms and decide whether to accept, reject, or counter
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }
    } else if (offer.lastActionType === 'INITIATOR_COUNTERED') {
      if (offer.negotiationRound === 2) {
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-5 w-5 text-purple-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800 mb-0">
                  🔄 You sent a final counter offer to the landlord
                </h3>
                <div className="mt-2 text-sm mb-0">
                  <p className="text-sm text-gray-600 mb-0">
                    Waiting for landlord's final decision...
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
  }

  // Default case for pending offers
  if (offer.offerStatus === 'pending') {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800 mb-0">
              📋 Your offer is pending landlord review
            </h3>
            <div className="mt-2 text-sm mb-0">
              <p className="text-sm text-gray-600 mb-0">
                The landlord will review your offer and respond soon
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Final Counter Offer Modal */}
      {/* This modal is no longer used for final counter offers */}
    </>
  );
}
