'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiChevronDown, FiMenu, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSidebar } from '@/context/SidebarContext';
import { useState, useRef, useEffect } from 'react';
import { getSafeProfileImage } from '@/lib/utils';
import { navigationStyles } from '@/styles/index';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useMobileChat } from '@/context/MobileChatContext';

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const { t } = useLanguage();
  const { sidebarOpen, toggleSidebar, isMobile } = useSidebar();
  const { openBottomSheet } = useMobileChat();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug: Log user data for profile image debugging
  useEffect(() => {
    if (user) {
      console.log('Navigation: User data:', {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        hasAvatar: !!user.avatar
      });
    }
  }, [user]);

  // Handle avatar loading state
  useEffect(() => {
    if (isAuthenticated && user) {
      // If user is authenticated but doesn't have avatar yet, show loading
      if (!user.avatar) {
        setIsAvatarLoading(true);
        // In a real app, this would be handled by image loading events
        // For now, we'll show loading briefly then stop
        const timer = setTimeout(() => {
          setIsAvatarLoading(false);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        // User has avatar, but we might still need to load it
        setIsAvatarLoading(true);
        // Simulate image loading time
        const timer = setTimeout(() => {
          setIsAvatarLoading(false);
        }, 300);
        return () => clearTimeout(timer);
      }
    } else {
      setIsAvatarLoading(false);
    }
  }, [isAuthenticated, user]);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Don't show loading skeleton - assume user is not authenticated initially
  // This provides better UX by showing the login button immediately

  // Hide navigation completely on mobile for homepage, search, property pages, user profile pages, and auth pages
  if (isMobile && (
    pathname === '/' || 
    pathname.startsWith('/search') || 
    pathname.startsWith('/property/') || 
    pathname.startsWith('/app/') || 
    pathname.startsWith('/profile') ||
    pathname.startsWith('/user/') ||
    pathname.startsWith('/auth/')
  )) {
    return null;
  }

  // For mobile dashboard pages, show simplified header
  if (isMobile && pathname.startsWith('/dashboard')) {
    return (
      <nav className={navigationStyles.container}>
        <div className={navigationStyles.content}>
          <div className={navigationStyles.header}>
            <div className={navigationStyles.brand}>
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className={navigationStyles.menuButton}
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              >
                <FiMenu className={navigationStyles.menuIcon} />
              </button>
              
              <Link href="/" className={navigationStyles.brandLink}>
                <Image
                  src="/images/dropiti_logo.png"
                  alt="Dropiti"
                  width={160}
                  height={32}
                  priority
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            
            {/* Mobile Icons */}
            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <NotificationCenter />
                <button
                  onClick={openBottomSheet}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Open chat"
                >
                  <FiMessageCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={navigationStyles.container}>
      <div className={navigationStyles.content}>
        <div className={navigationStyles.header}>
          <div className={navigationStyles.brand}>
            {/* Mobile menu button - only show on mobile and dashboard pages */}
            {isMobile && pathname.startsWith('/dashboard') && (
              <button
                onClick={toggleSidebar}
                className={navigationStyles.menuButton}
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              >
                <FiMenu className={navigationStyles.menuIcon} />
              </button>
            )}
            
            <Link href="/" className={navigationStyles.brandLink}>
              <Image
                src="/images/dropiti_logo.png"
                alt="Dropiti"
                width={160}
                height={32}
                priority
                className="hidden sm:block h-11 w-auto"
              />
            </Link>
          </div>
          
          <div className={navigationStyles.menu}>
            <Link
              href="/"
              className={`${navigationStyles.link} ${
                isActive('/') 
                  ? navigationStyles.linkActive
                  : navigationStyles.linkInactive
              }`}
            >
              <span>{t('navigation.home')}</span>
            </Link>
            
            <Link
              href="/search"
              className={`${navigationStyles.link} ${
                isActive('/search') 
                  ? navigationStyles.linkActive
                  : navigationStyles.linkInactive
              }`}
            >
              <span>{t('navigation.explore')}</span>
            </Link>
            
            
            {isAuthenticated ? (
              <>
               <Link
                href={user?.uuid ? `/user/${user.uuid}` : '/dashboard'}
                className={`${navigationStyles.link} ${
                  isActive('/dashboard') || (user?.uuid && isActive(`/user/${user.uuid}`))
                    ? navigationStyles.linkActive
                    : navigationStyles.linkInactive
                }`}
              >
                <span>{t('navigation.myProfile')}</span>
            </Link>
            
            {/* Desktop Notification Center */}
            <div className="hidden sm:block">
              <NotificationCenter />
            </div>
            
            <div className={navigationStyles.userDropdown} ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={navigationStyles.userButton}
                >
                  <div className={navigationStyles.userAvatar}>
                    {isAvatarLoading ? (
                      <div className={navigationStyles.loadingAvatar}></div>
                    ) : user?.avatar ? (
                      <Image 
                        src={getSafeProfileImage(user.avatar, '/images/Portrait_Placeholder.png')} 
                        alt="User avatar" 
                        width={32}
                        height={32}
                        className={navigationStyles.userAvatarImage}
                      />
                    ) : (
                      <Image
                        src="/images/Portrait_Placeholder.png"
                        alt="Default avatar"
                        width={32}
                        height={32}
                        className={navigationStyles.userAvatarImage}
                      />
                    )}
                  </div>
                  <FiChevronDown className={`${navigationStyles.userChevron} ${isDropdownOpen ? navigationStyles.userChevronOpen : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className={navigationStyles.dropdownMenu}>
                    <Link
                      href="/dashboard"
                      className={navigationStyles.dropdownItem}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {t('navigation.dashboard')}
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className={navigationStyles.dropdownItemButton}
                    >
                      {isLoggingOut ? (
                        <>
                          {t('navigation.loggingOut')}
                        </>
                      ) : (
                        <>
                          {t('navigation.signOut')}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className={navigationStyles.authButton}
              >
                <span className={navigationStyles.authText}>{t('navigation.loginSignUp')}</span>
                <span className={navigationStyles.authTextMobile}>{t('navigation.login')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
