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
  GlobeAltIcon
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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-lg border border-blue-200">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-3">
          <span className="text-white text-2xl font-bold">D</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Dropiti Passport</h2>
        <p className="text-sm text-gray-600">Your Digital Identity</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Image
              src={user.avatar}
              alt={user.name}
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
            {user.verified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <CheckCircleIcon className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-1 mt-1">
              <StarIcon className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-900">{user.rating}</span>
              <span className="text-xs text-gray-500">({user.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      {user.about && (
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-2">💬</span>
            About
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">{user.about}</p>
        </div>
      )}

      {/* Languages Section */}
      {user.languages && user.languages.length > 0 && (
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <GlobeAltIcon className="h-4 w-4 mr-2 text-blue-600" />
            Languages
          </h4>
          <div className="flex flex-wrap gap-2">
            {user.languages.map((language) => (
              <span
                key={language}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {user.education && (
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <AcademicCapIcon className="h-4 w-4 mr-2 text-green-600" />
            Education
          </h4>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getEducationIcon(user.education)}</span>
            <span className="text-sm text-gray-700">{user.education}</span>
          </div>
        </div>
      )}

      {/* Occupation Section */}
      {user.occupation && (
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <BriefcaseIcon className="h-4 w-4 mr-2 text-purple-600" />
            Occupation
          </h4>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getOccupationIcon(user.occupation)}</span>
            <span className="text-sm text-gray-700">{user.occupation}</span>
          </div>
        </div>
      )}

      {/* Marital Status Section */}
      {user.maritalStatus && (
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <HeartIcon className="h-4 w-4 mr-2 text-pink-600" />
            Marital Status
          </h4>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getMaritalStatusIcon(user.maritalStatus)}</span>
            <span className="text-sm text-gray-700">{user.maritalStatus}</span>
          </div>
        </div>
      )}

      {/* Location & Join Date */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="space-y-3">
          {user.location && (
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-4 w-4 text-red-500" />
              <span className="text-sm text-gray-700">{user.location}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-700">Member since {formatJoinDate(user.joinDate)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-blue-200">
        <p className="text-xs text-blue-600 font-medium">Dropiti Verified Profile</p>
        <p className="text-xs text-gray-500 mt-1">Building trust in the community</p>
      </div>
    </div>
  );
}
