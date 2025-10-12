'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { usersAPI } from '@/lib/api-client';
import { 
  FiUser,
  FiGlobe,
  FiBook,
  FiBriefcase,
  FiHeart,
  FiMapPin,
  FiClock,
  FiEdit
} from 'react-icons/fi';
import DropitiPassport2 from '@/components/common/DropitiPassport2';
// import ProfileStatusBanner from '@/components/profile/ProfileStatusBanner';

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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-2">View and manage your profile information</p>
          </div>
          <button
            onClick={handleEditProfile}
            className="btn-primary flex items-center space-x-2"
          >
            <FiEdit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`mb-6 border rounded-lg p-4 ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <span>{saveMessage.message}</span>
            <button
              onClick={() => setSaveMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Dropiti Passport Display - Hidden on mobile */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-0">Your Dropiti Passport</h2>
          <span className="text-sm text-gray-500 mt-1mb-0">Live Preview</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          This is how your Dropiti Passport appears to others. Click "Edit Profile" to make changes.
        </p>
        <div className="bg-gray-50 rounded-lg p-4">
          <DropitiPassport2 user={mapToPassportFormat(profile)} firebaseUid={authUser?.id || ""} />
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Summary</h2>
        
        {/* About Section - Moved to top */}
        {profile.about && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 mb-3">About You</h3>
            <p className="text-gray-700 leading-relaxed">{profile.about}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiUser className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 mb-0">Display Name</p>
                  <p className="text-md font-medium text-gray-700">{profile.displayName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FiUser className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 mb-0">Email</p>
                  <p className="font-medium text-gray-700">{profile.email}</p>
                </div>
              </div>

              {profile.location && (
                <div className="flex items-center space-x-3">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 mb-0">Location</p>
                    <p className="font-medium text-gray-700">{profile.location}</p>
                  </div>
                </div>
              )}

              {profile.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <FiUser className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 mb-0">Phone Number</p>
                    <p className="font-medium text-gray-700">{profile.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Additional Details</h3>
            
            <div className="space-y-3">
              {profile.education && (
                <div className="flex items-center space-x-3">
                  <FiBook className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 mb-0">Education</p>
                    <p className="font-medium text-gray-700">{profile.education}</p>
                  </div>
                </div>
              )}

              {profile.occupation && (
                <div className="flex items-center space-x-3">
                  <FiBriefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 mb-0">Occupation</p>
                    <p className="font-medium text-gray-700">{profile.occupation}</p>
                  </div>
                </div>
              )}

              {profile.maritalStatus && (
                <div className="flex items-center space-x-3">
                  <FiHeart className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 mb-0">Marital Status</p>
                    <p className="font-medium text-gray-700">{profile.maritalStatus}</p>
                  </div>
                </div>
              )}

              {profile.languages.length > 0 && (
                <div className="flex items-center space-x-3">
                  <FiGlobe className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 mb-0">Languages</p>
                    <p className="font-medium text-gray-700">{profile.languages.join(', ')}</p>
                  </div>
                </div>
              )}

              {profile.responseTime && (
                <div className="flex items-center space-x-3">
                  <FiClock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 mb-0">Response Time</p>
                    <p className="font-medium text-gray-700">{profile.responseTime}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile CTA */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 mb-4">Need to update your information?</p>
          <button
            onClick={handleEditProfile}
            className="btn-primary"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}