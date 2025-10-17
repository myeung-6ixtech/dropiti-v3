'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usersAPI } from '@/lib/api-client';
import { availableLanguages, educationOptions, occupationOptions } from '@/types/user';
import {
  UserIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function OnboardingStepOne() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: user?.displayName || user?.name || '',
    location: user?.location || '',
    about: user?.about || '',
    education: user?.education || '',
    occupation: user?.occupation || '',
    languages: Array.isArray(user?.languages) ? user?.languages : [],
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function onNext() {
    try {
      setSaving(true);
      
      // Update user profile with form data
      await usersAPI.updateUser(user?.id || '', {
        display_name: form.name,
        location: form.location,
        about: form.about,
        education: form.education,
        occupation: form.occupation,
        languages: form.languages,
      });
      
      // Navigate to photo step
      router.push('/onboarding/photo');
    } catch (error) {
      console.error('Error updating profile:', error);
      // You might want to show a toast error here
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 mb-1">Step 1 of 2</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-0">Set up your profile</h1>
        <p className="text-gray-600">Tell us a bit about yourself to get started.</p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
        
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="form-label text-xs">
              <span className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-black" />
                Display name *
              </span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="form-input-sm"
              placeholder="Enter your name"
            />
            <p className="text-xs text-gray-500 mt-1">This is the name that will be visible to other users</p>
          </div>

          {/* Location */}
          <div>
            <label className="form-label text-xs">
              <span className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2 text-black" />
                Where are you based?
              </span>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="form-input-sm"
              placeholder="City, Country"
            />
            <p className="text-xs text-gray-500 mt-1">Help others understand your location</p>
          </div>

          {/* About */}
          <div>
            <label className="form-label text-xs">
              <span className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-black" />
                Tell us about yourself
              </span>
            </label>
            <textarea
              value={form.about}
              onChange={(e) => handleChange('about', e.target.value)}
              rows={4}
              className="form-textarea text-sm"
              placeholder="A short introduction for your profile"
            />
            <p className="text-xs text-gray-500 mt-1">Share your story and what makes you unique</p>
          </div>

          {/* Education */}
          <div>
            <label className="form-label text-xs">
              <span className="flex items-center">
                <AcademicCapIcon className="h-4 w-4 mr-2 text-black" />
                What is your education background?
              </span>
            </label>
            <select
              value={form.education}
              onChange={(e) => handleChange('education', e.target.value)}
              className="form-select text-sm"
            >
              <option value="">Select education level</option>
              {educationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Optional: Share your educational background</p>
          </div>

          {/* Occupation */}
          <div>
            <label className="form-label text-xs">
              <span className="flex items-center">
                <BriefcaseIcon className="h-4 w-4 mr-2 text-black" />
                What do you do?
              </span>
            </label>
            <select
              value={form.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
              className="form-select text-sm"
            >
              <option value="">Select occupation</option>
              {occupationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Optional: Tell us about your profession</p>
          </div>

          {/* Languages */}
          <div>
            <label className="form-label text-xs">
              <span className="flex items-center">
                <GlobeAltIcon className="h-4 w-4 mr-2 text-black" />
                Languages
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableLanguages.map((language) => (
                <label key={language} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.languages.includes(language)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleChange('languages', [...form.languages, language]);
                      } else {
                        handleChange('languages', form.languages.filter(l => l !== language));
                      }
                    }}
                    className="form-checkbox"
                  />
                  <span className="text-xs text-gray-700">{language}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Select all languages you can communicate in</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200">
          <button
            onClick={onNext}
            disabled={saving || !form.name.trim()}
            className="btn-primary disabled:opacity-50 w-full py-4 rounded-xl font-semibold text-base"
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6">You can update these anytime in your profile.</p>
    </div>
  );
}
