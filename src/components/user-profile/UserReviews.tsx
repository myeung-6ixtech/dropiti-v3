'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/outline';
import { reviewsAPI } from '@/lib/api-client';

interface UserReviewsProps {
  userFirebaseUid: string;
}

interface Review {
  id: string;
  reviewUuid: string;
  reviewerFirebaseUid: string;
  reviewedUserFirebaseUid: string;
  reviewType: string;
  rating: number;
  title?: string;
  comment?: string;
  offerUuid?: string;
  propertyUuid?: string;
  isPublic: boolean;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  reviewer?: {
    uuid: string;
    displayName: string;
    email: string;
    photoUrl?: string;
  };
  property?: {
    propertyUuid: string;
    title: string;
    location: string;
    rentalPrice: number;
    rentalPriceCurrency: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    photos: string[];
  };
}

export default function UserReviews({ userFirebaseUid }: UserReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await reviewsAPI.getReviewsByUser({
          userFirebaseUid: userFirebaseUid,
          reviewType: 'landlord_review', // Get reviews where user is the landlord being reviewed
          limit: 20,
          offset: 0
        });
        
        if (response.success && response.data) {
          setReviews(response.data);
        } else {
          setError(response.error || 'Failed to load reviews');
        }
      } catch (error) {
        console.error('Failed to fetch user reviews:', error);
        setError('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    if (userFirebaseUid) {
      fetchUserReviews();
    }
  }, [userFirebaseUid]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReviewTypeLabel = (reviewType: string) => {
    switch (reviewType) {
      case 'landlord_review':
        return 'Landlord Review';
      case 'tenant_review':
        return 'Tenant Review';
      case 'offer_review':
        return 'Offer Review';
      default:
        return 'Review';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <StarIcon className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <StarIcon className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
        </div>
        <div className="text-center py-8 text-red-500">
          <StarIcon className="h-12 w-12 mx-auto mb-4 text-red-300" />
          <p className="text-lg font-medium">Error loading reviews</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <StarIcon className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
        <span className="text-sm text-gray-500">({reviews.length})</span>
      </div>
      
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {review.reviewer?.photoUrl ? (
                    <Image
                      src={review.reviewer.photoUrl}
                      alt={review.reviewer.displayName}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {review.reviewer?.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {review.reviewer?.displayName || 'Anonymous User'}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {getReviewTypeLabel(review.reviewType)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">{review.rating}/5</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {formatDate(review.createdAt)}
                    {review.property && (
                      <span> • {review.property.title}</span>
                    )}
                  </div>
                </div>
              </div>
              
              {review.title && (
                <h4 className="font-medium text-gray-900 text-sm mb-2">{review.title}</h4>
              )}
              
              {review.comment && (
                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
              )}
              
              {review.property && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {review.property.photos && review.property.photos.length > 0 && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={review.property.photos[0]}
                          alt={review.property.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 text-sm">{review.property.title}</h5>
                      <p className="text-xs text-gray-600">{review.property.location}</p>
                      <p className="text-xs text-gray-500">
                        {review.property.bedrooms} bed • {review.property.bathrooms} bath
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <StarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No reviews yet</p>
          <p className="text-sm">This user hasn't received any reviews yet.</p>
        </div>
      )}
    </div>
  );
}
