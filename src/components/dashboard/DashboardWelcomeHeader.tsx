'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  BuildingOfficeIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface DashboardWelcomeHeaderProps {
  userName: string;
  stats: {
    totalProperties: number;
    totalReviews: number;
  };
}

export default function DashboardWelcomeHeader({ userName, stats }: DashboardWelcomeHeaderProps) {
  const { t } = useLanguage();
  return (
    <div className="welcome-header-container">
      {/* Thin Welcome Section */}
      <div className="welcome-greeting-section">
        <h1 className="welcome-greeting">{t('welcomeHeader.hi', { name: userName })}</h1>
        <p className="welcome-stats">{t('welcomeHeader.propertiesAndReviews', { properties: stats.totalProperties, reviews: stats.totalReviews })}</p>
      </div>

      {/* App-Style Quick Actions */}
      <div className="welcome-actions-grid">
        <Link href="/dashboard/properties" className="welcome-action-button">
          <BuildingOfficeIcon className="welcome-action-icon" />
          <span className="welcome-action-label">{t('welcomeHeader.manageProperties')}</span>
        </Link>

        <Link href="/dashboard/add-property" className="welcome-action-button">
          <PlusIcon className="welcome-action-icon" />
          <span className="welcome-action-label">{t('welcomeHeader.addNewProperty')}</span>
        </Link>

        <Link href="/dashboard/offers" className="welcome-action-button">
          <ClockIcon className="welcome-action-icon" />
          <span className="welcome-action-label">{t('welcomeHeader.viewOffers')}</span>
        </Link>

        <Link href="/dashboard/applications" className="welcome-action-button">
          <DocumentTextIcon className="welcome-action-icon" />
          <span className="welcome-action-label">{t('welcomeHeader.viewApplications')}</span>
        </Link>

        <Link href="/search" className="welcome-action-button">
          <MagnifyingGlassIcon className="welcome-action-icon" />
          <span className="welcome-action-label">{t('welcomeHeader.exploreProperties')}</span>
        </Link>
      </div>
    </div>
  );
}
