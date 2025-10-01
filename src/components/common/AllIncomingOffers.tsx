'use client';

import { useState, useEffect } from 'react';
import { offersAPI, propertiesAPI } from '@/lib/api-client';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import OfferCard from '@/components/common/OfferCard';
import CreateOfferModal from '@/components/common/CreateOfferModal';
import EmptyState from '@/components/common/EmptyState';
import { Offer } from '@/types/offer';import MobileTabs from '@/components/common/MobileTabs';
interface AllIncomingOffersProps {
  recipientFirebaseUid: string;
}

interface OfferWithProperty extends Offer {
  propertyTitle?: string;
  propertyLocation?: string;
  propertyImage?: string;
}

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

interface PropertyGroup {
  propertyTitle: string;
  propertyLocation: string;
  propertyImage?: string;
  offers: OfferWithProperty[];
}

export default function AllIncomingOffers({ recipientFirebaseUid }: AllIncomingOffersProps) {
  const [offers, setOffers] = useState<OfferWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCounterOfferModalOpen, setIsCounterOfferModalOpen] = useState(false);
  const [selectedOfferForCounter, setSelectedOfferForCounter] = useState<OfferWithProperty | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Fetch all offers for the recipient (landlord)
  useEffect(() => {
    const fetchAllOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all offers without property filter to get offers from all properties
        const response = await offersAPI.getOffersByRecipient(recipientFirebaseUid);

        if (response.success && response.data) {
          if (response.data.length === 0) {
            setOffers([]);
            return;
          }
          
          // Check if the API response includes property data
          const hasPropertyData = response.data.some((offer: Offer) => offer.property);
          
          if (hasPropertyData) {
            // The API response already includes property data, so we can use it directly
            const enhancedOffers = response.data.map((offer: Offer) => {
              // Use the property data that's already included in the API response
              if (offer.property) {
                return {
                  ...offer,
                  // Ensure property object has the correct structure for OfferCardDetails
                  property: {
                    propertyUuid: offer.propertyUuid, // Use the propertyUuid from the offer
                    title: offer.property.title,
                    location: offer.property.location,
                    rentalPrice: offer.property.rentalPrice || 0,
                    rentalPriceCurrency: offer.property.rentalPriceCurrency || 'HKD',
                    propertyType: offer.property.propertyType,
                    bedrooms: offer.property.bedrooms || 0,
                    bathrooms: offer.property.bathrooms || 0,
                    imageUrl: offer.property.imageUrl || ''
                  },
                  // Keep enhanced fields for grouping
                  propertyTitle: offer.property.title,
                  propertyLocation: offer.property.location,
                  propertyImage: offer.property.imageUrl
                };
              } else {
                // If no property data, still return the offer but without property info
                return {
                  ...offer,
                  propertyTitle: 'Unknown Property',
                  propertyLocation: 'Unknown Location',
                  propertyImage: ''
                };
              }
            });
            
            setOffers(enhancedOffers);
          } else {
            // Fallback to the original approach if property data is not in API response
            const enhancedOffers = await Promise.all(
              response.data.map(async (offer: Offer) => {
                try {
                  // Fetch property details for each offer
                  const propertyResponse = await propertiesAPI.getPropertyByUuid(offer.propertyUuid);
                  
                  if (propertyResponse?.success && propertyResponse?.data?.property) {
                    const property = propertyResponse.data.property;
                    return {
                      ...offer,
                      // Add property object for OfferCardDetails
                      property: {
                        propertyUuid: property.uuid,
                        title: property.title,
                        location: property.location,
                        rentalPrice: property.rental_price || 0,
                        rentalPriceCurrency: property.rental_price_currency || 'HKD',
                        propertyType: property.property_type,
                        bedrooms: property.num_bedroom || 0,
                        bathrooms: property.num_bathroom || 0,
                        imageUrl: property.display_image || property.image_url || ''
                      },
                      // Keep enhanced fields for grouping
                      propertyTitle: property.title,
                      propertyLocation: property.location,
                      propertyImage: property.display_image || property.image_url
                    };
                  }
                  return offer;
                } catch (err) {
                  console.error('Error fetching property for offer:', offer.id, err);
                  return offer;
                }
              })
            );
            
            setOffers(enhancedOffers);
          }
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
      fetchAllOffers();
    }
  }, [recipientFirebaseUid]);

  // Filter offers based on status - combine pending, tentatively_accepted, and countered into "pending"
  const filteredOffers = offers.filter(offer => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') {
      return ['pending', 'tentatively_accepted', 'countered'].includes(offer.offerStatus);
    }
    return offer.offerStatus === filterStatus;
  });

  // Group offers by property for better organization
  const groupedOffers = filteredOffers.reduce((acc, offer) => {
    const propertyKey = offer.propertyUuid;
    if (!acc[propertyKey]) {
      acc[propertyKey] = {
        propertyTitle: offer.propertyTitle || 'Unknown Property',
        propertyLocation: offer.propertyLocation || 'Unknown Location',
        propertyImage: offer.propertyImage,
        offers: []
      };
    }
    acc[propertyKey].offers.push(offer);
    return acc;
  }, {} as Record<string, PropertyGroup>);

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const response = await offersAPI.acceptOffer(offerId, recipientFirebaseUid);
      if (response.success) {
        setOffers(prev => 
          prev.map(offer => 
            offer.id === offerId 
              ? { ...offer, offerStatus: 'accepted' }
              : offer
          )
        );
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      const response = await offersAPI.rejectOffer(offerId, recipientFirebaseUid);
      if (response.success) {
        setOffers(prev => 
          prev.map(offer => 
            offer.id === offerId 
              ? { ...offer, offerStatus: 'rejected' }
              : offer
          )
        );
      }
    } catch (error) {
      console.error('Error rejecting offer:', error);
    }
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
      const response = await offersAPI.counterOffer(
        selectedOfferForCounter.id,
        recipientFirebaseUid,
        {
          rentPrice: offerData.rentalPrice,
          numLeasingMonths: offerData.leaseDuration,
          paymentFrequency: offerData.paymentFrequency,
          moveInDate: offerData.moveInDate
        }
      );

      if (response.success) {
        setOffers(prev => 
          prev.map(offer => 
            offer.id === selectedOfferForCounter.id 
              ? { ...offer, offerStatus: 'countered' }
              : offer
          )
        );
        
        setIsCounterOfferModalOpen(false);
        setSelectedOfferForCounter(null);
      }
    } catch (error) {
      console.error('Error submitting counter offer:', error);
    }
  };

  const getStatusCounts = () => {
    const pendingCount = offers.filter(o => 
      ['pending', 'tentatively_accepted', 'countered'].includes(o.offerStatus)
    ).length;
    
    return {
      all: offers.length,
      pending: pendingCount,
      accepted: offers.filter(o => o.offerStatus === 'accepted').length,
      rejected: offers.filter(o => o.offerStatus === 'rejected').length,
    };
  };

  const statusCounts = getStatusCounts();

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
      <EmptyState
        icon="📬"
        title="No Offers Yet"
        description="You haven't received any offers for your properties yet. When tenants are interested in your listings, their offers will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile Tabs */}
      <MobileTabs
        tabs={[
          { id: 'all', name: 'All Offers', count: statusCounts.all },
          { id: 'pending', name: 'Pending', count: statusCounts.pending },
          { id: 'accepted', name: 'Accepted', count: statusCounts.accepted },
          { id: 'rejected', name: 'Rejected', count: statusCounts.rejected },
        ]}
        activeTab={filterStatus}
        onTabChange={(tabId) => setFilterStatus(tabId as FilterStatus)}
      />

      {/* Desktop Tabs */}

      <div className="desktop-tabs border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Offers', count: statusCounts.all },
            { key: 'pending', label: 'Pending', count: statusCounts.pending },
            { key: 'accepted', label: 'Accepted', count: statusCounts.accepted },
            { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key as FilterStatus)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filterStatus === key
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </nav>
      </div>

      {/* Offers by Property */}
      <div className="space-y-8">
        {Object.entries(groupedOffers).map(([propertyUuid, propertyGroup]) => (
          <div key={propertyUuid} className="space-y-4">
            {/* Offers for this Property */}
            <div className="space-y-4">
              {propertyGroup.offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  showPropertyInfo={true} // Now show property info in individual cards
                  isIncomingOffer={true}
                  onAcceptOffer={handleAcceptOffer}
                  onRejectOffer={handleRejectOffer}
                  onCounterOffer={handleCounterOffer}
                  currentUserId={recipientFirebaseUid}
                  onOfferStatusChange={() => {
                    // Refresh offers when status changes
                    window.location.reload();
                  }}
                />
              ))}
            </div>
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