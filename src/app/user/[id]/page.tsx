'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usersAPI } from '@/lib/api-client';
import type { RealEstateUserRow } from '@/lib/ensureUserProfile';
import DropitiPassport2 from '@/components/common/DropitiPassport2';
import { UserListings, UserReviews } from '@/components/user-profile';
import { DEFAULT_AVATAR_URL } from '@/constants';
import Footer from '@/components/common/Footer';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';

interface User {
  uuid: string;
  nhost_user_id: string;
  display_name: string;
  photo_url?: string;
  email: string;
  location?: string;
  created_at: string;
  verified: boolean;
  rating: number;
  review_count: number;
  about?: string;
  languages?: string[];
  response_rate: number;
  education?: string;
  occupation?: string;
  marital_status?: string;
}

function parseLanguages(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.trim() ? [value] : [];
    }
  }
  return [];
}

function mapRowToUser(row: RealEstateUserRow): User {
  return {
    uuid: row.uuid,
    nhost_user_id: row.nhost_user_id,
    display_name: row.display_name || 'Unknown User',
    photo_url: row.photo_url,
    email: row.email || '',
    location: row.location || 'Location not specified',
    created_at: row.created_at || new Date().toISOString(),
    verified: row.verified ?? false,
    rating: row.rating ?? 0,
    review_count: row.review_count ?? 0,
    about: row.about || 'No description available',
    languages: parseLanguages(row.languages),
    response_rate: row.response_rate ?? 0,
    education: row.education,
    occupation: row.occupation,
    marital_status: row.marital_status,
  };
}

/**
 * Public profile route. `[id]` is always `nhost_user_id` (same as `auth.users.id`).
 */
export default function UserProfilePage() {
  const params = useParams();
  const nhostUserId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!nhostUserId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await usersAPI.getUserByNhostUserId(nhostUserId);

        if (response.success && response.data) {
          setUser(mapRowToUser(response.data));
        } else if ('notFound' in response && response.notFound) {
          setError('User not found.');
        } else {
          setError(
            'error' in response ? response.error : 'Failed to load user data',
          );
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [nhostUserId]);

  const mapToPassportFormat = (profileUser: User) => ({
    displayName: profileUser.display_name,
    avatar: profileUser.photo_url || DEFAULT_AVATAR_URL,
    email: profileUser.email,
    location: profileUser.location,
    created_at: profileUser.created_at,
    verified: profileUser.verified,
    rating: profileUser.rating,
    reviewCount: profileUser.review_count,
    about: profileUser.about,
    languages: profileUser.languages,
    stats: {
      responseRate: profileUser.response_rate,
      avgResponseTime: 'Unknown',
      totalProperties: 0,
      publishedProperties: 0,
    },
  });

  if (isLoading) {
    return <CenteredLoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-[1180px] mx-auto px-4 py-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[1180px] mx-auto px-4 py-8 text-center text-gray-500">
        User not found.
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1180px] mx-auto px-4 py-8">
        <DropitiPassport2
          user={mapToPassportFormat(user)}
          nhostUserId={user.nhost_user_id}
        />
        <UserListings userId={user.nhost_user_id} />
        <UserReviews userId={user.nhost_user_id} />
      </div>
      <Footer />
    </>
  );
}
