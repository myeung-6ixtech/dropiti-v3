'use client';

import { useState, useEffect } from 'react';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  HomeIcon, 
  CogIcon, 
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  ClockIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { getSafeProfileImage } from '@/lib/utils';
import { FullScreenLoadingSpinner } from '@/components/common/LoadingSpinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type ViewType = 'tenant' | 'landlord';

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('landlord');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  
  // Use actual user data from auth context
  const user = {
    name: authUser?.name || 'User',
    email: authUser?.email || 'user@example.com',
    role: activeView as 'tenant' | 'landlord',
    avatar: authUser?.avatar
  };

  // Debug: Log user data for profile image debugging
  useEffect(() => {
    if (authUser) {
      console.log('Dashboard Layout: User data:', {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        avatar: authUser.avatar,
        hasAvatar: !!authUser.avatar
      });
    }
  }, [authUser]);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleViewChange = (newView: ViewType) => {
    setActiveView(newView);
  };

  // Show loading state while auth is loading
  if (isLoading) {
    return <FullScreenLoadingSpinner />;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to access the dashboard.</p>
            <Link
              href="/auth/signin"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tenantNavigation = [
    { name: 'Dashboard', icon: HomeIcon, href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'Applications', icon: ClockIcon, href: '/dashboard/applications', current: pathname === '/dashboard/applications' },
    { name: 'Chat', icon: ChatBubbleLeftRightIcon, href: '/dashboard/chat', current: pathname === '/dashboard/chat' },
    { name: 'Saved Properties', icon: HeartIcon, href: '/dashboard/saved-properties', current: pathname === '/dashboard/saved-properties' },
    { name: 'Profile', icon: UsersIcon, href: '/dashboard/profile', current: pathname === '/dashboard/profile' },
    { name: 'Settings', icon: CogIcon, href: '/dashboard/settings', current: pathname === '/dashboard/settings' },
    // { name: 'Notifications', icon: BellIcon, href: '/dashboard/notifications', current: pathname === '/dashboard/notifications' },
    // { name: 'Recent Activity', icon: ChartBarIcon, href: '/dashboard/activity', current: pathname === '/dashboard/activity' },
  ];

  const landlordNavigation = [
    { name: 'Dashboard', icon: HomeIcon, href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'Properties', icon: BuildingOfficeIcon, href: '/dashboard/properties', current: pathname === '/dashboard/properties' },
    { name: 'Chat', icon: ChatBubbleLeftRightIcon, href: '/dashboard/chat', current: pathname === '/dashboard/chat' },
    { name: 'Add Property', icon: PlusIcon, href: '/dashboard/add-property', current: pathname === '/dashboard/add-property' },
    { name: 'Profile', icon: UsersIcon, href: '/dashboard/profile', current: pathname === '/dashboard/profile' },
    { name: 'Settings', icon: CogIcon, href: '/dashboard/settings', current: pathname === '/dashboard/settings' },
    // { name: 'Notifications', icon: BellIcon, href: '/dashboard/notifications', current: pathname === '/dashboard/notifications' },
    // { name: 'Analytics', icon: ChartBarIcon, href: '/dashboard/analytics', current: pathname === '/dashboard/analytics' },
  ];

  const currentNavigation = activeView === 'tenant' ? tenantNavigation : landlordNavigation;

  return (
    <div className="dashboard-container">
      {/* Mobile sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div className="dashboard-mobile-backdrop">
          <div 
            className="dashboard-mobile-backdrop-overlay" 
            onClick={() => setSidebarOpen(false)} 
          />
        </div>
      )}

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${
        isMobile && !sidebarOpen ? 'dashboard-sidebar-closed' : 'dashboard-sidebar-open'
      } ${!isMobile && !sidebarOpen ? 'collapsed' : ''}`}>
        <div className="dashboard-sidebar-content">
          {/* Sidebar toggle button - moved to top of sidebar */}
          <div className="dashboard-sidebar-toggle">
            {/* Only show toggle button on desktop */}
            {!isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="dashboard-sidebar-toggle-button"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            )}
          </div>
          {/* User info */}
          <div className="dashboard-user-section">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="dashboard-user-avatar">
                    {user.avatar ? (
                      <Image
                        src={getSafeProfileImage(user.avatar, '/src/assets/img/Portrait_Placeholder.png')}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/src/assets/img/Portrait_Placeholder.png"
                        alt="Default avatar"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <div className="dashboard-user-info">
                  <p className="dashboard-user-name">{user.name}</p>
                  <p className="dashboard-user-email">{user.email}</p>
                </div>
              </div>
              
              {/* Mobile close button */}
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* View toggle */}
          <div className="dashboard-view-toggle">
            <p className="dashboard-view-toggle-title">View Mode</p>
            <div className="dashboard-view-toggle-buttons">
              <button
                onClick={() => handleViewChange('tenant')}
                className={`dashboard-view-button ${
                  activeView === 'tenant'
                    ? 'dashboard-view-button-active'
                    : 'dashboard-view-button-inactive'
                }`}
              >
                <UserIcon className="h-5 w-5 mr-2" />
                Tenant View
              </button>
              <button
                onClick={() => handleViewChange('landlord')}
                className={`dashboard-view-button ${
                  activeView === 'landlord'
                    ? 'dashboard-view-button-active'
                    : 'dashboard-view-button-inactive'
                }`}
              >
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Landlord View
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="dashboard-navigation">
            <p className="dashboard-navigation-title">Navigation</p>
            {currentNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`dashboard-nav-item w-full text-left ${
                  item.current
                    ? 'dashboard-nav-item-active'
                    : 'dashboard-nav-item-inactive'
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 mr-2" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="dashboard-sidebar-footer">
            <div className="dashboard-footer-links">
              <p className="text-xs text-gray-500 text-center">
                © 2024 dropiti. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="dashboard-main">
        {/* Mobile menu button - always visible on mobile */}
        {isMobile && (
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <button
              onClick={() => setSidebarOpen(true)}
              className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        )}

        {/* Page content */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}
