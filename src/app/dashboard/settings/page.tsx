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
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  areaCode: string;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappAreaCode: string;
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
  const [authProvider, setAuthProvider] = useState<string>('email'); // Track auth provider
  
  const [settings, setSettings] = useState<UserSettings>({
    firstName: 'John',
    middleName: '',
    lastName: 'Doe',
    email: 'demo@example.com',
    phone: '1234 5678',
    areaCode: '+852',
    whatsappEnabled: false,
    whatsappNumber: '',
    whatsappAreaCode: '+852',
    preferences: {
      language: 'English',
      timezone: 'Asia/Hong_Kong (UTC+8)',
      currency: 'HKD (Hong Kong Dollar)',
    },
  });

  const [tempSettings, setTempSettings] = useState<UserSettings>({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    areaCode: '+852',
    whatsappEnabled: false,
    whatsappNumber: '',
    whatsappAreaCode: '+852',
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
            
            // Store auth provider
            setAuthProvider(userData.auth_provider || 'firebase');
            
            // Parse existing phone number
            const { areaCode: parsedAreaCode, number: phoneNumber } = parsePhoneNumber(userData.phone_number || '+852 1234 5678');
            
            // Parse WhatsApp number
            const { areaCode: parsedWhatsappAreaCode, number: whatsappNumber } =
              parsePhoneNumber(userData.whatsapp_number || '');

            // Handle missing fields gracefully with fallbacks - ensure all values are defined
            const newSettings: UserSettings = {
              firstName: userData.first_name || '',
              middleName: userData.middle_name || '',
              lastName: userData.last_name || '',
              email: userData.email || 'demo@example.com',
              phone: phoneNumber,
              areaCode: parsedAreaCode,
              whatsappEnabled: userData.notification_settings?.whatsapp === true,
              whatsappNumber: userData.whatsapp_number ? whatsappNumber : '',
              whatsappAreaCode: userData.whatsapp_number ? parsedWhatsappAreaCode : '+852',
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
            const errMsg =
              !response.success && 'error' in response
                ? response.error
                : t('errors.settings.failedToLoad');
            console.error('Failed to load user settings:', errMsg);
            showToast('error', errMsg);
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
        middle_name: tempSettings.middleName?.trim() || null,
        last_name: tempSettings.lastName?.trim() || null,
        phone_number: `${areaCode} ${tempSettings.phone}`.trim(),
        whatsapp_number: tempSettings.whatsappEnabled && tempSettings.whatsappNumber.trim()
          ? `${tempSettings.whatsappAreaCode} ${tempSettings.whatsappNumber}`.trim()
          : null,
        notification_settings: {
          whatsapp: tempSettings.whatsappEnabled,
        },
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
                    <label className="form-label">Middle Name <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="text"
                      value={tempSettings.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                      className="form-input"
                      placeholder="e.g. James"
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

                {/* WhatsApp Notifications */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.553 4.113 1.52 5.845L.057 23.535a.5.5 0 00.607.607l5.693-1.463A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.524-5.198-1.433l-.372-.22-3.88.998 1.017-3.77-.242-.388A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                        </svg>
                        <p className="font-medium text-gray-900 text-sm mb-0">WhatsApp Notifications</p>
                        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full font-medium">Coming soon</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-7">
                        Receive booking updates and enquiries via WhatsApp.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={tempSettings.whatsappEnabled}
                      onClick={() => handleInputChange('whatsappEnabled', !tempSettings.whatsappEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        tempSettings.whatsappEnabled ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          tempSettings.whatsappEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {tempSettings.whatsappEnabled && (
                    <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-100 space-y-3">
                      <p className="text-xs text-gray-600">
                        Enter the WhatsApp number where you want to receive notifications. This number is private and will never be shown to other users.
                      </p>
                      <div className="flex space-x-2">
                        <select
                          value={tempSettings.whatsappAreaCode}
                          onChange={(e) => handleInputChange('whatsappAreaCode', e.target.value)}
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
                          value={tempSettings.whatsappNumber}
                          onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                          className="form-input"
                          placeholder="e.g. 9876 5432"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Leave blank to use your contact number above.
                      </p>
                    </div>
                  )}
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

            {/* Sign-in Method Section */}
            <div className="bg-white rounded-lg p-6 mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Sign-in Method</h3>
                <p className="text-sm text-gray-600">How you currently access your account</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                {authProvider === 'google' ? (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <svg className="h-6 w-6 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900 mb-0">Google</p>
                      <p className="text-sm text-gray-500 mb-0">{authUser?.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="h-6 w-6 flex-shrink-0 flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-0">Email &amp; Password</p>
                      <p className="text-sm text-gray-500 mb-0">{authUser?.email}</p>
                    </div>
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
