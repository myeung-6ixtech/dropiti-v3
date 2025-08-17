import { Offer } from '@/types/offer';

interface OfferCardDetailsProps {
  offer: Pick<Offer, 'proposingRentPrice' | 'proposingRentPriceCurrency' | 'numLeasingMonths' | 'moveInDate' | 'paymentFrequency' | 'property' | 'initiator' | 'recipient'>;
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
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      {/* Property Info (if enabled) */}
      {showPropertyInfo && offer.property && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <h4 className="font-medium text-gray-900 mb-1">{offer.property.title}</h4>
          <p className="text-sm text-gray-600">{offer.property.location}</p>
          <p className="text-sm text-gray-600 mb-0">
            Listed at {formatCurrency(offer.property.rentalPrice, offer.property.rentalPriceCurrency)}/month
          </p>
          <p className="text-sm text-gray-600 mb-0">
            {offer.property.bedrooms} bed{offer.property.bedrooms !== 1 ? 's' : ''} • {offer.property.bathrooms} bath{offer.property.bathrooms !== 1 ? 's' : ''} • {offer.property.propertyType}
          </p>
        </div>
      )}

      {/* Offer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <span className="capitalize">
              Initially Offered: {formatCurrency(offer.proposingRentPrice, offer.proposingRentPriceCurrency)}/month
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="capitalize">Lease: {offer.numLeasingMonths} month{offer.numLeasingMonths !== 1 ? 's' : ''} lease</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <span className="capitalize">Move-in: {formatDate(offer.moveInDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="capitalize">Payment Frequency: &nbsp;{offer.paymentFrequency} </span> 
          </div>
        </div>
      </div>
    </>
  );
}
