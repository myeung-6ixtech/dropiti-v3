'use client';

import { useState, useEffect } from 'react';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  HomeIcon, 
  ChartBarIcon, 
  CogIcon, 
  BellIcon,
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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type ViewType = 'tenant' | 'landlord';

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeView, setActiveView] = useState<ViewType>('tenant');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  
  const [user] = useState({
    name: 'John Doe',
    email: 'demo@example.com',
    role: 'tenant' as 'tenant' | 'landlord',
  });

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
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="dashboard-sidebar-close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
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
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="dashboard-user-avatar">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="dashboard-user-info">
                <p className="dashboard-user-name">{user.name}</p>
                <p className="dashboard-user-email">{user.email}</p>
              </div>
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
        {/* Page content - removed topbar */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}
