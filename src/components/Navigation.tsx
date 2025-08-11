'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { HomeIcon, MagnifyingGlassIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { getSafeProfileImage } from '@/lib/utils';

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // You could add a toast notification here if you have a toast system
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Show loading state while determining authentication status
  if (isLoading) {
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">dropiti</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link
                href="/"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <HomeIcon className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              
              <Link
                href="/search"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/search') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Search</span>
              </Link>
              
              <Link
                href="/dashboard"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <UserIcon className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              
              {/* Loading state for auth button */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
                <div className="text-sm text-gray-700">
                  <span className="hidden sm:inline">Welcome, </span>
                  <span className="font-medium text-gray-400 animate-pulse">Loading...</span>
                </div>
                <div className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm font-medium animate-pulse">
                  <span className="hidden sm:inline">Loading...</span>
                  <span className="sm:hidden">...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">dropiti</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link
              href="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <HomeIcon className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            
            <Link
              href="/search"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/search') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Search</span>
            </Link>
            
            <Link
              href="/dashboard"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <UserIcon className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  {user?.avatar && (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image 
                        src={getSafeProfileImage(user.avatar, '/images/default-avatar.png')} 
                        alt="User avatar" 
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="text-sm text-gray-700">
                    <span className="hidden sm:inline">Welcome, </span>
                    <Link 
                      href="/dashboard/profile" 
                      className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {user?.name || user?.email?.split('@')[0] || 'User'}
                    </Link>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Logging out...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Log Out</span>
                      <span className="sm:hidden">Logout</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
