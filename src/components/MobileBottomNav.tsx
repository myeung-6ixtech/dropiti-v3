'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSafeProfileImage } from '@/lib/utils';
import { FiHome, FiSearch, FiLayers, FiUser } from 'react-icons/fi';
import { mobileBottomNavStyles } from '@/styles/index';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useHaptic } from '@/hooks/useHaptic';

interface MobileBottomNavProps {
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isActive: () => boolean;
  onClick?: (e: React.MouseEvent) => void;
  showAvatar?: boolean;
}

export default function MobileBottomNav({ className = '' }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  
  const { tap } = useHaptic();

  const { isVisible } = useScrollDirection({
    threshold: 20, // Higher threshold for rapid scroll detection
    debounceMs: 100, // Faster response
    hideOnScrollDown: true,
    showOnScrollUp: true,
    rapidScrollThreshold: 50, // Only hide on rapid scroll
  });

  const isActive = (path: string): boolean => {
    if (path === '/profile') {
      // Check if we're on dashboard or user profile pages
      return pathname.startsWith('/dashboard') || 
             (user?.id && pathname.startsWith(`/user/${user.id}`)) || false;
    }
    return pathname === path;
  };

  // Remove custom dashboard click handler to rely on native Link navigation

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: FiHome,
      isActive: () => isActive('/')
    },
    {
      id: 'explore',
      label: 'Explore',
      href: '/search',
      icon: FiSearch,
      isActive: () => isActive('/search')
    },
    // Only show Dashboard for authenticated users
    ...(isAuthenticated ? [{
      id: 'dashboard',
      label: 'Manage',
      href: '/dashboard',
      icon: FiLayers,
      isActive: () => isActive('/dashboard')
    }] : []),
    {
      id: 'profile',
      label: isAuthenticated ? 'Profile' : 'Sign In',
      href: isAuthenticated && user?.id ? `/user/${user.id}` : '/auth/signin',
      icon: FiUser,
      isActive: () => isActive('/profile'),
      showAvatar: !!(isAuthenticated && user?.avatar)
    }
  ];

  return (
    <nav className={`${mobileBottomNavStyles.container} ${className} ${
      isVisible ? 'mobile-bottom-nav-visible' : 'mobile-bottom-nav-hidden'
    }`}>
      <div className={mobileBottomNavStyles.content}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive();
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => tap('selection')}
              className={`${mobileBottomNavStyles.item} ${
                active ? mobileBottomNavStyles.itemActive : mobileBottomNavStyles.itemInactive
              }`}
            >
              <div className={mobileBottomNavStyles.itemContent}>
                {/* Icon or Avatar */}
                <div className={mobileBottomNavStyles.itemIcon}>
                  {item.showAvatar && item.id === 'profile' ? (
                    <Image
                      src={getSafeProfileImage(user?.avatar, '/images/Portrait_Placeholder.png')}
                      alt="Profile"
                      width={24}
                      height={24}
                      className={mobileBottomNavStyles.avatar}
                    />
                  ) : (
                    <Icon className={`${mobileBottomNavStyles.icon} ${
                      active ? mobileBottomNavStyles.iconActive : mobileBottomNavStyles.iconInactive
                    }`} />
                  )}
                </div>
                
                {/* Label */}
                <span className={`${mobileBottomNavStyles.label} ${
                  active ? mobileBottomNavStyles.labelActive : mobileBottomNavStyles.labelInactive
                }`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
