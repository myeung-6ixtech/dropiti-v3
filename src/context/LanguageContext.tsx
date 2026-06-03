'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { usersAPI } from '@/lib/api-client';
import { useToast } from './ToastContext';
import { User } from '@/types/user';
import enMessages from '@/messages/en.json';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [locale, setLocaleState] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<Record<string, unknown>>(
    () => enMessages as Record<string, unknown>,
  );

  // Load translations for the current locale
  const loadTranslations = useCallback(async (newLocale: string) => {
    try {
      const messages = await import(`../messages/${newLocale}.json`);
      setTranslations(messages.default);
    } catch (error) {
      console.error(`Failed to load translations for ${newLocale}:`, error);
      // Fallback to English if the locale fails to load
      if (newLocale !== 'en') {
        const fallbackMessages = await import(`../messages/en.json`);
        setTranslations(fallbackMessages.default);
      }
    }
  }, []);

  // Initialize locale from user preferences or localStorage
  useEffect(() => {
    const initializeLocale = async () => {
      let initialLocale = 'en';

      if (isAuthenticated && user?.preferences?.language) {
        // Map user's language preference to locale codes
        const userLang = String(user.preferences.language).toLowerCase();
        if (userLang === 'traditional chinese' || userLang === 'cantonese' || userLang === 'chinese') {
          initialLocale = 'zh-HK';
        } else {
          initialLocale = 'en';
        }
      } else if (typeof window !== 'undefined') {
        // Check localStorage for saved preference
        const savedLocale = localStorage.getItem('dropiti_locale');
        if (savedLocale && ['en', 'zh-HK'].includes(savedLocale)) {
          initialLocale = savedLocale;
        }
      }

      setLocaleState(initialLocale);
      await loadTranslations(initialLocale);
    };

    initializeLocale();
  }, [isAuthenticated, user?.preferences?.language, loadTranslations]);

  // Translation function
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: unknown = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Fallback to key if translation not found
        // Only warn in development/client-side, not during build/SSR
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.warn(`Translation key not found: ${key}`);
        }
        return key;
      }
    }

    if (typeof value !== 'string') {
      // Only warn in development/client-side, not during build/SSR
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn(`Translation value is not a string for key: ${key}`);
      }
      return key;
    }

    // Replace parameters in the translation string
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return String(params[paramKey] || match);
      });
    }

    return value;
  }, [translations]);

  // Set locale and save to user preferences
  const setLocale = useCallback(async (newLocale: string) => {
    if (!['en', 'zh-HK'].includes(newLocale)) {
      console.error(`Invalid locale: ${newLocale}`);
      return;
    }

    setIsLoading(true);
    setLocaleState(newLocale);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('dropiti_locale', newLocale);
    }

    // Load new translations
    await loadTranslations(newLocale);

    // Update user preferences if authenticated
    if (isAuthenticated && user?.id) {
      try {
        const languageMap: Record<string, string> = {
          'en': 'English',
          'zh-HK': 'Traditional Chinese'
        };

        const response = await usersAPI.updateUser(user.id, {
          preferences: {
            ...(user.preferences as Record<string, unknown>),
            language: languageMap[newLocale]
          }
        } as Partial<User>);

        if (!response.success) {
          console.error('Failed to update user language preference:', response.error);
          showToast('error', 'Failed to save language preference');
        } else {
          showToast('success', 'Language preference updated successfully');
        }
      } catch (error) {
        console.error('Error updating user language preference:', error);
        showToast('error', 'Failed to save language preference');
      }
    }

    setIsLoading(false);
  }, [isAuthenticated, user?.id, user?.preferences, loadTranslations, showToast]);

  const value: LanguageContextType = {
    locale,
    setLocale,
    t,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
