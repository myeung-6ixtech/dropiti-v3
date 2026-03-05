'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { usersAPI } from '@/lib/api-client';
import { nhost } from '@/lib/nhost';
import { 
  FiUser, 
  FiShield, 
  FiSettings
} from 'react-icons/fi';
import { SettingsHeader } from './_components/settings-header';
import { SettingsTabs } from './_components/settings-tabs';

// Area code options for supported regions
const AREA_CODES = [
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
];

interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  areaCode: string;
  preferences: {
    language: string;
    timezone: string;
    currency: string;
  };
}

// Phone number parsing function
const parsePhoneNumber = (phone: string) => {
  // Extract area code and number from existing phone
  const match = phone.match(/^(\+\d{1,3})\s*(.+)$/);
  if (match) {
    return { areaCode: match[1], number: match[2] };
  }
  return { areaCode: '+852', number: phone }; // Default fallback
};

// Phone validation function
const validatePhone = (phone: string, areaCode: string) => {
  const phoneRegex = {
    '+852': /^[0-9]{8}$/, // Hong Kong: 8 digits
    '+1': /^[0-9]{10}$/, // US: 10 digits
    '+86': /^[0-9]{11}$/, // China: 11 digits
    '+65': /^[0-9]{8}$/, // Singapore: 8 digits
    '+44': /^[0-9]{10,11}$/, // UK: 10-11 digits
    '+61': /^[0-9]{9}$/, // Australia: 9 digits
  };
  
  return phoneRegex[areaCode as keyof typeof phoneRegex]?.test(phone.replace(/\s/g, '')) || false;
};

