'use client';

import { CheckCircleIcon, CurrencyDollarIcon, CalendarIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface FinalDealDisplayProps {
  offer: {
    proposingRentPrice: number;
    proposingRentPriceCurrency: string;
    numLeasingMonths: number;
    paymentFrequency: string;
    moveInDate: string;
    // Counter offer fields
    currentRentPrice?: number;
    currentRentPriceCurrency?: string;
    currentNumLeasingMonths?: number;
    currentPaymentFrequency?: string;
    currentMoveInDate?: string;
    lastActionType?: string;
    // Final accepted terms fields
    finalRentPrice?: number;
    finalRentPriceCurrency?: string;
    finalNumLeasingMonths?: number;
    finalPaymentFrequency?: string;
    finalMoveInDate?: string;
    finalAcceptedAt?: string;
    finalAcceptedBy?: 'initiator' | 'recipient';
  };
}

export default function FinalDealDisplay({ offer }: FinalDealDisplayProps) {
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

  // Determine the final accepted terms
  const finalTerms = {
    rentPrice: offer.finalRentPrice || offer.proposingRentPrice,
    currency: offer.finalRentPriceCurrency || offer.proposingRentPriceCurrency || 'HKD',
    leasingMonths: offer.finalNumLeasingMonths || offer.numLeasingMonths,
    paymentFrequency: offer.finalPaymentFrequency || offer.paymentFrequency,
    moveInDate: offer.finalMoveInDate || offer.moveInDate
  };

  // Original offer terms
  const originalTerms = {
    rentPrice: offer.proposingRentPrice,
    currency: offer.proposingRentPriceCurrency || 'HKD',
    leasingMonths: offer.numLeasingMonths,
    paymentFrequency: offer.paymentFrequency,
    moveInDate: offer.moveInDate
  };

  const isCounterOffer = offer.lastActionType === 'RECIPIENT_COUNTERED';
  const hasChanges = isCounterOffer && offer.finalRentPrice && (
    offer.finalRentPrice !== offer.proposingRentPrice ||
    offer.finalNumLeasingMonths !== offer.numLeasingMonths ||
    offer.finalPaymentFrequency !== offer.paymentFrequency ||
    offer.finalMoveInDate !== offer.moveInDate
  );

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-4">
        <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
        <h3 className="text-xl font-semibold text-green-800">
          {isCounterOffer ? 'Final Deal Accepted!' : 'Deal Accepted!'}
        </h3>
      </div>
      
      {isCounterOffer && (
        <p className="text-sm text-green-700 mb-4">
          You accepted the counter offer. Here's what was agreed upon:
        </p>
      )}
      
      {/* Final Accepted Terms - Always shown */}
      <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-green-800 mb-3 text-lg">Final Accepted Terms</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-green-700">
                <span className="font-medium">Monthly Rent: </span> {formatCurrency(finalTerms.rentPrice, finalTerms.currency)}
              </span>
            </div>
            
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-green-700">
                <span className="font-medium">Lease Duration: </span> {finalTerms.leasingMonths} month{finalTerms.leasingMonths !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-green-700">
                <span className="font-medium">Move-in Date: </span> {formatDate(finalTerms.moveInDate)}
              </span>
            </div>
            
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-green-700">
                <span className="font-medium">Payment Frequency: </span> {finalTerms.paymentFrequency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Show comparison if there were changes */}
      {hasChanges && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 mb-3 text-lg">Negotiation Summary</h4>
          <p className="text-sm text-blue-700 mb-3">
            Here's how the terms changed from your original offer:
          </p>
          
          <div className="space-y-3">
            {/* Rent Price Comparison */}
            {offer.finalRentPrice !== offer.proposingRentPrice && (
              <div className="flex items-center justify-between bg-white p-3 rounded border border-blue-200">
                <span className="text-sm font-medium text-blue-800">Monthly Rent: </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 line-through">
                    {formatCurrency(originalTerms.rentPrice, originalTerms.currency)}
                  </span>
                  <ArrowRightIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold text-green-700">
                    {formatCurrency(offer.finalRentPrice!, offer.finalRentPriceCurrency || 'HKD')}
                  </span>
                </div>
              </div>
            )}

            {/* Lease Duration Comparison */}
            {offer.finalNumLeasingMonths !== offer.numLeasingMonths && (
              <div className="flex items-center justify-between bg-white p-3 rounded border border-blue-200">
                <span className="text-sm font-medium text-blue-800">Lease Duration: </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 line-through">
                    {originalTerms.leasingMonths} month{originalTerms.leasingMonths !== 1 ? 's' : ''}
                  </span>
                  <ArrowRightIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold text-green-700">
                    {offer.finalNumLeasingMonths} month{offer.finalNumLeasingMonths !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Payment Frequency Comparison */}
            {offer.finalPaymentFrequency !== offer.paymentFrequency && (
              <div className="flex items-center justify-between bg-white p-3 rounded border border-blue-200">
                <span className="text-sm font-medium text-blue-800">Payment Frequency: </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 line-through">
                    {originalTerms.paymentFrequency}
                  </span>
                  <ArrowRightIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold text-green-700">
                    {offer.finalPaymentFrequency}
                  </span>
                </div>
              </div>
            )}

            {/* Move-in Date Comparison */}
            {offer.finalMoveInDate !== offer.moveInDate && (
              <div className="flex items-center justify-between bg-white p-3 rounded border border-blue-200">
                <span className="text-sm font-medium text-blue-800">Move-in Date: </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 line-through">
                    {formatDate(originalTerms.moveInDate)}
                  </span>
                  <ArrowRightIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold text-green-700">
                    {formatDate(offer.finalMoveInDate!)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No changes message if original terms were accepted */}
      {!hasChanges && isCounterOffer && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2 text-lg">No Changes Made</h4>
          <p className="text-sm text-gray-600">
            The counter offer terms were identical to your original offer, so no changes were made.
          </p>
        </div>
      )}

      {/* Deal completion status */}
      <div className="bg-green-100 border border-green-300 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Deal Completed Successfully!
            </p>
            <p className="text-xs text-green-600 mt-1">
              Both parties have agreed to the final terms above. The rental agreement is now confirmed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
