'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
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
import { educationOptions, maritalStatusOptions, availableLanguages } from '@/types';
import { User } from '@/types/user';
import ProfileImageUpload from '@/components/profile/ProfileImageUpload';
import ProfileLocationSelect from '@/components/profile/ProfileLocationSelect';
import ProfileOccupationSelect from '@/components/profile/ProfileOccupationSelect';
import {
  parseStoredLocation,
  parseStoredOccupation,
  resolveOccupationForSave,
} from '@/lib/profile-field-utils';
import { uploadProfilePhoto } from '@/lib/nhost-upload';

// ---------------------------------------------------------------------------
// Display name helpers
// ---------------------------------------------------------------------------

interface NameParts {
  firstName: string;
  middleName: string;
  lastName: string;
}

type DisplayNameMode = 'firstLast' | 'firstInitialLast' | 'lastInitialFirst' | 'fullName' | 'nickname';

function buildVariants(parts: NameParts): Record<Exclude<DisplayNameMode, 'nickname'>, string> {
  return {
    firstLast:        [parts.firstName, parts.lastName].filter(Boolean).join(' '),
    firstInitialLast: parts.firstName && parts.lastName
                        ? `${parts.firstName} ${parts.lastName[0]}.`
                        : '',
    lastInitialFirst: parts.lastName && parts.firstName
                        ? `${parts.lastName} ${parts.firstName[0]}.`
                        : '',
    fullName:         [parts.firstName, parts.middleName, parts.lastName].filter(Boolean).join(' '),
  };
}

function detectMode(displayName: string, parts: NameParts): DisplayNameMode {
  const variants = buildVariants(parts);
  for (const [mode, value] of Object.entries(variants) as [DisplayNameMode, string][]) {
    if (value && value === displayName) return mode;
  }
  return 'nickname';
}

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

