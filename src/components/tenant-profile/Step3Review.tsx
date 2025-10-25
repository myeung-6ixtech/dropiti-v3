'use client';

import { TenantProfileData } from '@/types/tenant';
import TenantProfilePreview from './TenantProfilePreview';

interface Step3ReviewProps {
  data: TenantProfileData;
  user?: {
    name?: string;
    avatar?: string;
    displayName?: string;
  };
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function Step3Review({ data, user, onSubmit, isSubmitting }: Step3ReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Review Your Profile</h4>
        <p className="text-sm text-gray-600 mb-6">
          Please review all the information below before publishing your tenant profile to the marketplace.
        </p>
      </div>

      {/* Profile Preview */}
      <TenantProfilePreview data={data} user={user} />

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          <p>Once published, your profile will be visible to landlords in the marketplace.</p>
        </div>
        
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="form-button inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Publishing...
            </>
          ) : (
            'Publish Profile'
          )}
        </button>
      </div>
    </div>
  );
}
