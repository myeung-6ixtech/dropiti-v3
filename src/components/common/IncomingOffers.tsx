'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { offersAPI } from '@/lib/api-client';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import CreateOfferModal from '@/components/common/CreateOfferModal';

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
  // New fields for initiator (tenant) details
  initiator?: {
    uuid: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    photoUrl: string;
  } | null;
  // New fields for property details
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
  // New fields for counter offer details
  currentRentPrice?: number;
  currentRentPriceCurrency?: string;
  currentNumLeasingMonths?: number;
  currentMoveInDate?: string;
  currentPaymentFrequency?: string;
  negotiationRound?: number;
  lastActionBy?: 'initiator' | 'recipient';
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
  const [isCounterOfferModalOpen, setIsCounterOfferModalOpen] = useState(false);
  const [selectedOfferForCounter, setSelectedOfferForCounter] = useState<Offer | null>(null);

  // Fetch offers for the recipient (landlord)
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching offers for recipient:', recipientFirebaseUid);
        
        const response = await offersAPI.getOffersByRecipient(recipientFirebaseUid);

        if (response.success && response.data) {
          setOffers(response.data);
          console.log('Offers fetched successfully:', response.data);
          console.log('First offer initiator details:', response.data[0]?.initiator);
          console.log('First offer property details:', response.data[0]?.property);
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
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      setSelectedOfferForCounter(offer);
      setIsCounterOfferModalOpen(true);
    }
  };

  const handleCounterOfferSubmit = async (offerData: {
    rentalPrice: number;
    leaseDuration: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
    moveInDate: string;
  }) => {
    if (!selectedOfferForCounter) return;
    
    try {
      // Call the counter offer API
      const response = await offersAPI.counterOffer(
        selectedOfferForCounter.id,
        recipientFirebaseUid, // Current user (landlord) is countering
        {
          rentPrice: offerData.rentalPrice,
          numLeasingMonths: offerData.leaseDuration,
          paymentFrequency: offerData.paymentFrequency,
          moveInDate: offerData.moveInDate
        }
      );

      if (response.success) {
        // Update the local state to reflect the counter offer
        setOffers(prev => 
          prev.map(offer => 
            offer.id === selectedOfferForCounter.id 
              ? { ...offer, offerStatus: 'countered' }
              : offer
          )
        );
        
        // Close the modal
        setIsCounterOfferModalOpen(false);
        setSelectedOfferForCounter(null);
        
        // Show success message (you can add a toast notification here)
        console.log('Counter offer submitted successfully');
      } else {
        console.error('Failed to submit counter offer:', response.error);
      }
    } catch (error) {
      console.error('Error submitting counter offer:', error);
    }
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
    return <CenteredLoadingSpinner />;
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
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  {offer.initiator?.photoUrl ? (
                    <Image 
                      src={offer.initiator.photoUrl} 
                      alt={offer.initiator.displayName}
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {offer.initiator?.displayName || 'Unknown Tenant'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(offer.createdAt)}
                  </p>
                </div>
              </div>
              {getStatusBadge(offer.offerStatus)}
            </div>

            {/* Property Info (if enabled) */}
            {showPropertyInfo && offer.property && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-900 mb-1">{offer.property.title}</h4>
                <p className="text-sm text-gray-600">{offer.property.location}</p>
                <p className="text-sm text-gray-600">
                  Listed at {formatCurrency(offer.property.rentalPrice, offer.property.rentalPriceCurrency)}/month
                </p>
                <p className="text-sm text-gray-500">
                  {offer.property.bedrooms} bed{offer.property.bedrooms !== 1 ? 's' : ''} • {offer.property.bathrooms} bath{offer.property.bathrooms !== 1 ? 's' : ''} • {offer.property.propertyType}
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
                  <span>{offer.initiator?.email || 'No email'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{offer.initiator?.phoneNumber || 'No phone'}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Payment:</span> {offer.paymentFrequency}
                </div>
              </div>
            </div>

            {/* Counter Offer Details - Show when offer has been countered */}
            {offer.offerStatus === 'countered' && offer.currentRentPrice && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Counter Offer Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-blue-700">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <span>
                        Counter: {formatCurrency(offer.currentRentPrice, offer.currentRentPriceCurrency || 'HKD')}/month
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-blue-700">
                      <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{offer.currentNumLeasingMonths || offer.numLeasingMonths} month{(offer.currentNumLeasingMonths || offer.numLeasingMonths) !== 1 ? 's' : ''} lease</span>
                    </div>
                    <div className="flex items-center text-sm text-blue-700">
                      <ClockIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Move-in: {formatDate(offer.currentMoveInDate || offer.moveInDate)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-blue-700">
                      <span className="font-medium">Payment Frequency:</span> {offer.currentPaymentFrequency || offer.paymentFrequency}
                    </div>
                    <div className="text-sm text-blue-700">
                      <span className="font-medium">Negotiation Round:</span> {offer.negotiationRound || 1}
                    </div>
                    <div className="text-sm text-blue-700">
                      <span className="font-medium">Last Action:</span> {offer.lastActionBy === 'recipient' ? 'Landlord' : 'Tenant'} countered
                    </div>
                  </div>
                </div>
              </div>
            )}

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

      {/* Counter Offer Modal */}
      {selectedOfferForCounter && (
        <CreateOfferModal
          isOpen={isCounterOfferModalOpen}
          onClose={() => {
            setIsCounterOfferModalOpen(false);
            setSelectedOfferForCounter(null);
          }}
          propertyId={selectedOfferForCounter.propertyUuid}
          currentPrice={selectedOfferForCounter.proposingRentPrice}
          mode="counter"
          offerId={selectedOfferForCounter.id}
          existingOffer={{
            rentalPrice: selectedOfferForCounter.proposingRentPrice,
            leaseDuration: selectedOfferForCounter.numLeasingMonths,
            paymentFrequency: selectedOfferForCounter.paymentFrequency as 'monthly' | 'quarterly' | 'yearly',
            moveInDate: selectedOfferForCounter.moveInDate
          }}
          onOfferSubmit={handleCounterOfferSubmit}
        />
      )}
    </div>
  );
}
