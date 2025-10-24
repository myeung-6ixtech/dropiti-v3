'use client';

import { useState } from 'react';
import { TenantProfileData } from '@/types/tenant';

interface Step1BasicInfoProps {
  data: TenantProfileData;
  onUpdate: (data: Partial<TenantProfileData>) => void;
}

export default function Step1BasicInfo({ data, onUpdate }: Step1BasicInfoProps) {
  const [title, setTitle] = useState(data.tenant_listing_title || '');
  const [description, setDescription] = useState(data.tenant_listing_description || '');

  const handleTitleChange = (value: string) => {
    setTitle(value);
    onUpdate({ tenant_listing_title: value });
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    onUpdate({ tenant_listing_description: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g. Professional seeking modern apartment"
          className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          A catchy title that describes who you are and what you're looking for
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          About You *
        </label>
        <textarea
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={6}
          placeholder="Tell landlords about yourself, your lifestyle, what you're looking for in a rental, and what makes you a great tenant..."
          className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Help landlords understand who you are and why you'd be a great tenant
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for a great profile:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Mention your profession and employment status</li>
          <li>• Describe your lifestyle and habits</li>
          <li>• Explain what you're looking for in a rental</li>
          <li>• Highlight what makes you a reliable tenant</li>
        </ul>
      </div>
    </div>
  );
}
