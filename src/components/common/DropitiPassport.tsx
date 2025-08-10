'use client';

import Image from 'next/image';
import { 
  StarIcon, 
  CheckCircleIcon,
  MapPinIcon,
  CalendarIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  HeartIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface DropitiPassportProps {
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
    education?: string;
    occupation?: string;
    maritalStatus?: string;
    stats?: {
      responseRate: number;
      avgResponseTime: string;
      totalProperties: number;
      totalGuests: number;
    };
  };
}

export default function DropitiPassport({ user }: DropitiPassportProps) {
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getEducationIcon = (education: string) => {
    switch (education) {
      case 'Highschool':
        return '🎓';
      case 'Bachelors':
        return '🎓';
      case 'Post-Graduate':
        return '🎓';
      case 'Diploma':
        return '📜';
      case 'PhD':
        return '🎓';
      default:
        return '🎓';
    }
  };

  const getOccupationIcon = (occupation: string) => {
    switch (occupation) {
      case 'Student':
        return '👨‍🎓';
      case 'Engineer':
        return '⚙️';
      case 'Doctor':
        return '👨‍⚕️';
      case 'Teacher':
        return '👨‍🏫';
      case 'Business Owner':
        return '💼';
      case 'Designer':
        return '🎨';
      case 'Developer':
        return '💻';
      case 'Manager':
        return '👔';
      case 'Consultant':
        return '📊';
      case 'Other':
        return '💼';
      default:
        return '💼';
    }
  };

  const getMaritalStatusIcon = (status: string) => {
    switch (status) {
      case 'Single':
        return '💚';
      case 'Married':
        return '💍';
      case 'In a Relationship':
        return '💕';
      case 'Widowed':
        return '🕊️';
      case 'Rather not Say':
        return '🤐';
      default:
        return '💚';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Dropiti Passport Header */}
      <div className="text-center mb-6 pb-4 border-b border-gray-100">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-3">
          <span className="text-white text-lg font-bold">D</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Dropiti Passport</h2>
        <p className="text-xs text-gray-500">Your Digital Identity</p>
      </div>

      {/* Profile Section - Instagram Style */}
      <div className="mb-6">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-gray-100">
              <Image
                src={user.avatar}
                alt={user.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            {user.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <CheckCircleIcon className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base">{user.name}</h3>
            <p className="text-xs text-gray-600 mb-1">{user.email}</p>
            <div className="flex items-center space-x-1">
              <StarIcon className="h-3 w-3 text-yellow-400" />
              <span className="text-xs font-medium text-gray-900">{user.rating}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-600">{user.reviewCount} reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      {user.stats && (
        <div className="flex items-center justify-between text-xs mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{user.stats.totalProperties}</div>
            <div className="text-gray-500">properties</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{user.stats.totalGuests}</div>
            <div className="text-gray-500">tenants</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{user.stats.responseRate}%</div>
            <div className="text-gray-500">response</div>
          </div>
        </div>
      )}

      {/* About Section */}
      {user.about && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2 text-sm flex items-center">
            <span className="mr-2 text-blue-500">💬</span>
            About
          </h4>
          <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{user.about}</p>
        </div>
      )}

      {/* Languages Section */}
      {user.languages && user.languages.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2 text-sm flex items-center">
            <GlobeAltIcon className="h-3 w-3 mr-2 text-blue-500" />
            Languages
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {user.languages.map((language) => (
              <span
                key={language}
                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {user.education && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2 text-sm flex items-center">
            <AcademicCapIcon className="h-3 w-3 mr-2 text-green-500" />
            Education
          </h4>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getEducationIcon(user.education)}</span>
            <span className="text-xs text-gray-700">{user.education}</span>
          </div>
        </div>
      )}

      {/* Occupation Section */}
      {user.occupation && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2 text-sm flex items-center">
            <BriefcaseIcon className="h-3 w-3 mr-2 text-purple-500" />
            Occupation
          </h4>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getOccupationIcon(user.occupation)}</span>
            <span className="text-xs text-gray-700">{user.occupation}</span>
          </div>
        </div>
      )}

      {/* Marital Status Section */}
      {user.maritalStatus && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2 text-sm flex items-center">
            <HeartIcon className="h-3 w-3 mr-2 text-pink-500" />
            Marital Status
          </h4>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getMaritalStatusIcon(user.maritalStatus)}</span>
            <span className="text-xs text-gray-700">{user.maritalStatus}</span>
          </div>
        </div>
      )}

      {/* Location & Join Date */}
      <div className="mb-4 p-3 bg-gray-50 rounded-xl">
        <div className="space-y-2">
          {user.location && (
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-3 w-3 text-red-500" />
              <span className="text-xs text-gray-700">{user.location}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-3 w-3 text-blue-500" />
            <span className="text-xs text-gray-700">Member since {formatJoinDate(user.joinDate)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-3 border-t border-gray-100">
        <p className="text-xs text-blue-600 font-medium">Dropiti Verified Profile</p>
        <p className="text-xs text-gray-500 mt-1">Building trust in the community</p>
      </div>
    </div>
  );
}
