'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usersAPI } from '@/lib/api-client';
import ProfileImageUpload from '@/components/profile/ProfileImageUpload';

export default function OnboardingPhoto() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function onFinish() {
    try {
      setSaving(true);

      let finalPhotoUrl = user?.photoUrl || '/images/Portrait_Placeholder.png';

      // If there's a selected image file, upload it to S3 first
      if (selectedImageFile) {
        try {          
          // Create FormData for the API request
          const formData = new FormData();
          formData.append('file', selectedImageFile);
          formData.append('category', 'images');
          
          // Upload to our S3 API route
          const uploadResponse = await fetch('/api/v1/upload/s3', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Upload failed');
          }
          
          const uploadResult = await uploadResponse.json();
          
          if (uploadResult.success && uploadResult.data) {
            finalPhotoUrl = uploadResult.data.url;
            console.log('Onboarding: Image uploaded successfully to:', finalPhotoUrl);
          } else {
            throw new Error(uploadResult.error || 'Failed to upload image');
          }
        } catch (uploadError) {
          console.error('Onboarding: Image upload error:', uploadError);
          // Continue with onboarding even if image upload fails
        }
      }

      // Mark onboarding as complete and update photo
      await usersAPI.updateUser(user?.id || '', {
        photo_url: finalPhotoUrl,
        onboarding_complete: true,
      });

      // Redirect to dashboard
      router.replace('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // You might want to show a toast error here
    } finally {
      setSaving(false);
    }
  }

  async function onSkip() {
    try {
      setSaving(true);

      // Mark onboarding as complete without photo
      await usersAPI.updateUser(user?.id || '', {
        onboarding_complete: true,
      });

      // Redirect to dashboard
      router.replace('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 mb-1">Step 2 of 2</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-0">Add a profile photo</h1>
        <p className="text-gray-600">Upload a clear photo of yourself to complete your profile.</p>
      </div>

      {/* Profile Photo Upload */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Photo</h2>
        
        <div className="flex justify-center mb-8">
          <ProfileImageUpload
            currentImageUrl={user?.photoUrl || '/images/Portrait_Placeholder.png'}
            onImageUpdate={(newImageUrl, file) => {
              setSelectedImageFile(file || null);
            }}
            disabled={saving}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={onFinish}
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Finishing...' : 'Finish'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={saving}
            className="btn-secondary disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6">You can add or change your photo anytime in your profile settings.</p>
    </div>
  );
}
