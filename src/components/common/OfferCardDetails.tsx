import { Offer } from '@/types/offer';

interface OfferCardDetailsProps {
  offer: Offer;
  showPropertyInfo?: boolean;
  isIncomingOffer?: boolean;
}

export default function OfferCardDetails({ offer, showPropertyInfo = true }: OfferCardDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'HKD') => {
    // Add validation to prevent NaN
    if (isNaN(amount) || amount === null || amount === undefined) {
      console.warn('Invalid amount for currency formatting:', amount);
      return 'N/A';
    }
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get current values, fallback to initial values if no counters
  const currentRentPrice = offer.currentRentPrice ?? offer.proposingRentPrice;
  const currentRentPriceCurrency = offer.currentRentPriceCurrency ?? offer.proposingRentPriceCurrency;
  const currentNumLeasingMonths = offer.currentNumLeasingMonths ?? offer.numLeasingMonths;
  const currentPaymentFrequency = offer.currentPaymentFrequency ?? offer.paymentFrequency;
  const currentMoveInDate = offer.currentMoveInDate ?? offer.moveInDate;

  // Check if there are counter offers by comparing current values with initial values
  const hasCounters = offer.currentRentPrice !== undefined && 
                     (offer.currentRentPrice !== offer.proposingRentPrice ||
                      offer.currentNumLeasingMonths !== offer.numLeasingMonths ||
                      offer.currentPaymentFrequency !== offer.paymentFrequency ||
                      offer.currentMoveInDate !== offer.moveInDate);


  return (
    <>
      {/* Property Info (if enabled) */}
      {showPropertyInfo && offer.property && (
        <div className="mb-3 p-3 bg-gray-50 rounded-md">
          <h4 className="font-medium text-sm text-gray-900 mb-1">{offer.property.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{offer.property.location}</p>
          <p className="text-sm text-gray-600 mb-0">
            Listed at {formatCurrency(offer.property.rentalPrice || 0, offer.property.rentalPriceCurrency || 'HKD')}/month
          </p>
          <p className="text-sm text-gray-600 mb-0 capitalize">
            {offer.property.bedrooms} bed{offer.property.bedrooms !== 1 ? 's' : ''} • {offer.property.bathrooms} bath{offer.property.bathrooms !== 1 ? 's' : ''} • {offer.property.propertyType}
          </p>
        </div>
      )}

      {/* Offer Details - Two Column Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        {/* Left Column */}
        <div className="space-y-2">
          {/* Rental Offer */}
          <div className="flex items-center text-sm text-gray-700">
            <span className="font-medium w-24">Rental Offer:</span>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                {formatCurrency(currentRentPrice, currentRentPriceCurrency)}
              </span>
              {hasCounters && (
                <span className="text-xs text-gray-500">
                  (<span className="line-through">{formatCurrency(offer.proposingRentPrice, offer.proposingRentPriceCurrency)}</span>)
                </span>
              )}
            </div>
          </div>

          {/* Lease Duration */}
          <div className="flex items-center text-sm text-gray-700">
            <span className="font-medium w-24">Lease:</span>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                {currentNumLeasingMonths} month{currentNumLeasingMonths !== 1 ? 's' : ''}
              </span>
              {hasCounters && offer.currentNumLeasingMonths !== undefined && offer.currentNumLeasingMonths !== offer.numLeasingMonths && (
                <span className="text-xs text-gray-500">
                  (<span className="line-through">{offer.numLeasingMonths} month{offer.numLeasingMonths !== 1 ? 's' : ''}</span>)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          {/* Move-in Date */}
          <div className="flex items-center text-sm text-gray-700">
            <span className="font-medium w-24">Move in:</span>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                {formatDate(currentMoveInDate)}
              </span>
              {hasCounters && offer.currentMoveInDate !== undefined && offer.currentMoveInDate !== offer.moveInDate && (
                <span className="text-xs text-gray-500">
                  (<span className="line-through">{formatDate(offer.moveInDate)}</span>)
                </span>
              )}
            </div>
          </div>

          {/* Payment Frequency */}
          <div className="flex items-center text-sm text-gray-700">
            <span className="font-medium w-24">Payment:</span>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 capitalize">
                {currentPaymentFrequency}
              </span>
              {hasCounters && offer.currentPaymentFrequency !== undefined && offer.currentPaymentFrequency !== offer.paymentFrequency && (
                <span className="text-xs text-gray-500">
                  (<span className="line-through capitalize">{offer.paymentFrequency}</span>)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
