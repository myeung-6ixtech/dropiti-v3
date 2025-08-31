'use client';

interface ProfileStatusBannerProps {
  verified: boolean;
  onLearnMore?: () => void;
  className?: string;
}

export default function ProfileStatusBanner({
  verified,
  onLearnMore,
  className = '',
}: ProfileStatusBannerProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-0">
              Profile Status: {verified ? 'Verified' : 'Unverified'}
            </h3>
            <p className="text-xs text-gray-500 mb-0">
              {verified
                ? 'Your profile is verified and visible to all users'
                : 'Complete your profile to increase visibility and trust'}
            </p>
          </div>
        </div>
        {!verified && (
          <button
            className="text-sm text-black hover:text-gray-700 font-medium"
            onClick={onLearnMore}
          >
            Learn More
          </button>
        )}
      </div>
    </div>
  );
}


