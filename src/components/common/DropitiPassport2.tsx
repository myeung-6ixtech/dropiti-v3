'use client';

import Image from 'next/image';
import { 
  StarIcon, 
  CheckCircleIcon,
  MapPinIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface DropitiPassport2Props {
  user: {
    name: string;
    avatar: string;
    email: string;
    location?: string;
    joinDate: string;
    verified: boolean;
    rating: number;
    reviewCount: number;
    about?: string;
    languages?: string[];
    stats: {
      responseRate: number;
      avgResponseTime: string;
      totalProperties: number;
      totalGuests: number;
    };
  };
}

export default function DropitiPassport2({ user }: DropitiPassport2Props) {
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
      <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Profile Picture */}
        <div className="relative">
          <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden ring-4 ring-gray-100">
            <Image
              src={user.avatar}
              alt={user.name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          {user.verified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5">
              <CheckCircleIcon className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{user.name}</h1>
            {user.verified && (
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                Verified
              </span>
            )}
          </div>

          {/* Quick Stats Row */}
          <div className="flex items-center space-x-8 mb-4 text-sm">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-gray-900">{user.stats.totalProperties}</span>
              <span className="text-gray-500">properties</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-gray-900">{user.stats.totalGuests}</span>
              <span className="text-gray-500">tenants</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-gray-900">{user.stats.responseRate}%</span>
              <span className="text-gray-500">response rate</span>
            </div>
          </div>

          {/* Rating and Response Time */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-1">
              <StarIcon className="h-4 w-4 text-yellow-400" />
              <span className="font-semibold text-gray-900">{user.rating}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{user.reviewCount} reviews</span>
            </div>
          </div>

          {/* Location and Join Date */}
          <div className="flex items-center space-x-6 text-gray-600 text-sm mb-4">
            <div className="flex items-center">
              <MapPinIcon className="h-3 w-3 mr-2" />
              <span>{user.location}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-3 w-3 mr-2" />
              <span>Member since {formatJoinDate(user.joinDate)}</span>
            </div>
          </div>

          {/* Languages */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm text-gray-600">Languages:</span>
            {user.languages?.map((language) => (
              <span key={language} className="bg-gray-50 text-gray-700 px-2 py-1 rounded-full text-xs">
                {language}
              </span>
            ))}
          </div>

          {/* About */}
          <p className="text-gray-700 leading-relaxed text-sm">{user.about}</p>
        </div>

        {/* Contact Actions */}
        <div className="flex flex-col space-y-3 min-w-0">
          <button className="flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
            Contact
          </button>
          <button className="flex items-center justify-center px-6 py-2.5 bg-gray-50 text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-100 transition-colors text-sm">
            <HeartIcon className="h-4 w-4 mr-2" />
            Follow
          </button>
        </div>
      </div>
    </div>
  );
}
