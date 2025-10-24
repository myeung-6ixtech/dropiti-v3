'use client';

import Image from 'next/image';
import { TenantProfileData } from '@/types/tenant';
import { getSafeProfileImage } from '@/lib/utils';

interface TenantProfilePreviewProps {
  data: TenantProfileData;
  user?: {
    name?: string;
    avatar?: string;
    displayName?: string;
  };
  showActions?: boolean;
  onEdit?: () => void;
  onPublish?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function TenantProfilePreview({ 
  data, 
  user,
  showActions = false, 
  onEdit, 
  onPublish, 
  isSubmitting = false,
  className = ''
}: TenantProfilePreviewProps) {
  const formatCurrency = (amount: number | undefined, currency: string = 'HKD') => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-HK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const userName = user?.displayName || user?.name || 'User';
  const userAvatar = user?.avatar;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm relative ${className}`}>
      {/* Status Badge - Top Right */}
      <div className="absolute top-3 right-3">
        {data.tenant_listing_status === 'active' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Published
          </span>
        )}
        {data.tenant_listing_status === 'draft' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Draft
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="space-y-2">
          {/* User Header */}
          <div className="flex items-start gap-3 pr-20">
            <div className="flex-shrink-0">
              <Image
                src={getSafeProfileImage(userAvatar, '/images/Portrait_Placeholder.png')}
                alt={userName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 truncate">
                {userName}
              </h3>
              <h4 className="text-base font-semibold text-gray-900 mt-0 mb-1">
                {data.tenant_listing_title || 'Untitled Profile'}
              </h4>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {data.tenant_listing_description || 'No description provided'}
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Budget */}
            <div>
              <span className="font-medium text-gray-700">Budget:</span>
              <p className="text-gray-600">
                {formatCurrency(data.budget_min, data.budget_currency)} - {formatCurrency(data.budget_max, data.budget_currency)}
              </p>
            </div>

            {/* Locations */}
            <div>
              <span className="font-medium text-gray-700">Locations:</span>
              <p className="text-gray-600 truncate">
                {(data.preferred_locations && data.preferred_locations.length > 0) 
                  ? data.preferred_locations.slice(0, 2).join(', ') + (data.preferred_locations.length > 2 ? '...' : '')
                  : 'Not specified'}
              </p>
            </div>

            {/* Move-in Date */}
            <div>
              <span className="font-medium text-gray-700">Move-in:</span>
              <p className="text-gray-600">
                {formatDate(data.preferred_move_in_date)}
              </p>
            </div>

            {/* Lease Duration */}
            <div>
              <span className="font-medium text-gray-700">Lease:</span>
              <p className="text-gray-600">
                {data.preferred_lease_duration ? `${data.preferred_lease_duration} months` : 'Not specified'}
              </p>
            </div>
          </div>

          {/* Additional Preferences */}
          {(data.rental_space_preference || data.furnishing_preference || data.pets_allowed !== undefined) && (
            <div className="pt-1 border-t border-gray-100">
              <div className="flex flex-wrap gap-1.5">
                {data.rental_space_preference && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    {data.rental_space_preference.replace('_', ' ')}
                  </span>
                )}
                {data.furnishing_preference && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                    {data.furnishing_preference.replace('_', ' ')}
                  </span>
                )}
                {data.pets_allowed !== undefined && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                    data.pets_allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {data.pets_allowed ? 'Pets OK' : 'No Pets'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {data.tenant_listing_status === 'active' 
                ? 'Live and visible to landlords'
                : 'Saved as draft'
              }
            </div>
            
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="btn-secondary inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md"
                >
                  Modify
                </button>
              )}
              
              {onPublish && data.tenant_listing_status !== 'active' && (
                <button
                  onClick={onPublish}
                  disabled={isSubmitting}
                  className="form-button inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      Publishing...
                    </>
                  ) : (
                    'Publish'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
