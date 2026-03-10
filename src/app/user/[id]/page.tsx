'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usersAPI } from '@/lib/api-client';
import DropitiPassport2 from '@/components/common/DropitiPassport2';
import { UserListings, UserReviews } from '@/components/user-profile';
import { DEFAULT_AVATAR_URL } from '@/constants';

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
  phone_number?: string;
  // Properties and reviews are now fetched separately by dedicated components
}

export default function UserProfilePage() {
  const params = useParams();
  const uuid = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (uuid) {
        try {
          setIsLoading(true);
          setError(null);
          
          const response = await usersAPI.getUserByUuid(uuid);
          
          if (response.success && response.data) {
            
            // Transform API data to match our User interface
            const transformedUser: User = {
              uuid: response.data.uuid,
              nhost_user_id: response.data.nhost_user_id,
              display_name: response.data.display_name || 'Unknown User',
              photo_url: response.data.photo_url,
              email: response.data.email || '',
              location: response.data.location || 'Location not specified',
              created_at: response.data.created_at,
              verified: response.data.verified || false,
              rating: response.data.rating || 0,
              review_count: response.data.review_count || 0,
              about: response.data.about || 'No description available',
              languages: response.data.languages || [],
              response_rate: response.data.response_rate || 0,
              education: response.data.education,
              occupation: response.data.occupation,
              marital_status: response.data.marital_status,
              phone_number: response.data.phone_number
            };
            
            setUser(transformedUser);
          } else {
            setError(response.error || 'Failed to load user data');
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setError('Failed to load user data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [uuid]);





  // Map User to DropitiPassport2 format
  const mapToPassportFormat = (user: User) => ({
    displayName: user.display_name,
    avatar: user.photo_url || DEFAULT_AVATAR_URL,
    email: user.email,
    location: user.location,
    created_at: user.created_at,
    verified: user.verified,
    rating: user.rating,
    reviewCount: user.review_count,
    about: user.about,
    languages: user.languages,
    stats: {
      responseRate: user.response_rate,
      avgResponseTime: 'Unknown', // This field is not available in the API response
      totalProperties: 0, // This will be calculated by the DropitiPassport2 component
      publishedProperties: 0 // This will be calculated by the DropitiPassport2 component
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center py-8">User not found.</div>;
  }

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      {/* Profile Header - Using DropitiPassport2 Component */}
      <DropitiPassport2 user={mapToPassportFormat(user)} nhostUserId={user.nhost_user_id} />

      {/* User Listings Component */}
      <UserListings userId={user.nhost_user_id} />

      {/* User Reviews Component */}
      <UserReviews userId={user.nhost_user_id} />
    </div>
  );
}
