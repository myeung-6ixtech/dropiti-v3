'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { usersAPI } from '@/lib/api-client';
import { 
  FiUser, 
  FiShield, 
  FiSettings
} from 'react-icons/fi';
import { signIn } from 'next-auth/react';
import { SettingsHeader } from './_components/settings-header';
import { SettingsTabs } from './_components/settings-tabs';
import PhoneInput from '@/components/common/PhoneInput';

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
  const [authProvider, setAuthProvider] = useState<string>('firebase'); // Track auth provider
  
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
          console.log('Loading user settings for Firebase UID:', authUser.id);
          
          const response = await usersAPI.getUserByFirebaseUid(authUser.id);
          
          if (response.success && response.data) {
            const userData = response.data;
            console.log('User data received:', userData);
            
            // Store auth provider
            setAuthProvider(userData.auth_provider || 'firebase');
            
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

      console.log('Saving settings for Firebase UID:', authUser.id);
      
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

      // Call the update API using the firebase_uid directly
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
                  <button className="btn-primary px-4 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors">
                    {t('settings.updatePassword')}
                  </button>
                </div>
              </div>
            </div>

            {/* Google Account Linking Section */}
            <div className="bg-white rounded-lg p-6 mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Connected Accounts</h3>
                <p className="text-sm text-gray-600">Link your Google account for quick sign-in</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                {authProvider === 'google' ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <svg className="h-6 w-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">Google Account</p>
                        <p className="text-sm text-gray-600">{authUser?.email}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Connected
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <svg className="h-6 w-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">Google Account</p>
                          <p className="text-sm text-gray-600">Sign in faster with Google</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const result = await signIn('google', {
                              redirect: false,
                              callbackUrl: '/dashboard/settings',
                            });
                            
                            if (result?.ok) {
                              showToast('success', 'Google account linked successfully!');
                              setAuthProvider('google');
                              setTimeout(() => window.location.reload(), 1000);
                            } else {
                              showToast('error', 'Failed to link Google account. Please try again.');
                            }
                          } catch (error) {
                            console.error('Google linking error:', error);
                            showToast('error', 'An error occurred while linking your Google account.');
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Once connected, you&apos;ll be able to sign in using your Google account instead of entering your password.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Verification Section */}
            <div className="bg-white rounded-lg p-6 mt-6">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Phone Verification</h3>
                    <p className="text-sm text-gray-600">
                      Verify your phone number to unlock premium features and get a verified badge
                    </p>
                  </div>
                  {tempSettings.phone && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {tempSettings.phone ? 'Added' : 'Verified'}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                {tempSettings.phone ? (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <svg className="h-6 w-6 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">{areaCode} {tempSettings.phone}</p>
                        <p className="text-sm text-gray-600">Your phone number is on file</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={async () => {
                          showToast('info', 'Phone verification coming soon! This will enable SMS verification and a verified badge.');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Verify this number →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 mb-3">
                        <strong>Benefits of phone verification:</strong>
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                        <li>Get a &quot;Verified&quot; badge on your profile</li>
                        <li>Build trust with landlords/tenants</li>
                        <li>Access to premium features</li>
                        <li>Priority support and faster response times</li>
                      </ul>
                    </div>
                    
                    <PhoneInput
                      areaCode={areaCode}
                      phoneNumber={tempSettings.phone}
                      onAreaCodeChange={setAreaCode}
                      onPhoneNumberChange={(value) => handleInputChange('phone', value)}
                      required={false}
                      placeholder="1234 5678"
                      showLabel={false}
                    />
                    
                    <p className="text-xs text-gray-500">
                      Add your phone number above and save changes. You&apos;ll be able to verify it to get your badge.
                    </p>
                  </div>
                )}
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