export default function SettingsPage() {
  const { user: authUser } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [areaCode, setAreaCode] = useState('+852'); // Default to Hong Kong
  
  const [settings, setSettings] = useState<UserSettings>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'demo@example.com',
    phone: '1234 5678',
    areaCode: '+852',
    preferences: {
      language: 'English',
      timezone: 'Asia/Hong_Kong (UTC+8)',
      currency: 'HKD (Hong Kong Dollar)',
    },
  });

  const [tempSettings, setTempSettings] = useState<UserSettings>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    areaCode: '+852',
    preferences: {
      language: 'English',
      timezone: 'Asia/Hong_Kong (UTC+8)',
      currency: 'HKD (Hong Kong Dollar)',
    },
  });

  // Temporary language state for the language switcher
  const [tempLanguage, setTempLanguage] = useState(locale);

  // Security form state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load user settings from API when component mounts
  useEffect(() => {
    const loadUserSettings = async () => {
      if (authUser?.id) {
        try {
          setIsLoading(true);
          console.log('Loading user settings for Nhost user ID:', authUser.id);
          
          const response = await usersAPI.getUserByNhostUserId(authUser.id);
          
          if (response.success && response.data) {
            const userData = response.data;
            console.log('User data received:', userData);
            
            // Parse existing phone number
            const { areaCode: parsedAreaCode, number: phoneNumber } = parsePhoneNumber(userData.phone_number || '+852 1234 5678');
            
            // Handle missing fields gracefully with fallbacks - ensure all values are defined
            const newSettings: UserSettings = {
              firstName: userData.first_name || '',
              lastName: userData.last_name || '',
              email: userData.email || 'demo@example.com',
              phone: phoneNumber,
              areaCode: parsedAreaCode,
              preferences: {
                language: String(userData.preferences?.language || 'English'),
                timezone: String(userData.preferences?.timezone || 'Asia/Hong_Kong (UTC+8)'),
                currency: String(userData.preferences?.currency || 'HKD (Hong Kong Dollar)'),
              },
            };
            setAreaCode(parsedAreaCode); // Set the area code state
            setSettings(newSettings);
            setTempSettings(newSettings);
          } else {
            console.error('Failed to load user settings:', response.error);
            showToast('error', response.error || t('errors.settings.failedToLoad'));
            // Keep default settings if API fails
            console.log('Keeping default settings due to API failure');
          }
        } catch (error) {
          console.error('Failed to load user settings:', error);
          showToast('error', t('errors.settings.failedToLoad'));
          // Keep default settings if API fails
          console.log('Keeping default settings due to API error');
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('No auth user ID available');
        // Keep default settings if no auth user
      }
    };

    loadUserSettings();
  }, [authUser?.id, showToast]);

  // Update tempLanguage when locale changes
  useEffect(() => {
    setTempLanguage(locale);
  }, [locale]);

  // Update tempSettings when settings are loaded from API
  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);


  const handleInputChange = (field: keyof UserSettings, value: string | boolean | object) => {
    // Ensure the value is never undefined
    const safeValue = value === undefined ? '' : value;
    setTempSettings(prev => ({
      ...prev,
      [field]: safeValue
    }));
  };


  const handlePreferenceChange = (type: keyof typeof tempSettings.preferences, value: string) => {
    setTempSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: value
      }
    }));
  };

  const handleLanguageChange = (newLanguage: string) => {
    setTempLanguage(newLanguage);
  };

  const handleSecurityChange = (field: keyof typeof securityForm, value: string) => {
    setSecurityForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!authUser?.id) {
      showToast('error', t('errors.auth.unauthorized'));
      return;
    }

    // Validate phone number
    if (!validatePhone(tempSettings.phone, areaCode)) {
      showToast('error', t('forms.validation.phone'));
      return;
    }

    try {
      setIsLoading(true);

      console.log('Saving settings for Nhost user ID:', authUser.id);
      
      // Prepare updates for the API
      const updates: Record<string, unknown> = {
        first_name: tempSettings.firstName?.trim() || null,
        last_name: tempSettings.lastName?.trim() || null,
        phone_number: `${areaCode} ${tempSettings.phone}`.trim(), // Combine area code and phone
      };

      // Only add complex objects if they exist in the user data
      if (tempSettings.preferences) {
        // Map language code to language name
        const languageMap: Record<string, string> = {
          'en': 'English',
          'zh-HK': 'Traditional Chinese'
        };

        updates.preferences = {
          language: languageMap[tempLanguage] || tempSettings.preferences.language,
          timezone: tempSettings.preferences.timezone,
          currency: tempSettings.preferences.currency,
        };
      }

      console.log('Updating user with data:', updates);

      // Call the update API using the nhost_user_id directly
      const updateResponse = await usersAPI.updateUser(authUser.id, updates);

      if (updateResponse.success) {
        setSettings(tempSettings);
        
        // Update language if it changed
        if (tempLanguage !== locale) {
          await setLocale(tempLanguage);
        }
        
        showToast('success', t('success.settingsUpdated'));
      } else {
        throw new Error(updateResponse.error || t('errors.settings.failedToUpdate'));
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('error', error instanceof Error ? error.message : t('errors.settings.failedToSave'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setTempLanguage(locale);
  };

  const handlePasswordUpdate = async () => {
    if (!authUser?.id || !authUser?.email) {
      showToast('error', t('errors.auth.unauthorized'));
      return;
    }

    // Block Google OAuth users — they have no password
    if ((authUser as { auth_provider?: string }).auth_provider === 'google') {
      showToast('error', 'Password changes are not available for Google sign-in accounts.');
      return;
    }

    if (!securityForm.currentPassword) {
      showToast('error', t('settings.enterCurrentPassword'));
      return;
    }
    if (securityForm.newPassword.length < 8) {
      showToast('error', 'New password must be at least 8 characters.');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showToast('error', 'New passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // Verify current password by re-authenticating
      const { error: signInError } = await nhost.auth.signIn({
        email: authUser.email,
        password: securityForm.currentPassword,
      });

      if (signInError) {
        showToast('error', 'Current password is incorrect.');
        return;
      }

      // Change to the new password
      const { error: changeError } = await nhost.auth.changePassword({
        newPassword: securityForm.newPassword,
      });

      if (changeError) {
        showToast('error', changeError.message || 'Failed to update password.');
        return;
      }

      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('success', 'Password updated successfully.');
    } catch (err) {
      console.error('Password update error:', err);
      showToast('error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: t('settings.profile'), icon: FiUser },
    { id: 'security', name: t('settings.security'), icon: FiShield },
    { id: 'preferences', name: t('settings.preferences'), icon: FiSettings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('settings.personalInformation')}</h2>
              <p className="text-gray-600">{t('settings.updatePersonalDetails')}</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="form-label">{t('settings.firstName')}</label>
                    <input
                      type="text"
                      value={tempSettings.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">{t('settings.lastName')}</label>
                    <input
                      type="text"
                      value={tempSettings.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">{t('profile.email')}</label>
                    <input
                      type="email"
                      value={tempSettings.email}
                      disabled
                      className="form-input text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">{t('settings.emailCannotBeChanged')}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">{t('profile.phoneNumber')}</label>
                    <div className="flex space-x-2">
                      <select
                        value={areaCode}
                        onChange={(e) => setAreaCode(e.target.value)}
                        className="form-select max-w-[100px] text-sm"
                      >
                        {AREA_CODES.map((area) => (
                          <option key={area.code} value={area.code}>
                            {area.flag} {area.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={tempSettings.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="form-input text-gray-500"
                        placeholder={t('settings.phonePlaceholder')}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {t('settings.phoneInstructions')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className={`btn-secondary px-4 py-2 rounded-md transition-colors font-medium ${
                    isLoading 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`btn-primary px-4 py-2 text-white rounded-md transition-colors font-medium ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('settings.saving')}
                    </div>
                  ) : (
                    t('settings.saveChanges')
                  )}
                </button>
              </div>
            </div>
          </div>
        );


      case 'security':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('settings.securitySettings')}</h2>
              <p className="text-gray-600">{t('settings.manageAccountSecurity')}</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="form-label">{t('settings.currentPassword')}</label>
                    <input
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                      className="form-input"
                      placeholder={t('settings.enterCurrentPassword')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">{t('settings.newPassword')}</label>
                    <input
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                      className="form-input"
                      placeholder={t('settings.enterNewPassword')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">{t('auth.confirmPassword')}</label>
                    <input
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                      className="form-input"
                      placeholder={t('settings.confirmNewPassword')}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={isLoading}
                    className={`btn-primary px-4 py-2 rounded-md font-medium transition-colors ${
                      isLoading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      t('settings.updatePassword')
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('settings.preferences')}</h2>
              <p className="text-gray-600">{t('settings.customizeExperience')}</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="form-label">{t('settings.language')}</label>
                    <select 
                      value={tempLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      disabled={isLoading}
                      className="form-select"
                    >
                      <option value="en">🇺🇸 English</option>
                      <option value="zh-HK">🇭🇰 繁體中文 (Hong Kong)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">{t('settings.timezone')}</label>
                    <select 
                      value={tempSettings.preferences.timezone}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                      className="form-select"
                    >
                      <option value="Asia/Hong_Kong (UTC+8)">Asia/Hong_Kong (UTC+8)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">{t('settings.currency')}</label>
                    <select 
                      value={tempSettings.preferences.currency}
                      onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                      className="form-select"
                    >
                      <option value="HKD (Hong Kong Dollar)">HKD (Hong Kong Dollar)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className={`btn-secondary px-4 py-2 rounded-md transition-colors font-medium ${
                    isLoading 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`btn-primary px-4 py-2 text-white rounded-md transition-colors font-medium ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('settings.saving')}
                    </div>
                  ) : (
                    t('settings.saveChanges')
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SettingsHeader
          title={t('navigation.settings')}
          description={t('settings.manageAccountSettings')}
        />
        
        <SettingsTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
