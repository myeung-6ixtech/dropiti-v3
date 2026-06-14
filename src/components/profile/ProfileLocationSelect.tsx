'use client';

import { locationOptions } from '@/types/user';

export interface ProfileLocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: React.ReactNode;
  helperText?: string;
  selectClassName?: string;
  id?: string;
}

export default function ProfileLocationSelect({
  value,
  onChange,
  label,
  helperText,
  selectClassName = 'form-select text-sm',
  id = 'profile-location',
}: ProfileLocationSelectProps) {
  return (
    <div>
      {label ? (
        <label htmlFor={id} className="form-label text-xs">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClassName}
      >
        <option value="">Select location</option>
        {locationOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {helperText ? <p className="text-xs text-gray-500 mt-1">{helperText}</p> : null}
    </div>
  );
}
