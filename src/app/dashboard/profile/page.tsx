'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usersAPI } from '@/lib/api-client';
import { 
  UserIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  HeartIcon,
  MapPinIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import DropitiPassport2 from '@/components/common/DropitiPassport2';
import { educationOptions, occupationOptions, maritalStatusOptions, availableLanguages, UpdateUserInput } from '@/types';

interface UserProfile {
  name: string;
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
  stats: {
    responseRate: number;
    avgResponseTime: string;
    totalProperties: number;
    totalGuests: number;
  };
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    email: 'sarah.johnson@email.com',
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
    stats: {
      responseRate: 98,
      avgResponseTime: '1h',
      totalProperties: 5,
      totalGuests: 47
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setTempProfile(profile);
  }, [profile]);

  // Load user data from API when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      if (authUser?.id) {
        try {
          setIsLoading(true);
          // For now, we'll use the email to identify the user since NextAuth doesn't have firebase_uid
          // In a real implementation, you'd need to link NextAuth with your user database
          const response = await usersAPI.getUserByFirebaseUid(authUser.id);
          
          if (response.success && response.data) {
            const userData = response.data;
            const newProfile: UserProfile = {
              name: userData.display_name || 'Unknown User',
              avatar: userData.photo_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
              email: userData.email || '',
              location: userData.location || '',
              joinDate: userData.user_since ? new Date(userData.user_since).toLocaleDateString() : '',
              verified: userData.verified || false,
              rating: userData.rating || 0,
              reviewCount: userData.review_count || 0,
              about: userData.about || '',
              languages: userData.languages || [],
              responseTime: userData.response_time || 'Unknown',
              education: userData.education || '',
              occupation: userData.occupation || '',
              maritalStatus: userData.marital_status || '',
              stats: {
                responseRate: userData.response_rate || 0,
                avgResponseTime: userData.avg_response_time || 'Unknown',
                totalProperties: userData.total_properties || 0,
                totalGuests: userData.total_guests || 0
              }
            };
            setProfile(newProfile);
            setTempProfile(newProfile);
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

  const handleInputChange = (field: keyof UserProfile, value: string | string[]) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setTempProfile(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleSave = async () => {
    if (!authUser?.id) {
      setSaveMessage({
        type: 'error',
        message: 'You must be logged in to save changes'
      });
      return;
    }

    try {
      setIsLoading(true);
      setSaveMessage(null);

      // First get the current user to get the user ID
      // For now, we'll use the auth user ID directly since we don't have firebase_uid
      // In a real implementation, you'd need to link NextAuth with your user database
      const userResponse = await usersAPI.getUserByFirebaseUid(authUser.id);
      
      if (!userResponse.success || !userResponse.data) {
        throw new Error('Failed to get user data');
      }

      const userId = userResponse.data.id;

      // Prepare updates for the API
      const updates: UpdateUserInput = {
        display_name: tempProfile.name,
        photo_url: tempProfile.avatar,
        location: tempProfile.location,
        about: tempProfile.about,
        languages: tempProfile.languages,
        education: tempProfile.education,
        occupation: tempProfile.occupation,
        marital_status: tempProfile.maritalStatus,
        response_time: tempProfile.responseTime,
        rating: tempProfile.rating,
        review_count: tempProfile.reviewCount,
        response_rate: tempProfile.stats.responseRate,
        avg_response_time: tempProfile.stats.avgResponseTime,
        total_properties: tempProfile.stats.totalProperties,
        total_guests: tempProfile.stats.totalGuests
      };

      // Call the update API
      const updateResponse = await usersAPI.updateUser(userId, updates);

      if (updateResponse.success) {
        setProfile(tempProfile);
        setIsEditing(false);
        setSaveMessage({
          type: 'success',
          message: 'Profile updated successfully!'
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        throw new Error(updateResponse.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save profile'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
    setSaveMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Customize your Dropiti Passport and manage your profile information</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800">Loading profile data...</span>
          </div>
        </div>
      )}

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

      {/* Dropiti Passport Display - Above the form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <EyeIcon className="h-5 w-5 mr-2 text-blue-600" />
            Your Dropiti Passport
          </h2>
          <span className="text-sm text-gray-500">Live Preview</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          This is how your Dropiti Passport will appear to others. The information you fill out below will be reflected here in real-time.
        </p>
        <div className="bg-gray-50 rounded-lg p-4">
          <DropitiPassport2 user={tempProfile} />
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  isLoading 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* About Yourself */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-blue-600" />
                Tell me About Yourself?
              </span>
            </label>
            <textarea
              value={tempProfile.about || ''}
              onChange={(e) => handleInputChange('about', e.target.value)}
              disabled={!isEditing}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Share a bit about yourself, your interests, and what makes you unique..."
            />
            <p className="text-xs text-gray-500 mt-1">This will be displayed on your public profile</p>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <GlobeAltIcon className="h-4 w-4 mr-2 text-blue-600" />
                Languages you speak?
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map((language) => (
                <button
                  key={language}
                  onClick={() => isEditing && handleLanguageToggle(language)}
                  disabled={!isEditing}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tempProfile.languages.includes(language)
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  } ${
                    !isEditing ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Select all languages you can communicate in</p>
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <AcademicCapIcon className="h-4 w-4 mr-2 text-green-600" />
                What is your education level?
              </span>
            </label>
            <select
              value={tempProfile.education || ''}
              onChange={(e) => handleInputChange('education', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select education level</option>
              {educationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <BriefcaseIcon className="h-4 w-4 mr-2 text-purple-600" />
                What is your occupation?
              </span>
            </label>
            <select
              value={tempProfile.occupation || ''}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select occupation</option>
              {occupationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Marital Status */}
          <div>
            <label className="flex items-center">
              <HeartIcon className="h-4 w-4 mr-2 text-pink-600" />
              What is your marital status?
            </label>
            <select
              value={tempProfile.maritalStatus || ''}
              onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select marital status</option>
              {maritalStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2 text-red-600" />
                Location
              </span>
            </label>
            <input
              type="text"
              value={tempProfile.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Enter your city and country"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
