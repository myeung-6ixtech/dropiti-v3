'use client';

import { useState } from 'react';

export const AREA_CODES = [
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
];

export const validatePhone = (phone: string, areaCode: string): boolean => {
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

interface PhoneInputProps {
  areaCode: string;
  phoneNumber: string;
  onAreaCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  showLabel?: boolean;
  label?: string;
}

export default function PhoneInput({
  areaCode,
  phoneNumber,
  onAreaCodeChange,
  onPhoneNumberChange,
  error,
  required = false,
  disabled = false,
  placeholder = '1234 5678',
  showLabel = true,
  label = 'Phone Number'
}: PhoneInputProps) {
  return (
    <div className="space-y-2">
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex space-x-2">
        <select
          value={areaCode}
          onChange={(e) => onAreaCodeChange(e.target.value)}
          disabled={disabled}
          className="form-select max-w-[120px] text-sm"
          aria-label="Country code"
        >
          {AREA_CODES.map((area) => (
            <option key={area.code} value={area.code}>
              {area.flag} {area.code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value)}
          disabled={disabled}
          className={`form-input flex-1 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
          placeholder={placeholder}
          required={required}
          aria-label="Phone number"
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      <p className="text-xs text-gray-500">
        Enter your phone number without the country code
      </p>
    </div>
  );
}
