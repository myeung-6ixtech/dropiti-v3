'use client';

import { useState } from 'react';
import { UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import TenantView from '@/components/dashboard/TenantView';
import LandlordView from '@/components/dashboard/LandlordView';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<'tenant' | 'landlord'>('tenant');
  const [user] = useState({
    name: 'John Doe',
    email: 'demo@example.com',
    role: 'tenant' as 'tenant' | 'landlord',
  });

  const handleViewChange = (newView: 'tenant' | 'landlord') => {
    setActiveView(newView);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-lg text-gray-600">
                Welcome back, {user.name}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex">
            <button
              onClick={() => handleViewChange('tenant')}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-l-lg transition-colors ${
                activeView === 'tenant'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserIcon className="h-5 w-5 mr-2" />
              Tenant View
            </button>
            <button
              onClick={() => handleViewChange('landlord')}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-r-lg transition-colors ${
                activeView === 'landlord'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BuildingOfficeIcon className="h-5 w-5 mr-2" />
              Landlord View
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="mt-8">
          {activeView === 'tenant' ? (
            <TenantView />
          ) : (
            <LandlordView />
          )}
        </div>
      </div>
    </div>
  );
}