export default function EditProfilePage() {
  const { user: authUser } = useAuth();
  const { locale, setLocale, t, isLoading: isLanguageLoading } = useLanguage();
  const { showToast } = useToast();
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

  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);
  const [occupationSelect, setOccupationSelect] = useState('');
  const [occupationOther, setOccupationOther] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameParts, setNameParts] = useState<NameParts>({ firstName: '', middleName: '', lastName: '' });
  const [displayNameMode, setDisplayNameMode] = useState<DisplayNameMode>('nickname');

  useEffect(() => {
    setTempProfile(profile);
  }, [profile]);

  // Load user data from API when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      if (authUser?.id) {
        try {
          setIsLoading(true);
          const response = await usersAPI.getUserByNhostUserId(authUser.id);
          
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
            
            const parts: NameParts = {
              firstName:  userData.first_name  || '',
              middleName: userData.middle_name || '',
              lastName:   userData.last_name   || '',
            };
            setNameParts(parts);
            setDisplayNameMode(detectMode(newProfile.displayName, parts));

            const parsedOccupation = parseStoredOccupation(userData.occupation);
            setOccupationSelect(parsedOccupation.select);
            setOccupationOther(parsedOccupation.other);
            newProfile.location = parseStoredLocation(userData.location);

            setProfile(newProfile);
            setTempProfile(newProfile);
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
          showToast('error', 'Failed to load profile data');
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
      showToast('error', 'You must be logged in to save changes');
      return;
    }

    // Validate required fields
    if (!tempProfile.displayName.trim()) {
      showToast('error', 'Display Name is required');
      return;
    }

    if (!tempProfile.about?.trim()) {
      showToast('error', 'About section is required');
      return;
    }

    try {
      setIsLoading(true);

      let finalPhotoUrl = tempProfile.avatar;

      // If there's a selected image file, upload via media catalog proxy
      if (selectedImageFile) {
        try {
          finalPhotoUrl = await uploadProfilePhoto(selectedImageFile);
        } catch (uploadError) {
          console.error('Profile Edit: Image upload error:', uploadError);
          showToast('error', `Failed to upload profile image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}. Please try again.`);
          return;
        }
      }

      // Prepare updates for the API
      const updates: Partial<User> = {
        display_name: tempProfile.displayName,
        photo_url: finalPhotoUrl,
        location: tempProfile.location,
        about: tempProfile.about,
        languages: tempProfile.languages,
        phone_number: tempProfile.phoneNumber
      };

      if (tempProfile.education) {
        updates.education = tempProfile.education;
      }
      const occupationToSave = resolveOccupationForSave(occupationSelect, occupationOther);
      if (occupationToSave) {
        updates.occupation = occupationToSave;
      }
      if (tempProfile.maritalStatus) {
        updates.marital_status = tempProfile.maritalStatus;
      }

      const updateResponse = await usersAPI.updateUser(authUser.id, updates);

      if (updateResponse.success) {
        // Update the profile with the final photo URL
        const updatedProfile = {
          ...tempProfile,
          avatar: finalPhotoUrl
        };
        
        setProfile(updatedProfile);
        setSelectedImageFile(null); // Clear the selected file
        
        showToast('success', 'Profile updated successfully!');
        
        // Redirect back to profile page after 2 seconds
        setTimeout(() => {
          router.push('/dashboard/profile');
        }, 2000);
      } else {
        throw new Error(updateResponse.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      showToast('error', error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedImageFile(null);
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
        <div className="flex items-center space-x-4 mb-0">
          <button
            onClick={() => router.push('/dashboard/profile')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-900" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-0">Edit Profile</h1>
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

      {/* Profile Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
        
        {/* Profile Image Upload */}
        <div className="flex justify-center mb-8">
          <ProfileImageUpload
            currentImageUrl={tempProfile.avatar}
            onImageUpdate={(newImageUrl, file) => {
              handleInputChange('avatar', newImageUrl);
              setSelectedImageFile(file || null);
            }}
            disabled={isLoading}
          />
        </div>
        
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
              onChange={(e) => {
                setDisplayNameMode('nickname');
                handleInputChange('displayName', e.target.value);
              }}
              className="form-input"
              placeholder="Enter your display name"
            />
            {/* Quick-select pills */}
            {(nameParts.firstName || nameParts.lastName) && (() => {
              const variants = buildVariants(nameParts);
              const pills: { mode: DisplayNameMode; label: string }[] = ([
                { mode: 'firstLast' as DisplayNameMode,        label: variants.firstLast },
                { mode: 'firstInitialLast' as DisplayNameMode, label: variants.firstInitialLast },
                { mode: 'lastInitialFirst' as DisplayNameMode, label: variants.lastInitialFirst },
                ...(nameParts.middleName && variants.fullName !== variants.firstLast
                  ? [{ mode: 'fullName' as DisplayNameMode, label: variants.fullName }]
                  : []),
                { mode: 'nickname' as DisplayNameMode, label: 'Nickname (custom)' },
              ] as { mode: DisplayNameMode; label: string }[]).filter(p => p.label);
              return (
                <div className="flex flex-wrap gap-2 mt-2">
                  {pills.map(({ mode, label }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setDisplayNameMode(mode);
                        if (mode !== 'nickname') {
                          handleInputChange('displayName', variants[mode as keyof typeof variants] ?? '');
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        displayNameMode === mode
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              );
            })()}
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
                {t('profile.languages')}
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

          {/* Preferred Language */}
          <div>
            <label className="form-label">
              <span className="flex items-center">
                <GlobeAltIcon className="h-4 w-4 mr-2 text-black" />
                {t('profile.preferredLanguage')}
              </span>
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              disabled={isLanguageLoading}
              className="form-select"
            >
              <option value="en">🇺🇸 English</option>
              <option value="zh-HK">🇭🇰 繁體中文 (Hong Kong)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">{t('profile.languageDescription')}</p>
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
          <ProfileOccupationSelect
            selectValue={occupationSelect}
            otherValue={occupationOther}
            onSelectChange={setOccupationSelect}
            onOtherChange={setOccupationOther}
            label={
              <span className="flex items-center">
                <BriefcaseIcon className="h-4 w-4 mr-2 text-black" />
                What is your occupation?
              </span>
            }
            selectClassName="form-select"
            inputClassName="form-input mt-2"
          />

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
          <ProfileLocationSelect
            value={tempProfile.location || ''}
            onChange={(value) => handleInputChange('location', value)}
            label={
              <span className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2 text-black" />
                Location
              </span>
            }
            selectClassName="form-select"
          />
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
