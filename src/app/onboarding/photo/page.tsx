'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usersAPI } from '@/lib/api-client';
import {
  buildProfileInputFromNhostUser,
  ensureUserProfile,
} from '@/lib/ensureUserProfile';
import ProfileImageUpload from '@/components/profile/ProfileImageUpload';

export default function OnboardingPhoto() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function resolveProfileNhostId(): Promise<string | null> {
    if (!user?.id) {
      showToast('error', 'You must be signed in to continue.');
      return null;
    }

    const ensureResult = await ensureUserProfile(
      buildProfileInputFromNhostUser({
        id: user.id,
        email: user.email,
        displayName: user.displayName || user.name,
        avatarUrl: user.photoUrl || user.avatar,
      }),
    );

    if (!ensureResult.ok) {
      showToast('error', ensureResult.error);
      return null;
    }

    return ensureResult.effectiveNhostUserId;
  }

  async function onFinish() {
    try {
      setSaving(true);

      const nhostUserId = await resolveProfileNhostId();
      if (!nhostUserId) return;

      let finalPhotoUrl = user?.photoUrl || '/images/Portrait_Placeholder.png';

      if (selectedImageFile) {
        try {
          const formData = new FormData();
          formData.append('file', selectedImageFile);
          formData.append('category', 'images');

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
          } else {
            throw new Error(uploadResult.error || 'Failed to upload image');
          }
        } catch (uploadError) {
          console.error('Onboarding: Image upload error:', uploadError);
          showToast(
            'error',
            uploadError instanceof Error
              ? uploadError.message
              : 'Failed to upload image. You can skip and add a photo later.',
          );
          return;
        }
      }

      const updateResponse = await usersAPI.updateUser(nhostUserId, {
        photo_url: finalPhotoUrl,
        onboarding_complete: true,
      });

      if (!updateResponse?.success) {
        showToast(
          'error',
          (updateResponse as { error?: string })?.error || 'Failed to complete onboarding. Please try again.',
        );
        return;
      }

      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error completing onboarding:', error);
      showToast('error', 'Failed to complete onboarding. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function onSkip() {
    try {
      setSaving(true);

      const nhostUserId = await resolveProfileNhostId();
      if (!nhostUserId) return;

      const updateResponse = await usersAPI.updateUser(nhostUserId, {
        onboarding_complete: true,
      });

      if (!updateResponse?.success) {
        showToast(
          'error',
          (updateResponse as { error?: string })?.error || 'Failed to complete onboarding. Please try again.',
        );
        return;
      }

      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error completing onboarding:', error);
      showToast('error', 'Failed to complete onboarding. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-xs text-gray-500 mb-1">Step 2 of 2</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-0">Add a profile photo</h1>
        <p className="text-gray-600">Upload a clear photo of yourself to complete your profile.</p>
      </div>

      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Photo</h2>

        <div className="flex justify-center mb-8">
          <ProfileImageUpload
            currentImageUrl={user?.photoUrl || '/images/Portrait_Placeholder.png'}
            onImageUpdate={(_newImageUrl, file) => {
              setSelectedImageFile(file || null);
            }}
            disabled={saving}
          />
        </div>

        <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200">
          <button
            onClick={onFinish}
            disabled={saving || !user?.id}
            className="btn-primary disabled:opacity-50 w-full py-4 rounded-xl font-semibold text-base"
          >
            {saving ? 'Finishing...' : 'Finish'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={saving || !user?.id}
            className="btn-secondary disabled:opacity-50 w-full py-4 rounded-xl font-semibold text-base"
          >
            Skip for now
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6">You can add or change your photo anytime in your profile settings.</p>
    </div>
  );
}
