'use client';


import Image from 'next/image';
import Link from 'next/link';
import { 
  StarIcon, 
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_AVATAR_URL } from '@/constants';

interface Landlord {
  id: string;
  uuid: string; // Add uuid for navigation to user profile
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  verified: boolean;
  responseRate?: number; // Added for dynamic data
  totalProperties?: number; // Added for dynamic data
}

interface PropertyPricingCardProps {
  price: number;
  availableDate: string | null;
  landlord: Landlord;
  onCreateOffer: () => void;
  onChatWithLandlord: () => void;
  // New props for button state management
  isOwner: boolean;
  hasExistingOffer: boolean;
  onEditListing?: () => void;
  isAdminListing?: boolean;
  onRequestClaimListing?: () => void;
}

export default function PropertyPricingCard({
  price,
  availableDate,
  landlord,
  onCreateOffer,
  onChatWithLandlord,
  isOwner,
  hasExistingOffer,
  onEditListing,
  isAdminListing = false,
  onRequestClaimListing,
}: PropertyPricingCardProps) {

  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Fallback image URL for when no landlord avatar is available
  const fallbackAvatar = DEFAULT_AVATAR_URL;

  // Get the landlord avatar or fallback, ensuring it's a valid URL
  const landlordAvatar = landlord.avatar && landlord.avatar.trim() !== '' ? landlord.avatar : fallbackAvatar;


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Contact for availability';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-8 space-y-4">
        {/* Pricing Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(price)}
              </span>
              <span className="text-sm text-gray-600 ml-1">/month</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Available</p>
              <p className="text-xs font-medium text-gray-900">
                {formatDate(availableDate)}
              </p>
            </div>
          </div>

          {/* Additional Costs */}
          <div className="space-y-2 py-4 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 mb-0">Utilities</span>
              <span className="text-sm font-medium text-gray-600">Not Included</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {isOwner ? (
              <button
                onClick={onEditListing}
                className="w-full btn-secondary py-3 px-4 font-medium text-sm"
              >
                Edit Your Listing
              </button>
            ) : !isAuthenticated ? (
              <>
                {isAdminListing ? (
                  <p className="text-xs text-gray-600 mb-2">
                    Sign in to submit a rental offer to Dropiti or to request transferring this listing to your account.
                  </p>
                ) : null}
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full btn-primary py-3 px-4 font-medium text-sm"
                >
                  {isAdminListing ? 'Sign In' : 'Sign In to Make an Offer'}
                </button>
              </>
            ) : hasExistingOffer ? (
              <>
                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg font-medium text-sm cursor-not-allowed opacity-75"
                >
                  Offer Made
                </button>
                {isAdminListing ? (
                  <button
                    type="button"
                    onClick={() => onRequestClaimListing?.()}
                    className="w-full btn-secondary py-3 px-4 font-medium text-sm"
                  >
                    Request to Claim Listing
                  </button>
                ) : null}
              </>
            ) : (
              <>
                {isAdminListing ? (
                  <p className="text-xs text-gray-600 mb-2">
                    Your offer goes to Dropiti for this listing. You can also request to move the listing to your landlord account.
                  </p>
                ) : null}
                <button
                  onClick={onCreateOffer}
                  className="w-full btn-primary py-3 px-4 font-medium text-sm"
                >
                  Create Offer
                </button>
                {isAdminListing ? (
                  <button
                    type="button"
                    onClick={() => onRequestClaimListing?.()}
                    className="w-full btn-secondary py-3 px-4 font-medium text-sm"
                  >
                    Request to Claim Listing
                  </button>
                ) : null}
              </>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {isAdminListing
                ? 'Claim this listing? Reach out to our Service Centre'
                : 'No booking fees • Secure payment'}
            </p>
          </div>
        </div>

        {/* Landlord Highlight Card - Airbnb Inspired - Hidden for owners */}
        {!isOwner && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start space-x-4 mb-4">
              <div className="relative">
                <Image
                  src={landlordAvatar}
                  alt={`${landlord.name}'s profile picture`}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    // Fallback to default avatar if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = fallbackAvatar;
                  }}
                  priority={false}
                />
                {landlord.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <CheckCircleIcon className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Link 
                    href={`/user/${landlord.uuid}`}
                    className="font-medium text-gray-900 text-base hover:text-black transition-colors cursor-pointer"
                  >
                    {landlord.name}
                  </Link>
                  {landlord.verified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="font-medium text-gray-900 text-sm">{landlord.rating}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{landlord.reviewCount} reviews</span>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex flex-col space-y-2 mb-4">
              {isAdminListing ? (
                <button
                  type="button"
                  onClick={() => onRequestClaimListing?.()}
                  className="w-full btn-secondary py-3 px-4 font-medium text-sm text-center"
                >
                  Reach out to Admin
                </button>
              ) : (
                <button
                  onClick={onChatWithLandlord}
                  className="w-full btn-secondary py-3 px-4 font-medium text-sm"
                >
                  Chat with Landlord
                </button>
              )}
            </div>

            {/* Host Stats - hidden for admin listings */}
            {!isAdminListing && (
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-base font-semibold text-gray-900">{landlord.responseRate || 98}%</div>
                    <div className="text-xs text-gray-500">Response rate</div>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-gray-900">{landlord.totalProperties || 5}</div>
                    <div className="text-xs text-gray-500">Properties</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
