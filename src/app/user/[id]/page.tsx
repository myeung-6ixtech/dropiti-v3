'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usersAPI } from '@/lib/api-client';
import DropitiPassport2 from '@/components/common/DropitiPassport2';
import { UserListings, UserReviews } from '@/components/user-profile';

interface User {
  uuid: string;
  firebase_uid: string;
  display_name: string;
  photo_url?: string;
  email: string;
  location?: string;
  user_since: string;
  verified: boolean;
  rating: number;
  review_count: number;
  about?: string;
  languages?: string[];
  response_time?: string;
  response_rate: number;
  total_properties: number;
  total_guests: number;
  avg_response_time?: string;
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
          
          console.log('Fetching user data for UUID:', uuid);
          const response = await usersAPI.getUserByUuid(uuid);
          
          if (response.success && response.data) {
            console.log('User data received:', response.data);
            
            // Transform API data to match our User interface
            const transformedUser: User = {
              uuid: response.data.uuid,
              firebase_uid: response.data.firebase_uid,
              display_name: response.data.display_name || 'Unknown User',
              photo_url: response.data.photo_url,
              email: response.data.email || '',
              location: response.data.location || 'Location not specified',
              user_since: response.data.user_since || new Date().toISOString(),
              verified: response.data.verified || false,
              rating: response.data.rating || 0,
              review_count: response.data.review_count || 0,
              about: response.data.about || 'No description available',
              languages: response.data.languages || [],
              response_time: response.data.response_time || 'Unknown',
              response_rate: response.data.response_rate || 0,
              total_properties: response.data.total_properties || 0,
              total_guests: response.data.total_guests || 0,
              avg_response_time: response.data.avg_response_time || 'Unknown'
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
    avatar: user.photo_url || '/images/placeholder.png', // Fallback avatar
    email: user.email,
    location: user.location,
    joinDate: user.user_since || new Date().toISOString(),
    verified: user.verified,
    rating: user.rating,
    reviewCount: user.review_count,
    about: user.about,
    languages: user.languages,
    stats: {
      responseRate: user.response_rate,
      avgResponseTime: user.avg_response_time || 'Unknown',
      totalProperties: user.total_properties,
      totalGuests: user.total_guests
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
      <DropitiPassport2 user={mapToPassportFormat(user)} />

      {/* User Listings Component */}
      <UserListings userFirebaseUid={user.firebase_uid} />

      {/* User Reviews Component */}
      <UserReviews userFirebaseUid={user.firebase_uid} />
    </div>
  );
}
