'use client';

import { occupationOptions } from '@/types/user';

export interface ProfileOccupationSelectProps {
  selectValue: string;
  otherValue: string;
  onSelectChange: (value: string) => void;
  onOtherChange: (value: string) => void;
  label?: React.ReactNode;
  helperText?: string;
  selectClassName?: string;
  inputClassName?: string;
  selectId?: string;
  otherId?: string;
}

export default function ProfileOccupationSelect({
  selectValue,
  otherValue,
  onSelectChange,
  onOtherChange,
  label,
  helperText,
  selectClassName = 'form-select text-sm',
  inputClassName = 'form-input-sm mt-2',
  selectId = 'profile-occupation',
  otherId = 'profile-occupation-other',
}: ProfileOccupationSelectProps) {
  return (
    <div>
      {label ? (
        <label htmlFor={selectId} className="form-label text-xs">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        value={selectValue}
        onChange={(e) => onSelectChange(e.target.value)}
        className={selectClassName}
      >
        <option value="">Select occupation</option>
        {occupationOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {selectValue === 'Other' ? (
        <input
          id={otherId}
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          className={inputClassName}
          placeholder="Describe your occupation"
          maxLength={100}
        />
      ) : null}
      {helperText ? <p className="text-xs text-gray-500 mt-1">{helperText}</p> : null}
    </div>
  );
}
