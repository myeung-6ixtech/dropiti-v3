'use client';

import { useState, useRef, useEffect } from 'react';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';

interface LanguageSwitcherProps {
  variant?: 'icon' | 'dropdown' | 'button';
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LanguageSwitcher({ 
  variant = 'icon', 
  showLabel = false,
  className = '',
  size = 'md'
}: LanguageSwitcherProps) {
  const { locale, setLocale, isLoading } = useLanguage();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh-HK', name: '繁體中文', flag: '🇭🇰' }
  ];

  const currentLanguage = languages.find(lang => lang.code === locale);

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'w-4 h-4',
      button: 'p-1.5',
      text: 'text-xs',
      dropdown: 'w-40',
      item: 'px-2 py-1.5'
    },
    md: {
      icon: 'w-5 h-5',
      button: 'p-2',
      text: 'text-sm',
      dropdown: 'w-48',
      item: 'px-3 py-2'
    },
    lg: {
      icon: 'w-6 h-6',
      button: 'p-3',
      text: 'text-base',
      dropdown: 'w-56',
      item: 'px-4 py-3'
    }
  };

  const config = sizeConfig[size];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (newLocale: string) => {
    if (newLocale === locale) return;
    
    try {
      await setLocale(newLocale);
      setIsOpen(false);
      
      // Show success message
      const languageName = languages.find(l => l.code === newLocale)?.name;
      showToast('success', `Language changed to ${languageName}`);
    } catch (error) {
      console.error('Failed to change language:', error);
      showToast('error', 'Failed to change language');
    }
  };

  if (variant === 'icon') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`${config.button} hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 flex items-center space-x-1`}
          aria-label="Change language"
        >
          <FiGlobe className={`${config.icon} text-gray-600`} />
          {showLabel && (
            <span className={`${config.text} text-gray-600`}>
              {currentLanguage?.flag}
            </span>
          )}
        </button>

        {isOpen && (
          <div className={`absolute right-0 mt-2 ${config.dropdown} bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50`}>
            <div className={`${config.item} border-b border-gray-100`}>
              <p className={`${config.text} font-medium text-gray-900 mb-0`}>Select Language</p>
            </div>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full ${config.item} text-left ${config.text} hover:bg-gray-50 flex items-center space-x-3 ${
                  locale === language.code ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {locale === language.code && (
                  <span className="ml-auto text-purple-600">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`w-full ${config.item} text-left ${config.text} hover:bg-gray-50 flex items-center justify-between disabled:opacity-50`}
          aria-label="Change language"
        >
          <div className="flex items-center space-x-2">
            <FiGlobe className={`${config.icon} text-gray-600`} />
            <span className="text-gray-700">Language</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>{currentLanguage?.flag}</span>
            <FiChevronDown className={`w-4 h-4 text-gray-400 ${isOpen ? 'rotate-180' : ''} transition-transform`} />
          </div>
        </button>

        {isOpen && (
          <div className={`absolute right-0 mt-1 ${config.dropdown} bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50`}>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full ${config.item} text-left ${config.text} hover:bg-gray-50 flex items-center space-x-3 ${
                  locale === language.code ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {locale === language.code && (
                  <span className="ml-auto text-purple-600">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`${config.button} hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 border border-gray-200`}
          aria-label="Change language"
        >
          <FiGlobe className={`${config.icon} text-gray-600`} />
          <span className={`${config.text} text-gray-700`}>
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
          <FiChevronDown className={`w-4 h-4 text-gray-400 ${isOpen ? 'rotate-180' : ''} transition-transform`} />
        </button>

        {isOpen && (
          <div className={`absolute right-0 mt-2 ${config.dropdown} bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50`}>
            <div className={`${config.item} border-b border-gray-100`}>
              <p className={`${config.text} font-medium text-gray-900 mb-0`}>Select Language</p>
            </div>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full ${config.item} text-left ${config.text} hover:bg-gray-50 flex items-center space-x-3 ${
                  locale === language.code ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {locale === language.code && (
                  <span className="ml-auto text-purple-600">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
