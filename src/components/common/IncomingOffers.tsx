'use client';

import { useState, useEffect } from 'react';
import { 
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { offersAPI } from '@/lib/api-client';

interface Offer {
  id: string;
  offerKey: string;
  propertyUuid: string;
  initiatorFirebaseUid: string;
  recipientFirebaseUid: string;
  proposingRentPrice: number;
  proposingRentPriceCurrency: string;
  numLeasingMonths: number;
  paymentFrequency: string;
  moveInDate: string;
  offerStatus: string;
  isActive: boolean;
  createdAt: string;
}

interface IncomingOffersProps {
  recipientFirebaseUid: string;
  propertyUuid?: string; // Optional: filter by specific property
  title?: string;
  showPropertyInfo?: boolean;
}

export default function IncomingOffers({ 
  recipientFirebaseUid, 
  propertyUuid, 
  title = "Incoming Offers",
  showPropertyInfo = true 
}: IncomingOffersProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch offers for the recipient (landlord)
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching offers for recipient:', recipientFirebaseUid);
        
        const response = await offersAPI.getOffersByRecipient({
          recipientFirebaseUid,
          propertyUuid
        });

        if (response.success && response.data) {
          setOffers(response.data);
          console.log('Offers fetched successfully:', response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch offers');
        }
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch offers');
      } finally {
        setLoading(false);
      }
    };

    if (recipientFirebaseUid) {
      fetchOffers();
    }
  }, [recipientFirebaseUid, propertyUuid]);

  const handleAcceptOffer = (offerId: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, offerStatus: 'accepted' }
          : offer
      )
    );
    // TODO: Make API call to accept the offer
    console.log('Accepting offer:', offerId);
  };

  const handleRejectOffer = (offerId: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, offerStatus: 'rejected' }
          : offer
      )
    );
    // TODO: Make API call to reject the offer
    console.log('Rejecting offer:', offerId);
  };

  const handleCounterOffer = (offerId: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, offerStatus: 'countered' }
          : offer
      )
    );
    // TODO: Open counter offer modal
    console.log('Countering offer:', offerId);
  };

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      countered: { color: 'bg-blue-100 text-blue-800', text: 'Countered' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Offers</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Offers Yet</h3>
          <p className="text-gray-600 mb-4">
            {propertyUuid ? 'This property has no offers yet.' : 'You have no incoming offers yet.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-1">
          {offers.length} offer{offers.length !== 1 ? 's' : ''} received
        </p>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            {/* Offer Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {/* Assuming initiator info is not directly available in this simplified structure */}
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {/* Assuming initiator name is not directly available */}
                    Unknown Tenant
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(offer.createdAt)}
                  </p>
                </div>
              </div>
              {getStatusBadge(offer.offerStatus)}
            </div>

            {/* Property Info (if enabled) */}
            {showPropertyInfo && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-900 mb-1">Property Title</h4>
                <p className="text-sm text-gray-600">Property Address</p>
                <p className="text-sm text-gray-600">
                  Listed at {formatCurrency(0, 'HKD')}/month
                </p>
              </div>
            )}

            {/* Offer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    Offered: {formatCurrency(offer.proposingRentPrice, offer.proposingRentPriceCurrency)}/month
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{offer.numLeasingMonths} month{offer.numLeasingMonths !== 1 ? 's' : ''} lease</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Move-in: {formatDate(offer.moveInDate)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>No email</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>No phone</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Payment:</span> {offer.paymentFrequency}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {offer.offerStatus === 'pending' && (
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleAcceptOffer(offer.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Accept
                </button>
                <button
                  onClick={() => handleRejectOffer(offer.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => handleCounterOffer(offer.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Counter
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
