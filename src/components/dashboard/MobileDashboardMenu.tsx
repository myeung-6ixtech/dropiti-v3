'use client';

import React, { useState, memo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { useLanguage } from '@/context/LanguageContext';
import { getSafeProfileImage } from '@/lib/utils';
import Portal from '@/components/Portal';
import { 
  FiUser, 
  FiHome, 
  FiSettings, 
  FiClock,
  FiUsers,
  FiMessageCircle,
  FiPlus,
  FiStar,
  FiLayers,
  FiLogOut,
  FiX
} from 'react-icons/fi';

type ViewType = 'tenant' | 'landlord';

interface MobileDashboardMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default memo(function MobileDashboardMenu({ isOpen, onClose }: MobileDashboardMenuProps) {
  const { user: authUser, logout } = useAuth();
  const { isMobile } = useSidebar();
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<ViewType>('landlord');
  const [isViewChanging, setIsViewChanging] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isOpen]);

  // Early return if not mobile to prevent rendering issues
  if (!isMobile) {
    return null;
  }

  const user = {
    name: authUser?.name || 'User',
    email: authUser?.email || 'user@example.com',
    avatar: authUser?.avatar
  };

  const handleViewChange = async (newView: ViewType) => {
    if (isViewChanging) return;
    
    setIsViewChanging(true);
    setActiveView(newView);
    
    if (pathname !== '/dashboard') {
      await router.push('/dashboard');
    }
    
    setTimeout(() => {
      setIsViewChanging(false);
      onClose(); // Close menu after view change
    }, 500);
  };

  const tenantNavigation = [
    { name: t('navigation.dashboard'), icon: FiLayers, href: '/dashboard', current: pathname === '/dashboard' },
    { name: t('navigation.applications'), icon: FiClock, href: '/dashboard/applications', current: pathname === '/dashboard/applications' },
    { name: t('navigation.chat'), icon: FiMessageCircle, href: '/dashboard/chat-mobile', current: pathname === '/dashboard/chat-mobile' },
    { name: t('navigation.reviews'), icon: FiStar, href: '/dashboard/reviews', current: pathname === '/dashboard/reviews' },
    { name: t('navigation.profile'), icon: FiUsers, href: '/dashboard/profile', current: pathname === '/dashboard/profile' },
    { name: t('navigation.settings'), icon: FiSettings, href: '/dashboard/settings', current: pathname === '/dashboard/settings' },
  ];

  const landlordNavigation = [
    { name: t('navigation.dashboard'), icon: FiLayers, href: '/dashboard', current: pathname === '/dashboard' },
    { name: t('navigation.offers'), icon: FiClock, href: '/dashboard/offers', current: pathname === '/dashboard/offers' },
    { name: t('navigation.properties'), icon: FiHome, href: '/dashboard/properties', current: pathname === '/dashboard/properties' },
    { name: t('navigation.addProperty'), icon: FiPlus, href: '/dashboard/add-property', current: pathname === '/dashboard/add-property' },
    { name: t('navigation.chat'), icon: FiMessageCircle, href: '/dashboard/chat-mobile', current: pathname === '/dashboard/chat-mobile' },
    { name: t('navigation.reviews'), icon: FiStar, href: '/dashboard/reviews', current: pathname === '/dashboard/reviews' },
    { name: t('navigation.profile'), icon: FiUsers, href: '/dashboard/profile', current: pathname === '/dashboard/profile' },
    { name: t('navigation.settings'), icon: FiSettings, href: '/dashboard/settings', current: pathname === '/dashboard/settings' },
  ];

  const currentNavigation = activeView === 'tenant' ? tenantNavigation : landlordNavigation;

  return (
    <Portal>
      {isMobile && (
        <>
          {/* Backdrop */}
          <div 
            className={`mobile-dashboard-menu-backdrop ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
          />

          {/* Menu */}
          <div className={`mobile-dashboard-menu ${isOpen ? 'mobile-dashboard-menu-open' : ''}`}>
          {/* Header */}
          <div className="mobile-dashboard-menu-header">
            <div className="mobile-dashboard-menu-user">
              <div className="mobile-dashboard-menu-avatar">
                <Image
                  src={getSafeProfileImage(user.avatar, '/images/Portrait_Placeholder.png')}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              </div>
              <div className="mobile-dashboard-menu-user-info">
                <p className="mobile-dashboard-menu-user-name">{user.name}</p>
                <p className="mobile-dashboard-menu-user-email">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="mobile-dashboard-menu-close"
              aria-label="Close menu"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="mobile-dashboard-menu-view-toggle">
            <p className="mobile-dashboard-menu-view-title">{t('dashboard.viewMode')}</p>
            <button
              onClick={() => handleViewChange(activeView === 'tenant' ? 'landlord' : 'tenant')}
              disabled={isViewChanging}
              className={`mobile-dashboard-menu-view-button ${isViewChanging ? 'opacity-75' : ''}`}
            >
              {isViewChanging ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  <span>{t('dashboard.switching')}</span>
                </>
              ) : activeView === 'tenant' ? (
                <>
                  <FiUser className="h-5 w-5 mr-2" />
                  <span>{t('dashboard.tenantView')}</span>
                </>
              ) : (
                <>
                  <FiHome className="h-5 w-5 mr-2" />
                  <span>{t('dashboard.landlordView')}</span>
                </>
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="mobile-dashboard-menu-nav">
            {currentNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`mobile-dashboard-menu-item ${
                  item.current ? 'mobile-dashboard-menu-item-active' : 'mobile-dashboard-menu-item-inactive'
                }`}
                onClick={onClose}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="mobile-dashboard-menu-footer">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="mobile-dashboard-menu-logout"
            >
              <FiLogOut className="h-5 w-5 mr-3" />
              <span>{t('navigation.signOut')}</span>
            </button>
            <p className="mobile-dashboard-menu-copyright">
              © 2025 dropiti. All rights reserved.
            </p>
          </div>
          </div>
        </>
      )}
    </Portal>
  );
});
