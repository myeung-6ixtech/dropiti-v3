'use client';

import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiHome, 
  FiSettings, 
  FiClock,
  FiUsers,
  FiMessageCircle,
  FiPlus,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiLayers,
  FiLogOut
} from 'react-icons/fi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import Image from 'next/image';
import { getSafeProfileImage } from '@/lib/utils';
import { FullScreenLoadingSpinner } from '@/components/common/LoadingSpinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type ViewType = 'tenant' | 'landlord';

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user: authUser, isAuthenticated, isLoading, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen, isMobile } = useSidebar();
  const [activeView, setActiveView] = useState<ViewType>('landlord');
  const [isViewChanging, setIsViewChanging] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
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

  // Handle redirect when not authenticated - improved to prevent loops
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasRedirected) {
      setHasRedirected(true);
      // Use replace instead of push to prevent back button issues
      router.replace('/auth/signin');
    }
  }, [isLoading, isAuthenticated, hasRedirected, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <FullScreenLoadingSpinner />;
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  const tenantNavigation = [
    { name: 'Dashboard', icon: FiLayers, href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'Applications', icon: FiClock, href: '/dashboard/applications', current: pathname === '/dashboard/applications' },
    { name: 'Chat', icon: FiMessageCircle, href: isMobile ? '/dashboard/chat-mobile' : '/dashboard/chat', current: pathname === '/dashboard/chat' || pathname === '/dashboard/chat-mobile' },
    { name: 'Reviews', icon: FiStar, href: '/dashboard/reviews', current: pathname === '/dashboard/reviews' },
    // { name: 'Saved Properties', icon: HeartIcon, href: '/dashboard/saved-properties', current: pathname === '/dashboard/saved-properties' },
    { name: 'Profile', icon: FiUsers, href: '/dashboard/profile', current: pathname === '/dashboard/profile' },
    { name: 'Settings', icon: FiSettings, href: '/dashboard/settings', current: pathname === '/dashboard/settings' },
    // { name: 'Notifications', icon: BellIcon, href: '/dashboard/notifications', current: pathname === '/dashboard/notifications' },
    // { name: 'Recent Activity', icon: ChartBarIcon, href: '/dashboard/activity', current: pathname === '/dashboard/activity' },
  ];

  const landlordNavigation = [
    { name: 'Dashboard', icon: FiLayers, href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'Offers', icon: FiClock, href: '/dashboard/offers', current: pathname === '/dashboard/offers' },
    { name: 'Properties', icon: FiHome, href: '/dashboard/properties', current: pathname === '/dashboard/properties' },
    { name: 'Add Property', icon: FiPlus, href: '/dashboard/add-property', current: pathname === '/dashboard/add-property' },
    { name: 'Chat', icon: FiMessageCircle, href: isMobile ? '/dashboard/chat-mobile' : '/dashboard/chat', current: pathname === '/dashboard/chat' || pathname === '/dashboard/chat-mobile' },
    { name: 'Reviews', icon: FiStar, href: '/dashboard/reviews', current: pathname === '/dashboard/reviews' },
    { name: 'Profile', icon: FiUsers, href: '/dashboard/profile', current: pathname === '/dashboard/profile' },
    { name: 'Settings', icon: FiSettings, href: '/dashboard/settings', current: pathname === '/dashboard/settings' },
    // { name: 'Notifications', icon: BellIcon, href: '/dashboard/notifications', current: pathname === '/dashboard/notifications' },
    // { name: 'Analytics', icon: ChartBarIcon, href: '/dashboard/analytics', current: pathname === '/dashboard/analytics' },
  ];

  const currentNavigation = activeView === 'tenant' ? tenantNavigation : landlordNavigation;

  return (
    <div className="dashboard-container">
      {/* Mobile sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="dashboard-mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="dashboard-mobile-backdrop-overlay" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${
        isMobile && !sidebarOpen ? 'dashboard-sidebar-closed' : 'dashboard-sidebar-open'
      } ${!isMobile && !sidebarOpen ? 'collapsed' : ''}`}>
        {/* V-shaped toggle button for desktop - positioned on edge */}
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="dashboard-sidebar-v-toggle"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <FiChevronLeft className="dashboard-sidebar-v-toggle-icon" />
            ) : (
              <FiChevronRight className="dashboard-sidebar-v-toggle-icon" />
            )}
          </button>
        )}
        
        <div className="dashboard-sidebar-content">
          {/* User info */}
          <div className="dashboard-user-section">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="dashboard-user-avatar">
                    {user.avatar ? (
                      <Image
                        src={getSafeProfileImage(user.avatar, '/images/Portrait_Placeholder.png')}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/images/Portrait_Placeholder.png"
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
            </div>
          </div>

          {/* View toggle */}
          <div className="dashboard-view-toggle">
            <p className="dashboard-view-toggle-title">View Mode</p>
            <div className="dashboard-view-toggle-buttons">
              <button
                onClick={() => {
                  handleViewChange(activeView === 'tenant' ? 'landlord' : 'tenant');
                  // Close sidebar on mobile after view change
                  if (isMobile) {
                    setTimeout(() => setSidebarOpen(false), 100);
                  }
                }}
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
                      <FiUser className="h-5 w-5 mr-2" />
                      <span>Tenant View</span>
                    </>
                  ) : (
                    <>
                      <FiHome className="h-5 w-5 mr-2" />
                      <span>Landlord View</span>
                    </>
                  )}
                </div>
              </button>

            </div>
          </div>

          {/* Navigation */}
          <nav className={`dashboard-navigation transition-opacity duration-200 ${isViewChanging ? 'opacity-75' : 'opacity-100'}`}>
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
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-2" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="dashboard-sidebar-footer">
            <button
              onClick={logout}
              className="dashboard-nav-item w-full text-left dashboard-nav-item-inactive hover:bg-red-50 hover:text-red-600 transition-colors mb-2"
            >
              <FiLogOut className="h-5 w-5 mr-2" />
              <span>Log Out</span>
            </button>
            <div className="dashboard-footer-links">
              <p className="text-xs text-gray-500 text-center">
                © 2025 dropiti. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="dashboard-main">
        {/* Page content */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}
