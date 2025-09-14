'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserIcon, ChevronDownIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { useState, useRef, useEffect } from 'react';
import { getSafeProfileImage } from '@/lib/utils';
import { navigationStyles } from '@/styles/index';

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
              
              <Link
                href="/dashboard"
                className={`${navigationStyles.link} ${
                  isActive('/dashboard') 
                    ? navigationStyles.linkActive
                    : navigationStyles.linkInactive
                }`}
              >
                <span>Dashboard</span>
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
