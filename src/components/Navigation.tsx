'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDownIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { useState, useRef, useEffect } from 'react';
import { getSafeProfileImage } from '@/lib/utils';
import { navigationStyles } from '@/styles/index';
import { Chat } from '@/assets/icons';

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const { sidebarOpen, toggleSidebar, isMobile } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  // Show loading state while determining authentication status
  if (isLoading) {
    // Hide navigation on mobile during loading
    if (isMobile) {
      return null;
    }
    
    return (
      <nav className={navigationStyles.container}>
        <div className={navigationStyles.content}>
          <div className={navigationStyles.header}>
            <div className={navigationStyles.brand}>
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
                <span>Home</span>
              </Link>
              
              <Link
                href="/search"
                className={`${navigationStyles.link} ${
                  isActive('/search') 
                    ? navigationStyles.linkActive
                    : navigationStyles.linkInactive
                }`}
              >
                <span>Explore</span>
              </Link>
              
              {/* Loading state for auth button - simplified skeleton */}
              <div className={navigationStyles.loadingSkeleton}>
                {/* Skeleton profile photo */}
                <div className={navigationStyles.loadingAvatar}></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

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
                <Bars3Icon className={navigationStyles.menuIcon} />
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
            
            {/* Mobile Chat Icon */}
            {isAuthenticated && (
              <Link
                href="/dashboard/chat-mobile"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Open chat"
              >
                <Chat className="h-6 w-6 text-gray-600" />
              </Link>
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
                <Bars3Icon className={navigationStyles.menuIcon} />
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
              <span>Home</span>
            </Link>
            
            <Link
              href="/search"
              className={`${navigationStyles.link} ${
                isActive('/search') 
                  ? navigationStyles.linkActive
                  : navigationStyles.linkInactive
              }`}
            >
              <span>Explore</span>
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
                <span>My Profile</span>
            </Link>
            <div className={navigationStyles.userDropdown} ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={navigationStyles.userButton}
                >
                  <div className={navigationStyles.userAvatar}>
                    {user?.avatar ? (
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
                  <ChevronDownIcon className={`${navigationStyles.userChevron} ${isDropdownOpen ? navigationStyles.userChevronOpen : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className={navigationStyles.dropdownMenu}>
                    <Link
                      href="/dashboard"
                      className={navigationStyles.dropdownItem}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      View Dashboard
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
                          Logging out...
                        </>
                      ) : (
                        <>
                          Logout
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
                <span className={navigationStyles.authText}>Login / Sign Up</span>
                <span className={navigationStyles.authTextMobile}>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
