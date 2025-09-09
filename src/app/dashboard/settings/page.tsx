'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usersAPI } from '@/lib/api-client';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  CogIcon
} from '@heroicons/react/24/outline';

interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
  };
}

export default function SettingsPage() {
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState<UserSettings>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'demo@example.com',
    phone: '+852 1234 5678',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    preferences: {
      language: 'English',
      timezone: 'Asia/Hong_Kong (UTC+8)',
      currency: 'HKD (Hong Kong Dollar)',
    },
  });

  const [tempSettings, setTempSettings] = useState<UserSettings>(settings);

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
            
            // Handle missing fields gracefully with fallbacks - ensure all values are defined
            const newSettings: UserSettings = {
              firstName: userData.first_name || userData.display_name?.split(' ')[0] || 'John',
              lastName: userData.last_name || userData.display_name?.split(' ').slice(1).join(' ') || 'Doe',
              email: userData.email || 'demo@example.com',
              phone: userData.phone_number || '+852 1234 5678',
              notifications: {
                email: Boolean(userData.notification_settings?.email ?? true),
                push: Boolean(userData.notification_settings?.push ?? true),
                sms: Boolean(userData.notification_settings?.sms ?? false),
              },
              preferences: {
                language: String(userData.preferences?.language || 'English'),
                timezone: String(userData.preferences?.timezone || 'Asia/Hong_Kong (UTC+8)'),
                currency: String(userData.preferences?.currency || 'HKD (Hong Kong Dollar)'),
              },
            };
            setSettings(newSettings);
            setTempSettings(newSettings);
          } else {
            console.error('Failed to load user settings:', response.error);
            showToast('error', response.error || 'Failed to load settings data');
            // Keep default settings if API fails
            console.log('Keeping default settings due to API failure');
          }
        } catch (error) {
          console.error('Failed to load user settings:', error);
          showToast('error', 'Failed to load settings data');
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
  }, [authUser?.id]);

  useEffect(() => {
    // Ensure all values are defined before setting tempSettings
    const safeSettings = {
      firstName: String(settings.firstName || ''),
      lastName: String(settings.lastName || ''),
      email: String(settings.email || ''),
      phone: String(settings.phone || ''),
      notifications: {
        email: Boolean(settings.notifications.email),
        push: Boolean(settings.notifications.push),
        sms: Boolean(settings.notifications.sms),
      },
      preferences: {
        language: String(settings.preferences.language || ''),
        timezone: String(settings.preferences.timezone || ''),
        currency: String(settings.preferences.currency || ''),
      },
    };
    setTempSettings(safeSettings);
  }, [settings]);

  const handleInputChange = (field: keyof UserSettings, value: string | boolean | object) => {
    // Ensure the value is never undefined
    const safeValue = value === undefined ? '' : value;
    setTempSettings(prev => ({
      ...prev,
      [field]: safeValue
    }));
  };

  const handleNotificationChange = (type: keyof typeof tempSettings.notifications, value: boolean) => {
    setTempSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
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

  const handleSave = async () => {
    if (!authUser?.id) {
      showToast('error', 'You must be logged in to save changes');
      return;
    }

    try {
      setIsLoading(true);

      console.log('Saving settings for Firebase UID:', authUser.id);
      
      // Prepare updates for the API
      const updates: Record<string, unknown> = {
        display_name: `${tempSettings.firstName} ${tempSettings.lastName}`.trim(),
        phone_number: tempSettings.phone,
      };

      // Only add complex objects if they exist in the user data
      if (tempSettings.notifications) {
        updates.notification_settings = {
          email: tempSettings.notifications.email,
          push: tempSettings.notifications.push,
          sms: tempSettings.notifications.sms,
        };
      }

      if (tempSettings.preferences) {
        updates.preferences = {
          language: tempSettings.preferences.language,
          timezone: tempSettings.preferences.timezone,
          currency: tempSettings.preferences.currency,
        };
      }

      console.log('Updating user with data:', updates);

      // Call the update API using the firebase_uid directly
      const updateResponse = await usersAPI.updateUser(authUser.id, updates);

      if (updateResponse.success) {
        setSettings(tempSettings);
        showToast('success', 'Settings updated successfully!');
      } else {
        throw new Error(updateResponse.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('error', error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTempSettings(settings);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600">Update your personal details and contact information.</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={tempSettings.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 text-gray-700 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={tempSettings.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 text-gray-700 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={tempSettings.email}
                      disabled
                      className="mt-1 block w-full rounded-md text-gray-700 border-gray-300 bg-gray-50 text-gray-500 shadow-sm sm:text-sm cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed as it's linked to your account</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={tempSettings.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-1 block w-full rounded-md text-gray-700 border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
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
                  Cancel
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
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Notification Preferences</h2>
              <p className="text-gray-600">Choose how you want to be notified about important updates.</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempSettings.notifications.email}
                        onChange={(e) => handleNotificationChange('email', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempSettings.notifications.push}
                        onChange={(e) => handleNotificationChange('push', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempSettings.notifications.sms}
                        onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
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
                  Cancel
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
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Security Settings</h2>
              <p className="text-gray-600">Manage your account security and privacy.</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button className="btn-primary px-4 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors">
                    Update Password
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Preferences</h2>
              <p className="text-gray-600">Customize your experience and app settings.</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Language</label>
                    <select 
                      value={tempSettings.preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="mt-1 block w-full rounded-md text-gray-700 border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    >
                      <option value="English">English</option>
                      <option value="繁體中文">繁體中文</option>
                      <option value="简体中文">简体中文</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time Zone</label>
                    <select 
                      value={tempSettings.preferences.timezone}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                      className="mt-1 block w-full rounded-md text-gray-700 border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    >
                      <option value="Asia/Hong_Kong (UTC+8)">Asia/Hong_Kong (UTC+8)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select 
                      value={tempSettings.preferences.currency}
                      onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                      className="mt-1 block w-full rounded-md text-gray-700 border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    >
                      <option value="HKD (Hong Kong Dollar)">HKD (Hong Kong Dollar)</option>
                    </select>
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
                  Cancel
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
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
              <span className="text-gray-800">Loading settings data...</span>
            </div>
          </div>
        )}


        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
