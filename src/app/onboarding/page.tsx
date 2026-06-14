'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usersAPI } from '@/lib/api-client';
import {
  buildProfileInputFromNhostUser,
  ensureUserProfile,
} from '@/lib/ensureUserProfile';
import { availableLanguages, educationOptions } from '@/types/user';
import ProfileLocationSelect from '@/components/profile/ProfileLocationSelect';
import ProfileOccupationSelect from '@/components/profile/ProfileOccupationSelect';
import {
  parseStoredLocation,
  parseStoredOccupation,
  resolveOccupationForSave,
} from '@/lib/profile-field-utils';
import {
  UserIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

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

export default function OnboardingStepOne() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: user?.displayName || user?.name || '',
    location: parseStoredLocation(user?.location),
    about: user?.about || '',
    education: user?.education || '',
    languages: Array.isArray(user?.languages) ? user.languages : [],
  });
  const initialOccupation = parseStoredOccupation(user?.occupation);
  const [occupationSelect, setOccupationSelect] = useState(initialOccupation.select);
  const [occupationOther, setOccupationOther] = useState(initialOccupation.other);
  const [saving, setSaving] = useState(false);
  const [profileEnsuring, setProfileEnsuring] = useState(false);
  const [profileNhostId, setProfileNhostId] = useState<string | null>(user?.id ?? null);
  const [nameParts, setNameParts] = useState<NameParts>({ firstName: '', middleName: '', lastName: '' });
  const [displayNameMode, setDisplayNameMode] = useState<DisplayNameMode>('nickname');

  useEffect(() => {
    if (!user?.id || authLoading) return;

    let cancelled = false;
    setProfileEnsuring(true);

    ensureUserProfile(
      buildProfileInputFromNhostUser({
        id: user.id,
        email: user.email,
        displayName: user.displayName || user.name,
        avatarUrl: user.photoUrl || user.avatar,
      }),
    )
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setProfileNhostId(result.effectiveNhostUserId);
          const d = result.data;
          const parts: NameParts = {
            firstName:  d.first_name  || '',
            middleName: d.middle_name || '',
            lastName:   d.last_name   || '',
          };
          setNameParts(parts);
          const currentName = d.display_name || user.displayName || user.name || '';
          setDisplayNameMode(detectMode(currentName, parts));
          if (currentName) {
            setForm((prev) => ({ ...prev, name: currentName }));
          }
          const parsedLocation = parseStoredLocation(d.location);
          const parsedOccupation = parseStoredOccupation(d.occupation);
          setForm((prev) => ({
            ...prev,
            location: parsedLocation,
            about: d.about || prev.about,
            education: d.education || prev.education,
          }));
          setOccupationSelect(parsedOccupation.select);
          setOccupationOther(parsedOccupation.other);
        } else {
          showToast('error', result.error);
        }
      })
      .catch(() => {
        if (!cancelled) {
          showToast('error', 'Could not set up your profile. Please refresh and try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setProfileEnsuring(false);
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  const handleChange = (key: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function onNext() {
    if (!user?.id) {
      showToast('error', 'You must be signed in to continue.');
      return;
    }

    try {
      setSaving(true);

      const ensureResult = await ensureUserProfile(
        buildProfileInputFromNhostUser({
          id: user.id,
          email: user.email,
          displayName: form.name || user.displayName || user.name,
          avatarUrl: user.photoUrl || user.avatar,
        }),
      );

      if (!ensureResult.ok) {
        showToast('error', ensureResult.error);
        return;
      }

      const nhostUserId = ensureResult.effectiveNhostUserId;
      setProfileNhostId(nhostUserId);

      const updateResponse = await usersAPI.updateUser(nhostUserId, {
        display_name: form.name,
        location: form.location,
        about: form.about,
        education: form.education,
        occupation: resolveOccupationForSave(occupationSelect, occupationOther),
        languages: form.languages,
      });

      if (!updateResponse?.success) {
        showToast(
          'error',
          (updateResponse as { error?: string })?.error || 'Failed to save your profile. Please try again.',
        );
        return;
      }

      router.push('/onboarding/photo');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('error', 'Failed to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const isBusy = saving || profileEnsuring || authLoading;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-xs text-gray-500 mb-1">Step 1 of 2</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-0">Set up your profile</h1>
        <p className="text-gray-600">Tell us a bit about yourself to get started.</p>
      </div>

      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

        <div className="space-y-6">
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
              onChange={(e) => {
                setDisplayNameMode('nickname');
                handleChange('name', e.target.value);
              }}
              className="form-input-sm"
              placeholder="Enter your name"
            />
            {(nameParts.firstName || nameParts.lastName) && (() => {
              const variants = buildVariants(nameParts);
              const pills: { mode: DisplayNameMode; label: string }[] = ([
                { mode: 'firstLast' as DisplayNameMode,        label: variants.firstLast },
                { mode: 'firstInitialLast' as DisplayNameMode, label: variants.firstInitialLast },
                { mode: 'lastInitialFirst' as DisplayNameMode, label: variants.lastInitialFirst },
                ...(nameParts.middleName && variants.fullName !== variants.firstLast
                  ? [{ mode: 'fullName' as DisplayNameMode, label: variants.fullName }]
                  : []),
                { mode: 'nickname' as DisplayNameMode, label: 'Nickname' },
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
                          handleChange('name', variants[mode as keyof typeof variants] ?? '');
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

          <ProfileLocationSelect
            value={form.location}
            onChange={(value) => handleChange('location', value)}
            label={
              <span className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2 text-black" />
                Where are you based?
              </span>
            }
            helperText="Help others understand your location"
          />

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

          <ProfileOccupationSelect
            selectValue={occupationSelect}
            otherValue={occupationOther}
            onSelectChange={setOccupationSelect}
            onOtherChange={setOccupationOther}
            label={
              <span className="flex items-center">
                <BriefcaseIcon className="h-4 w-4 mr-2 text-black" />
                What do you do?
              </span>
            }
            helperText="Optional: Tell us about your profession"
          />

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

        <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200">
          <button
            onClick={onNext}
            disabled={isBusy || !form.name.trim() || !profileNhostId}
            className="btn-primary disabled:opacity-50 w-full py-4 rounded-xl font-semibold text-base"
          >
            {saving ? 'Saving...' : profileEnsuring ? 'Preparing...' : 'Continue'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6">You can update these anytime in your profile.</p>
    </div>
  );
}
