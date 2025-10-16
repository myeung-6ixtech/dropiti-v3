'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usersAPI } from '@/lib/api-client';
import InputField from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import MultiSelect from '@/components/form/MultiSelect';
import Label from '@/components/form/Label';
import { availableLanguages } from '@/types/user';

const LANGUAGE_OPTIONS = availableLanguages.map(lang => ({
  value: lang,
  text: lang,
  selected: false
}));

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
    <div className="space-y-6">
      <header className="mb-2">
        <p className="text-xs text-gray-500 mb-1">Step 1 of 2</p>
        <h1 className="text-xl font-semibold text-gray-900 mb-0">Set up your profile</h1>
        <p className="text-xs text-gray-500">Tell us a bit about yourself.</p>
      </header>

      <div>
        <Label htmlFor="name">Your name</Label>
        <InputField
          id="name"
          placeholder="Enter your name"
          defaultValue={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="location">Where are you based?</Label>
        <InputField
          id="location"
          placeholder="City, Country"
          defaultValue={form.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="about">Tell us about yourself</Label>
        <TextArea
          placeholder="A short introduction for your profile"
          rows={4}
          value={form.about}
          onChange={(value) => handleChange('about', value)}
        />
      </div>

      <div>
        <Label htmlFor="education">What is your education background?</Label>
        <InputField
          id="education"
          placeholder="e.g. BSc in Computer Science"
          defaultValue={form.education}
          onChange={(e) => handleChange('education', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="occupation">What do you do?</Label>
        <InputField
          id="occupation"
          placeholder="e.g. Product Manager"
          defaultValue={form.occupation}
          onChange={(e) => handleChange('occupation', e.target.value)}
        />
      </div>

      <MultiSelect
        label="Languages"
        options={LANGUAGE_OPTIONS}
        defaultSelected={form.languages}
        onChange={(vals) => handleChange('languages', vals)}
      />

      <button
        onClick={onNext}
        disabled={saving || !form.name.trim()}
        className="auth-button"
      >
        {saving ? 'Saving…' : 'Continue'}
      </button>

      <p className="text-xs text-gray-500 text-center">You can update these anytime in your profile.</p>
    </div>
  );
}
