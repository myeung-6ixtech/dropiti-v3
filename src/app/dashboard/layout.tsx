'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  CogIcon, 
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { ChartTreeMap, PropertyListings } from '@/assets/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const [isViewChanging, setIsViewChanging] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
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

  const handleViewChange = async (newView: ViewType) => {
    if (isViewChanging) return; // Prevent multiple rapid clicks
    
    setIsViewChanging(true);
    setActiveView(newView);
    
    // Navigate back to dashboard when switching views
    if (pathname !== '/dashboard') {
      await router.push('/dashboard');
    }
    
    // Add a small delay for smooth transition
    setTimeout(() => {
      setIsViewChanging(false);
    }, 500);
  };

  // Handle redirect when not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Add a small delay to show the loading spinner briefly
      const timer = setTimeout(() => {
        router.push('/auth/signin');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading spinner while checking authentication or redirecting
  if (isLoading || !isAuthenticated) {
    return <FullScreenLoadingSpinner />;
  }

  const tenantNavigation = [
    { name: 'Dashboard', icon: ChartTreeMap, href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'Applications', icon: ClockIcon, href: '/dashboard/applications', current: pathname === '/dashboard/applications' },
    { name: 'Chat', icon: ChatBubbleLeftRightIcon, href: '/dashboard/chat', current: pathname === '/dashboard/chat' },
    // { name: 'Saved Properties', icon: HeartIcon, href: '/dashboard/saved-properties', current: pathname === '/dashboard/saved-properties' },
    { name: 'Profile', icon: UsersIcon, href: '/dashboard/profile', current: pathname === '/dashboard/profile' },
    { name: 'Settings', icon: CogIcon, href: '/dashboard/settings', current: pathname === '/dashboard/settings' },
    // { name: 'Notifications', icon: BellIcon, href: '/dashboard/notifications', current: pathname === '/dashboard/notifications' },
    // { name: 'Recent Activity', icon: ChartBarIcon, href: '/dashboard/activity', current: pathname === '/dashboard/activity' },
  ];

  const landlordNavigation = [
    { name: 'Dashboard', icon: ChartTreeMap, href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'Properties', icon: PropertyListings, href: '/dashboard/properties', current: pathname === '/dashboard/properties' },
    { name: 'Add Property', icon: PlusIcon, href: '/dashboard/add-property', current: pathname === '/dashboard/add-property' },
    { name: 'Chat', icon: ChatBubbleLeftRightIcon, href: '/dashboard/chat', current: pathname === '/dashboard/chat' },
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
                onClick={() => handleViewChange(activeView === 'tenant' ? 'landlord' : 'tenant')}
                disabled={isViewChanging}
                className={`dashboard-view-toggle-button ${isViewChanging ? 'opacity-75 cursor-not-allowed' : ''}`}
                title={`Switch to ${activeView === 'tenant' ? 'Landlord' : 'Tenant'} View`}
              >
                <div className="flex items-center justify-center">
                  {isViewChanging ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      <span>Switching...</span>
                    </>
                  ) : activeView === 'tenant' ? (
                    <>
                      <UserIcon className="h-5 w-5 mr-2" />
                      <span>Tenant View</span>
                    </>
                  ) : (
                    <>
                      <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                      <span>Landlord View</span>
                    </>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {isViewChanging 
                    ? 'Switching view mode...' 
                    : `Click to switch to ${activeView === 'tenant' ? 'Landlord' : 'Tenant'} View`
                  }
                </div>
                <div className={`mt-2 w-2 h-2 rounded-full ${
                  activeView === 'tenant' ? 'bg-blue-500' : 'bg-green-500'
                }`} title={`Currently in ${activeView} mode`}></div>
              </button>

            </div>
          </div>

          {/* Navigation */}
          <nav className={`dashboard-navigation transition-opacity duration-200 ${isViewChanging ? 'opacity-75' : 'opacity-100'}`}>
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
