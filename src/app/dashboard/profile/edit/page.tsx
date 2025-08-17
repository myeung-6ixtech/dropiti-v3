'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { usersAPI } from '@/lib/api-client';
import { 
  UserIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  HeartIcon,
  MapPinIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { educationOptions, occupationOptions, maritalStatusOptions, availableLanguages } from '@/types';
import { User } from '@/types/user';

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
    totalGuests: number;
  };
}

export default function EditProfilePage() {
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
      totalGuests: 47
    }
  });

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
                totalGuests: 0
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

    // Validate required fields
    if (!tempProfile.displayName.trim()) {
      setSaveMessage({
        type: 'error',
        message: 'Display Name is required'
      });
      return;
    }

    if (!tempProfile.about?.trim()) {
      setSaveMessage({
        type: 'error',
        message: 'About section is required'
      });
      return;
    }

    try {
      setIsLoading(true);
      setSaveMessage(null);

      // Prepare updates for the API
      const updates: Partial<User> = {
        display_name: tempProfile.displayName,
        photo_url: tempProfile.avatar,
        location: tempProfile.location,
        about: tempProfile.about,
        languages: tempProfile.languages,
        phone_number: tempProfile.phoneNumber
      };

      if (tempProfile.education) {
        updates.education = tempProfile.education;
      }
      if (tempProfile.occupation) {
        updates.occupation = tempProfile.occupation;
      }
      if (tempProfile.maritalStatus) {
        updates.marital_status = tempProfile.maritalStatus;
      }

      const updateResponse = await usersAPI.updateUser(authUser.id, updates);

      if (updateResponse.success) {
        setProfile(tempProfile);
        setSaveMessage({
          type: 'success',
          message: 'Profile updated successfully!'
        });
        
        // Redirect back to profile page after 2 seconds
        setTimeout(() => {
          router.push('/dashboard/profile');
        }, 2000);
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
    router.push('/dashboard/profile');
  };

  if (isLoading && !profile.displayName) {
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.push('/dashboard/profile')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        </div>
        <p className="text-gray-600">Update your profile information and preferences</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
            <span className="text-gray-800">Saving profile changes...</span>
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

      {/* Profile Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
        
        <div className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="form-label">
              <span className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-black" />
                Display Name *
              </span>
            </label>
            <input
              type="text"
              value={tempProfile.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className="form-input"
              placeholder="Enter your display name"
            />
            <p className="text-xs text-gray-500 mt-1">This is the name that will be visible to other users</p>
          </div>

          {/* About */}
          <div>
            <label className="form-label">
              <span className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-black" />
                About You *
              </span>
            </label>
            <textarea
              value={tempProfile.about || ''}
              onChange={(e) => handleInputChange('about', e.target.value)}
              rows={4}
              className="form-textarea"
              placeholder="Tell others about yourself, your experience, and what makes you a great host or tenant"
            />
            <p className="text-xs text-gray-500 mt-1">Share your story and what makes you unique</p>
          </div>

          {/* Languages */}
          <div>
            <label className="form-label">
              <span className="flex items-center">
                <GlobeAltIcon className="h-4 w-4 mr-2 text-black" />
                Languages You Speak
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableLanguages.map((language) => (
                <label key={language} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={tempProfile.languages.includes(language)}
                    onChange={() => handleLanguageToggle(language)}
                    className="form-checkbox"
                  />
                  <span className="text-sm text-gray-700">{language}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Select all languages you can communicate in</p>
          </div>

          {/* Education */}
          <div>
            <label className="form-label">
              <span className="flex items-center">
                <AcademicCapIcon className="h-4 w-4 mr-2 text-black" />
                What is your highest level of education?
              </span>
            </label>
            <select
              value={tempProfile.education || ''}
              onChange={(e) => handleInputChange('education', e.target.value)}
              className="form-select"
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
            <label className="form-label">
              <span className="flex items-center">
                <BriefcaseIcon className="h-4 w-4 mr-2 text-black" />
                What is your occupation?
              </span>
            </label>
            <select
              value={tempProfile.occupation || ''}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              className="form-select"
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
            <label className="form-label">
              <span className="flex items-center">
                <HeartIcon className="h-4 w-4 mr-2 text-black" />
                What is your marital status?
              </span>
            </label>
            <select
              value={tempProfile.maritalStatus || ''}
              onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
              className="form-select"
            >
              <option value="">Select marital status</option>
              {maritalStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label className="form-label">
              <span className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-black" />
                Phone Number
              </span>
            </label>
            <input
              type="text"
              value={tempProfile.phoneNumber || ''}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="form-input"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Response Time */}
          <div>
            <label className="form-label">
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-2 text-black" />
                Typical Response Time
              </span>
            </label>
            <select
              value={tempProfile.responseTime || ''}
              onChange={(e) => handleInputChange('responseTime', e.target.value)}
              className="form-select"
            >
              <option value="">Select response time</option>
              <option value="Within 1 hour">Within 1 hour</option>
              <option value="Within 2 hours">Within 2 hours</option>
              <option value="Within 4 hours">Within 4 hours</option>
              <option value="Within 24 hours">Within 24 hours</option>
              <option value="Within 48 hours">Within 48 hours</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">How quickly do you typically respond to messages?</p>
          </div>

          {/* Location */}
          <div>
            <label className="form-label">
              <span className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2 text-black" />
                Location
              </span>
            </label>
            <input
              type="text"
              value={tempProfile.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="form-input"
              placeholder="Enter your city and country"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="btn-primary disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
