'use client';

import Link from 'next/link';
import {
  BuildingOfficeIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface DashboardWelcomeHeaderProps {
  userName: string;
  stats: {
    totalProperties: number;
    totalReviews: number;
  };
}

export default function DashboardWelcomeHeader({ userName, stats }: DashboardWelcomeHeaderProps) {
  return (
    <div className="welcome-header-container">
      {/* Thin Welcome Section */}
      <div className="welcome-greeting-section">
        <h1 className="welcome-greeting">Hi, {userName}</h1>
        <p className="welcome-stats">{stats.totalProperties} Properties | {stats.totalReviews} Reviews</p>
      </div>

      {/* App-Style Quick Actions */}
      <div className="welcome-actions-grid">
        <Link href="/dashboard/properties" className="welcome-action-button">
          <BuildingOfficeIcon className="welcome-action-icon" />
          <span className="welcome-action-label">Manage Properties</span>
        </Link>

        <Link href="/dashboard/offers" className="welcome-action-button">
          <ClockIcon className="welcome-action-icon" />
          <span className="welcome-action-label">View Offers</span>
        </Link>

        <Link href="/dashboard/applications" className="welcome-action-button">
          <DocumentTextIcon className="welcome-action-icon" />
          <span className="welcome-action-label">View Applications</span>
        </Link>

        <Link href="/search" className="welcome-action-button">
          <MagnifyingGlassIcon className="welcome-action-icon" />
          <span className="welcome-action-label">Explore Properties</span>
        </Link>
      </div>
    </div>
  );
}
