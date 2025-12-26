'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { usersAPI } from '@/lib/api-client';
import DropitiPassport2 from '@/components/common/DropitiPassport2';
import { ProfileHeader } from './_components/profile-header';
import { ProfileMessage } from './_components/profile-message';
import { ProfileSummarySection } from './_components/profile-summary-section';
import { ProfilePassportPreview } from './_components/profile-passport-preview';

interface UserProfile {
  displayName: string;
  avatar: string;
  email: string;
  location?: string;
  joinDate: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  about?: string;
  languages: string[];
  responseTime: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
  phoneNumber?: string;
  stats: {
    responseRate: number;
    totalProperties: number;
    publishedProperties: number;
  };
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    displayName: 'dropiti User',
            avatar: '/images/Portrait_Placeholder.png',
    email: 'new.user@dropiti.com',
    location: 'Central, Hong Kong',
    joinDate: '2020-03-15',
    verified: true,
    rating: 4.8,
    reviewCount: 127,
    about: 'Hi! I\'m Sarah, a passionate property manager with over 5 years of experience in the Hong Kong real estate market. I love creating comfortable, welcoming spaces for tenants and ensuring they have the best possible living experience.',
    languages: ['English', 'Cantonese', 'Mandarin'],
    responseTime: '1 hour',
    education: 'Bachelors',
    occupation: 'Business Owner',
    maritalStatus: 'Single',
    phoneNumber: '123-456-7890',
    stats: {
      responseRate: 98,
      totalProperties: 5,
      publishedProperties: 5
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load user data from API when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      if (authUser?.id) {
        try {
          setIsLoading(true);
          const response = await usersAPI.getUserByFirebaseUid(authUser.id);
          
          if (response.success && response.data) {
            const userData = response.data;
            
            const newProfile: UserProfile = {
              displayName: userData.display_name || 'Unknown User',
              avatar: userData.photo_url || '/images/Portrait_Placeholder.png',
              email: userData.email || '',
              location: userData.location || '',
              joinDate: userData.created_at ? new Date(userData.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
              verified: userData.verified || false,
              rating: userData.rating || 0,
              reviewCount: userData.review_count || 0,
              about: userData.about || '',
              languages: (() => {
                if (!userData.languages) return [];
                if (Array.isArray(userData.languages)) return userData.languages;
                if (typeof userData.languages === 'string') {
                  try {
                    const parsed = JSON.parse(userData.languages);
                    return Array.isArray(parsed) ? parsed : [];
                  } catch {
                    return userData.languages.split(',').map((lang: string) => lang.trim()).filter((lang: string) => lang);
                  }
                }
                return [];
              })(),
              responseTime: 'Within 24 hours',
              education: userData.education || '',
              occupation: userData.occupation || '',
              maritalStatus: userData.marital_status || '',
              phoneNumber: userData.phone_number || '',
              stats: {
                responseRate: userData.response_rate || 0,
                totalProperties: 0,
                publishedProperties: 0
              }
            };
            
            setProfile(newProfile);
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
          setSaveMessage({
            type: 'error',
            message: 'Failed to load profile data'
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUserProfile();
  }, [authUser?.id]);

  const handleEditProfile = () => {
    router.push('/dashboard/profile/edit');
  };

  // Map UserProfile to DropitiPassport2 format
  const mapToPassportFormat = (profile: UserProfile) => ({
    displayName: profile.displayName,
    avatar: profile.avatar,
    email: profile.email,
    location: profile.location,
    created_at: profile.joinDate, // joinDate in UserProfile is actually the created_at date
    verified: profile.verified,
    rating: profile.rating,
    reviewCount: profile.reviewCount,
    about: profile.about,
    languages: profile.languages,
    stats: {
      responseRate: profile.stats.responseRate,
      avgResponseTime: '1h',
      totalProperties: profile.stats.totalProperties,
      publishedProperties: profile.stats.totalProperties
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProfileHeader onEdit={handleEditProfile} />

      {saveMessage && (
        <ProfileMessage
          type={saveMessage.type}
          message={saveMessage.message}
          onDismiss={() => setSaveMessage(null)}
        />
      )}

      <ProfilePassportPreview
        user={mapToPassportFormat(profile)}
        firebaseUid={authUser?.id || ""}
      />

      <ProfileSummarySection
        profile={profile}
        onEdit={handleEditProfile}
      />
    </div>
  );
}