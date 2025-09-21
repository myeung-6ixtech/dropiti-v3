'use client';
import { useState, useEffect } from "react";
import { getPublishedPropertyCountByStatus, getAverageUserRating, calculatePlatformDuration } from "@/lib/utils";
import Image from 'next/image';
import { 
  StarIcon, 
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { passportStyles } from '@/styles/index';

interface DropitiPassportProps {
  firebaseUid: string;
  user: {
    name: string;
    avatar: string;
    email: string;
    location?: string;
    created_at: string;
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
      publishedProperties: number;
    };
  };
}

export default function DropitiPassport({ user, firebaseUid }: DropitiPassportProps) {
  const [publishedProperties, setPublishedProperties] = useState(0);
  const [userRating, setUserRating] = useState({
    averageRating: 0,
    reviewCount: 0
  });
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isLoadingRating, setIsLoadingRating] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingProperties(true);
        setIsLoadingRating(true);
        
        const [publishedCount, ratingData] = await Promise.all([
          getPublishedPropertyCountByStatus(firebaseUid),
          getAverageUserRating(firebaseUid)
        ]);
        
        setPublishedProperties(publishedCount);
        
        setUserRating({
          averageRating: ratingData.averageRating,
          reviewCount: ratingData.reviewCount
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setPublishedProperties(0);
        setUserRating({ averageRating: 0, reviewCount: 0 });
      } finally {
        setIsLoadingProperties(false);
        setIsLoadingRating(false);
      }
    };

    if (firebaseUid) {
      fetchData();
    }
  }, [firebaseUid]);
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className={passportStyles.container}>
      {/* Dropiti Passport Header */}
      <div className={passportStyles.header}>
        <h2 className={passportStyles.title}>Dropiti Passport</h2>
        <p className={passportStyles.subtitle}>Your Digital Identity</p>
      </div>

      {/* Profile Section - Instagram Style */}
      <div className={passportStyles.profile}>
        <div className={passportStyles.profileContent}>
          <div className={passportStyles.avatarContainer}>
            <div className={passportStyles.avatar}>
              <Image
                src={user.avatar || '/images/Portrait_Placeholder.png'}
                alt={user.name}
                width={64}
                height={64}
                className={passportStyles.avatarImage}
              />
            </div>
            {user.verified && (
              <div className={passportStyles.verificationBadge}>
                <CheckCircleIcon className={passportStyles.verificationIcon} />
              </div>
            )}
          </div>
          <div className={passportStyles.profileInfo}>
            <h3 className={passportStyles.profileName}>{user.name}</h3>
            <div className={passportStyles.profileRating}>
              <StarIcon className={passportStyles.ratingStar} />
              <span className={passportStyles.ratingValue}>
                {isLoadingRating ? "..." : userRating.averageRating}
              </span>
              <span className={passportStyles.ratingSeparator}>•</span>
              <span className={passportStyles.reviewCount}>
                {isLoadingRating ? "..." : userRating.reviewCount} reviews
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className={passportStyles.stats}>
        <div className={passportStyles.statItem}>
          <div className={passportStyles.statValue}>{isLoadingProperties ? "..." : publishedProperties}</div>
          <div className={passportStyles.statLabel}>Published</div>
        </div>
        <div className={passportStyles.statItem}>
          <div className={passportStyles.statValue}>{isLoadingRating ? "..." : userRating.reviewCount}</div>
          <div className={passportStyles.statLabel}>Reviews</div>
        </div>
        <div className={passportStyles.statItem}>
          <div className={passportStyles.statValue}>{calculatePlatformDuration(user.created_at)}</div>
          <div className={passportStyles.statLabel}>on Dropiti</div>
        </div>
      </div>

      {/* About Section */}
      {user.about && (
        <div className={passportStyles.section}>
          <h4 className={passportStyles.sectionTitle}>
            About
          </h4>
          <p className={passportStyles.sectionContent}>{user.about}</p>
        </div>
      )}

      {/* Languages Section */}
      {user.languages && Array.isArray(user.languages) && user.languages.length > 0 && (
        <div className={passportStyles.section}>
          <h4 className={passportStyles.sectionTitle}>
            Languages
          </h4>
          <div className={passportStyles.languages}>
            {user.languages.map((language) => (
              <span
                key={language}
                className={passportStyles.languageTag}
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {user.education && (
        <div className={passportStyles.section}>
          <h4 className={passportStyles.sectionTitle}>
            Education
          </h4>
          <div className={passportStyles.sectionSimple}>
            <span className={passportStyles.sectionText}>{user.education}</span>
          </div>
        </div>
      )}

      {/* Occupation Section */}
      {user.occupation && (
        <div className={passportStyles.section}>
          <h4 className={passportStyles.sectionTitle}>
            Occupation
          </h4>
          <div className={passportStyles.sectionSimple}>
            <span className={passportStyles.sectionText}>{user.occupation}</span>
          </div>
        </div>
      )}

      {/* Marital Status Section */}
      {user.maritalStatus && (
        <div className={passportStyles.section}>
          <h4 className={passportStyles.sectionTitle}>
            Marital Status
          </h4>
          <div className={passportStyles.sectionSimple}>
            <span className={passportStyles.sectionText}>{user.maritalStatus}</span>
          </div>
        </div>
      )}

      {/* Location Section */}
      {user.location && (
        <div className={passportStyles.section}>
          <h4 className={passportStyles.sectionTitle}>
            Location
          </h4>
          <div className={passportStyles.sectionSimple}>
            <span className={passportStyles.sectionText}>{user.location}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={passportStyles.footer}>
        <p className={passportStyles.verifiedText}>Dropiti Verified Profile</p>
        <p className={passportStyles.trustText}>Building trust in the community</p>
      </div>
    </div>
  );
}
