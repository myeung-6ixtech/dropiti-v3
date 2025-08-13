'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usersAPI } from '@/lib/api-client';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  CreditCardIcon,
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
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
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
      // The authUser.id is actually the Firebase UID from NextAuth
      if (authUser?.id) {
        try {
          setIsLoading(true);
          console.log('Loading user settings for Firebase UID:', authUser.id);
          
          const response = await usersAPI.getUserByFirebaseUid(authUser.id);
          
          if (response.success && response.data) {
            const userData = response.data;
            console.log('User data received:', userData);
            
            // Handle missing fields gracefully with fallbacks
            const newSettings: UserSettings = {
              firstName: userData.first_name || userData.display_name?.split(' ')[0] || 'John',
              lastName: userData.last_name || userData.display_name?.split(' ').slice(1).join(' ') || 'Doe',
              email: userData.email || 'demo@example.com',
              phone: userData.phone_number || '+852 1234 5678',
              notifications: {
                email: userData.notification_settings?.email ?? true,
                push: userData.notification_settings?.push ?? true,
                sms: userData.notification_settings?.sms ?? false,
              },
              preferences: {
                language: userData.preferences?.language || 'English',
                timezone: userData.preferences?.timezone || 'Asia/Hong_Kong (UTC+8)',
                currency: userData.preferences?.currency || 'HKD (Hong Kong Dollar)',
              },
            };
            setSettings(newSettings);
            setTempSettings(newSettings);
          } else {
            console.error('Failed to load user settings:', response.error);
            setSaveMessage({
              type: 'error',
              message: response.error || 'Failed to load settings data'
            });
          }
        } catch (error) {
          console.error('Failed to load user settings:', error);
          setSaveMessage({
            type: 'error',
            message: 'Failed to load settings data'
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('No auth user ID available');
      }
    };

    loadUserSettings();
  }, [authUser?.id]);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleInputChange = (field: keyof UserSettings, value: string | boolean | object) => {
    setTempSettings(prev => ({
      ...prev,
      [field]: value
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
      setSaveMessage({
        type: 'error',
        message: 'You must be logged in to save changes'
      });
      return;
    }

    try {
      setIsLoading(true);
      setSaveMessage(null);

      console.log('Saving settings for Firebase UID:', authUser.id);

      // Since the real_estate_user table uses firebase_uid as the primary key,
      // we don't need to fetch the user first - we can update directly using the firebase_uid
      
      // Prepare updates for the API
      const updates: Record<string, unknown> = {
        // Only include fields that exist in the simplified user structure
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
        setSaveMessage({
          type: 'success',
          message: 'Settings updated successfully!'
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        throw new Error(updateResponse.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save settings'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setSaveMessage(null);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-500">Update your personal details and contact information.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={tempSettings.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={tempSettings.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={tempSettings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={tempSettings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md transition-colors font-medium ${
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
                className={`px-4 py-2 text-white rounded-md transition-colors font-medium ${
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
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
              <p className="text-sm text-gray-500">Choose how you want to be notified about important updates.</p>
            </div>
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
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md transition-colors font-medium ${
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
                className={`px-4 py-2 text-white rounded-md transition-colors font-medium ${
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
        );
      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
              <p className="text-sm text-gray-500">Manage your account security and privacy.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex justify-end">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Billing Information</h3>
              <p className="text-sm text-gray-500">Manage your billing details and payment methods.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Current Plan</h4>
                  <p className="text-sm text-gray-500">Free Plan</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Upgrade Plan
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Payment Methods</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500">No payment methods added yet.</p>
                <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Add Payment Method
                </button>
              </div>
            </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
              <p className="text-sm text-gray-500">Customize your experience and app settings.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select 
                  value={tempSettings.preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option>English</option>
                  <option>繁體中文</option>
                  <option>简体中文</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Zone</label>
                <select 
                  value={tempSettings.preferences.timezone}
                  onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option>Asia/Hong_Kong (UTC+8)</option>
                  <option>UTC</option>
                  <option>America/New_York</option>
                </select>
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select 
                  value={tempSettings.preferences.currency}
                  onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option>HKD (Hong Kong Dollar)</option>
                  <option>USD (US Dollar)</option>
                  <option>EUR (Euro)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md transition-colors font-medium ${
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
                className={`px-4 py-2 text-white rounded-md transition-colors font-medium ${
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences.</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800">Loading settings data...</span>
          </div>
        </div>
      )}

      {/* Save Message */}
      {saveMessage && (
        <div className={`mb-6 border rounded-lg p-4 ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <span>{saveMessage.message}</span>
            <button
              onClick={() => setSaveMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
