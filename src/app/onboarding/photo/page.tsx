'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usersAPI } from '@/lib/api-client';
import Label from '@/components/form/Label';

export default function OnboardingPhoto() {
  const { user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function onFinish() {
    try {
      setSaving(true);

      // For now, we'll skip the actual file upload and just mark onboarding as complete
      // In the future, you can implement actual file upload here
      // Example: if (file) { await usersAPI.uploadAvatar(file); }

      // Mark onboarding as complete
      await usersAPI.updateUser(user?.id || '', {
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
    <div className="space-y-6">
      <header className="mb-2">
        <p className="text-xs text-gray-500 mb-1">Step 2 of 2</p>
        <h1 className="text-xl font-semibold text-gray-900 mb-0">Add a profile photo</h1>
        <p className="text-xs text-gray-500">Upload a clear photo of yourself.</p>
      </header>

      <div>
        <Label htmlFor="profile-image">Profile image</Label>
        <input
          id="profile-image"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-sm placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-sm placeholder:text-gray-400"
        />
        <p className="mt-1 text-xs text-gray-500">JPG or PNG, up to 5MB.</p>
      </div>

      {file && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Selected file:</p>
          <p className="text-sm font-medium text-gray-900">{file.name}</p>
          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      <button
        onClick={onFinish}
        disabled={saving}
        className="auth-button"
      >
        {saving ? 'Finishing…' : 'Finish'}
      </button>

      <button
        type="button"
        onClick={onSkip}
        disabled={saving}
        className="auth-button-secondary"
      >
        Skip for now
      </button>

      <p className="text-xs text-gray-500 text-center">You can add or change your photo anytime in your profile settings.</p>
    </div>
  );
}
