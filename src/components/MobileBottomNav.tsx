'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSafeProfileImage } from '@/lib/utils';
import { Home, Search, Passport, ChartTreeMap } from '@/assets/icons';
import { mobileBottomNavStyles } from '@/styles/index';

interface MobileBottomNavProps {
  className?: string;
}

export default function MobileBottomNav({ className = '' }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/profile') {
      // Check if we're on dashboard or user profile pages
      return pathname.startsWith('/dashboard') || 
             (user?.uuid && pathname.startsWith(`/user/${user.uuid}`));
    }
    return pathname === path;
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: () => isActive('/')
    },
    {
      id: 'explore',
      label: 'Explore',
      href: '/search',
      icon: Search,
      isActive: () => isActive('/search')
    },
    // Only show Dashboard for authenticated users
    ...(isAuthenticated ? [{
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: ChartTreeMap,
      isActive: () => isActive('/dashboard')
    }] : []),
    {
      id: 'profile',
      label: 'Profile',
      href: isAuthenticated && user?.uuid ? `/user/${user.uuid}` : '/auth/signin',
      icon: Passport,
      isActive: () => isActive('/profile'),
      showAvatar: isAuthenticated && user?.avatar
    }
  ];

  return (
    <nav className={`${mobileBottomNavStyles.container} ${className}`}>
      <div className={mobileBottomNavStyles.content}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive();
          
          return (
            <Link
              key={item.id}
              href={item.href}
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
