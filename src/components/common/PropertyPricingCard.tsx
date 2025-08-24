'use client';


import Image from 'next/image';
import Link from 'next/link';
import { 
  StarIcon, 
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
}

export default function PropertyPricingCard({
  price,
  availableDate,
  landlord,
  onCreateOffer,
  onChatWithLandlord,
  isOwner,
  hasExistingOffer,
  onEditListing
}: PropertyPricingCardProps) {

  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Fallback image URL for when no landlord avatar is available
  const fallbackAvatar = "/images/Portrait_Placeholder.png";

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
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(price)}
              </span>
              <span className="text-gray-600 ml-1">/month</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(availableDate)}
              </p>
            </div>
          </div>

          {/* Additional Costs */}
          <div className="space-y-2 py-4 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600 mb-0">Utilities</span>
              <span className="font-medium text-gray-600">Not Included</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {isOwner ? (
              // Owner sees Edit Your Listing button
              <button
                onClick={onEditListing}
                className="w-full btn-secondary py-3 px-4 font-semibold"
              >
                Edit Your Listing
              </button>
            ) : !isAuthenticated ? (
              // Not logged in - prompt to sign in
              <button
                onClick={() => router.push('/auth/signin')}
                className="w-full btn-primary py-3 px-4 font-semibold"
              >
                Sign In to Make an Offer
              </button>
            ) : hasExistingOffer ? (
              // User has already made an offer
              <button
                disabled
                className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold cursor-not-allowed opacity-75"
              >
                Offer Made
              </button>
            ) : (
              // Regular user can create offer
              <button
                onClick={onCreateOffer}
                className="w-full btn-primary py-3 px-4 font-semibold"
              >
                Create Offer
              </button>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              No booking fees • Secure payment
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
                    className="font-semibold text-gray-900 text-lg hover:text-black transition-colors cursor-pointer"
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
                  <span className="font-medium text-gray-900">{landlord.rating}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{landlord.reviewCount} reviews</span>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex flex-col space-y-2 mb-4">
              <button
                onClick={onChatWithLandlord}
                className="w-full btn-secondary py-3 px-4 font-semibold"
              >
                Chat with Landlord
              </button>
              {/* <button 
                onClick={() => setShowContactInfo(!showContactInfo)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>Contact</span>
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
              >
                <EnvelopeIcon className="h-4 w-4" />
                <span>Message</span>
              </button> */}
            </div>

            {/* Host Stats */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{landlord.responseRate || 98}%</div>
                  <div className="text-xs text-gray-500">Response rate</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">{landlord.responseTime || '1h'}</div>
                  <div className="text-xs text-gray-500">Avg. response</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">{landlord.totalProperties || 5}</div>
                  <div className="text-xs text-gray-500">Properties</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
