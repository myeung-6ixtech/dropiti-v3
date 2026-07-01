'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TenantProfileData } from '@/types/tenant';
import { getSafeProfileImage } from '@/lib/utils';
import { DEFAULT_AVATAR_URL } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useTenantProfileDisplayUser } from '@/hooks/useTenantProfileDisplayUser';
import type { TenantProfileEmbeddedUser, TenantProfileRow } from '@/lib/tenant-profiles';
import StartDirectChatModal from '@/components/chat/StartDirectChatModal';

interface TenantProfileCardProps {
  data: TenantProfileData;
  user?: TenantProfileEmbeddedUser | null;
  currentUserId?: string;
  /** Session fallback for the logged-in user's own marketplace card. */
  authUserFallback?: {
    displayName?: string;
    name?: string;
    avatar?: string;
    photoUrl?: string;
    email?: string;
    id?: string;
  };
  className?: string;
}

export default function TenantProfileCard({
  data,
  user,
  currentUserId,
  authUserFallback,
  className = '',
}: TenantProfileCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const row = data as TenantProfileRow;
  const nhostUserId = data?.user_id ?? row.user?.nhost_user_id ?? user?.nhost_user_id;
  const isCurrentUser = Boolean(
    currentUserId && nhostUserId && currentUserId === nhostUserId,
  );

  const { displayUser } = useTenantProfileDisplayUser(
    nhostUserId,
    user ?? row.user,
    isCurrentUser ? authUserFallback : undefined,
  );

  const userUuid = displayUser.nhost_user_id || nhostUserId || null;
  const userName = displayUser.displayName || displayUser.name || 'User';
  const userAvatar = displayUser.avatar;

  const handleContactClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!nhostUserId) return;
    setIsContactModalOpen(true);
  };

  const canContact = Boolean(nhostUserId) && !isCurrentUser;

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

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative ${className}`}
    >
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
          <div className="flex items-start gap-3 pr-20">
            <div className="flex-shrink-0">
              <Image
                src={getSafeProfileImage(userAvatar, DEFAULT_AVATAR_URL)}
                alt={userName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 truncate">{userName}</h3>
              <h4 className="text-base font-semibold text-gray-900 mt-0 mb-1">
                {data.tenant_listing_title || 'Untitled Profile'}
              </h4>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {data.tenant_listing_description || 'No description provided'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium text-gray-700">Budget:</span>
              <p className="text-gray-600">
                {formatCurrency(data.budget_min, data.budget_currency)} -{' '}
                {formatCurrency(data.budget_max, data.budget_currency)}
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-700">Locations:</span>
              <p className="text-gray-600 truncate">
                {data.preferred_locations && data.preferred_locations.length > 0
                  ? data.preferred_locations.slice(0, 2).join(', ') +
                    (data.preferred_locations.length > 2 ? '...' : '')
                  : 'Not specified'}
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-700">Move-in:</span>
              <p className="text-gray-600">{formatDate(data.preferred_move_in_date)}</p>
            </div>

            <div>
              <span className="font-medium text-gray-700">Lease:</span>
              <p className="text-gray-600">
                {data.preferred_lease_duration
                  ? `${data.preferred_lease_duration} months`
                  : 'Not specified'}
              </p>
            </div>
          </div>

          {(data.preferred_property_types && data.preferred_property_types.length > 0) ||
          data.rental_space_preference ||
          data.furnishing_preference ||
          data.pets_allowed !== undefined ? (
            <div className="pt-1 border-t border-gray-100">
              <div className="flex flex-wrap gap-1.5">
                {data.preferred_property_types && data.preferred_property_types.length > 0 && (
                  <span className="capitalize inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                    {data.preferred_property_types
                      .map((t) => t.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()))
                      .join(', ')}
                  </span>
                )}
                {data.rental_space_preference && (
                  <span className="capitalize inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    {data.rental_space_preference.replace('_', ' ')}
                  </span>
                )}
                {data.furnishing_preference && (
                  <span className="capitalize inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                    {data.furnishing_preference.replace('_', ' ')}
                  </span>
                )}
                {data.pets_allowed !== undefined && (
                  <span
                    className={`capitalize inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      data.pets_allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {data.pets_allowed ? 'Pets Owner' : 'No Pets'}
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {userUuid ? (
              <Link
                href={`/user/${userUuid}`}
                className="btn-secondary inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md"
              >
                View
              </Link>
            ) : (
              <button
                disabled
                className="btn-secondary inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md opacity-50 cursor-not-allowed"
              >
                View
              </button>
            )}

            {isCurrentUser ? (
              <Link
                href="/dashboard/tenant-profile/edit"
                className="form-button inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md"
              >
                Edit Profile
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleContactClick}
                disabled={!canContact}
                title={!nhostUserId ? 'Contact unavailable for this profile' : undefined}
                className="form-button inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Contact
              </button>
            )}
          </div>
        </div>
      </div>

      {nhostUserId && (
        <StartDirectChatModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          recipientUserId={nhostUserId}
          recipientName={userName}
          recipientAvatar={userAvatar}
          callerRole="landlord"
          recipientRole="tenant"
        />
      )}
    </div>
  );
}
