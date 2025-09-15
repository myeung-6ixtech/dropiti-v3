'use client';
import { useState, useEffect } from "react";
import { getPublishedPropertyCount } from "@/lib/utils";
import Image from 'next/image';
import { getSafeProfileImage } from '@/lib/utils';
import { 
  StarIcon, 
  CheckCircleIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface DropitiPassport2Props {
  firebaseUid: string;
  user: {
    displayName: string;
    avatar: string;
    email: string;
    location?: string;
    joinDate?: string;
    verified: boolean;
    rating: number;
    reviewCount: number;
    about?: string;
    languages?: string[];
    stats: {
      responseRate: number;
      avgResponseTime: string;
      totalProperties: number;
      publishedProperties: number;
    };
  };
}

export default function DropitiPassport2({ user, firebaseUid }: DropitiPassport2Props) {
  const [propertyCount, setPropertyCount] = useState<number>(0);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  useEffect(() => {
    const fetchPropertyCount = async () => {
      try {
        setIsLoadingProperties(true);
        const count = await getPublishedPropertyCount(firebaseUid);
        setPropertyCount(count);
      } catch (error) {
        console.error("Error fetching property count:", error);
        setPropertyCount(0);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    if (firebaseUid) {
      fetchPropertyCount();
    }
  }, [firebaseUid]);
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) {
      return 'Unknown';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
      <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Profile Picture */}
        <div className="relative">
          <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden ring-4 ring-gray-100">
            <Image
              src={getSafeProfileImage(user.avatar, '/images/Portrait_Placeholder.png')}
              alt={user.displayName}
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-0">{user.displayName}</h1>
            {user.verified && (
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                Verified
              </span>
            )}
          </div>

          {/* Quick Stats Row */}
          <div className="flex items-center space-x-8 mb-4 text-sm">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-gray-900">{isLoadingProperties ? "..." : propertyCount}</span>
              <span className="text-gray-500">Properties</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-gray-900">{isLoadingProperties ? "..." : propertyCount}</span>
              <span className="text-gray-500">Published</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-gray-900">{user.stats.responseRate}%</span>
              <span className="text-gray-500">Response rate</span>
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
            <span className="text-sm text-gray-600">Languages Spoken:</span>
            {(() => {
              // Handle languages field - it might be a JSON string, array, or null
              let languagesArray: string[] = [];
              
              if (user.languages) {
                if (Array.isArray(user.languages)) {
                  languagesArray = user.languages;
                } else if (typeof user.languages === 'string') {
                  try {
                    const parsed = JSON.parse(user.languages);
                    languagesArray = Array.isArray(parsed) ? parsed : [];
                  } catch {
                    // If parsing fails, treat as comma-separated string
                    const languagesString = user.languages as string;
                    languagesArray = languagesString.split(',').map((lang: string) => lang.trim()).filter((lang: string) => lang);
                  }
                }
              }
              
              return languagesArray.length > 0 ? (
                languagesArray.map((language) => (
                  <span key={language} className="passport-language-tag">
                    {language}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs">Not specified</span>
              );
            })()}
          </div>

          {/* About */}
          <p className="text-gray-700 leading-relaxed text-sm">{user.about}</p>
        </div>
      </div>
    </div>
  );
}
