'use client';

import { Modal } from '@/components/ui/modal';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import { Offer } from '@/types/offer';
import { XMarkIcon } from '@heroicons/react/24/outline';



interface CounterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer | null;
  loading: boolean;
  responding: boolean;
  finalCounterSubmitted: boolean;
  onAccept: (offerId: string) => void;
  onFinalCounter: () => void;
  onReject: (offerId: string) => void;
  isIncomingOffer?: boolean; // To determine if this is for incoming or outgoing offers
}

export default function CounterOfferModal({
  isOpen,
  onClose,
  offer,
  loading,
  responding,
  finalCounterSubmitted,
  onAccept,
  onFinalCounter,
  onReject
}: CounterOfferModalProps) {
  const formatCurrency = (amount: number, currency: string = 'HKD') => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!offer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] w-full mx-4">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Counter Offer Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <CenteredLoadingSpinner />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Final Counter Offer Details (if submitted) */}
              {finalCounterSubmitted ? (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-green-900 mb-3 text-sm">Final Counter Offer</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-green-700">
                        <span className="font-medium w-24">Rent:</span>
                        <span>{formatCurrency(offer.proposingRentPrice, offer.proposingRentPriceCurrency || 'HKD')}/month</span>
                      </div>
                      <div className="flex items-center text-sm text-green-700">
                        <span className="font-medium w-24">Lease:</span>
                        <span>{offer.numLeasingMonths} months</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-green-700">
                        <span className="font-medium w-24">Move-in:</span>
                        <span>{formatDate(offer.moveInDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-green-700">
                        <span className="font-medium w-24">Payment:</span>
                        <span className="capitalize">{offer.paymentFrequency}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-3">
                    ✓ Final counter offer has been submitted. Waiting for response.
                  </p>
                </div>
              ) : (
                <>
                  {/* Landlord's Counter Offer Details */}
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-3 text-sm">Landlord's Counter Offer</h4>
                    {offer.currentRentPrice || offer.currentNumLeasingMonths || offer.currentPaymentFrequency || offer.currentMoveInDate ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {offer.currentRentPrice && (
                            <div className="flex items-center text-sm text-yellow-700">
                              <span className="font-medium w-24">Rent:</span>
                              <span>{formatCurrency(offer.currentRentPrice, offer.currentRentPriceCurrency || 'HKD')}/month</span>
                            </div>
                          )}
                          {offer.currentNumLeasingMonths && (
                            <div className="flex items-center text-sm text-yellow-700">
                              <span className="font-medium w-24">Lease:</span>
                              <span>{offer.currentNumLeasingMonths} months</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {offer.currentMoveInDate && (
                            <div className="flex items-center text-sm text-yellow-700">
                              <span className="font-medium w-24">Move-in:</span>
                              <span>{formatDate(offer.currentMoveInDate)}</span>
                            </div>
                          )}
                          {offer.currentPaymentFrequency && (
                            <div className="flex items-center text-sm text-yellow-700">
                              <span className="font-medium w-24">Payment:</span>
                              <span className="capitalize">{offer.currentPaymentFrequency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-yellow-600">
                        <p className="mb-2">
                          The landlord has sent you a counter offer for this property. 
                          Since this is a counter offer, the landlord has proposed different terms.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => onAccept(offer.id)}
                  disabled={responding}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Accept Offer
                </button>
                
                {!finalCounterSubmitted && (
                  <button
                    onClick={() => {
                      onFinalCounter();
                      // Close this modal when Final Counter Offer is clicked
                      onClose();
                    }}
                    disabled={responding}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Final Offer
                  </button>
                )}
                
                <button
                  onClick={() => onReject(offer.id)}
                  disabled={responding}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Offer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
