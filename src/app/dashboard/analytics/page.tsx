'use client';

import { useState } from 'react';
import { ChartBarIcon, TrendingUpIcon, UsersIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const [stats] = useState([
    {
      id: 1,
      name: 'Total Properties',
      value: '12',
      change: '+2',
      changeType: 'increase',
      icon: HomeIcon
    },
    {
      id: 2,
      name: 'Active Rentals',
      value: '8',
      change: '+1',
      changeType: 'increase',
      icon: UsersIcon
    },
    {
      id: 3,
      name: 'Monthly Revenue',
      value: '$280,000',
      change: '+12%',
      changeType: 'increase',
      icon: TrendingUpIcon
    },
    {
      id: 4,
      name: 'Occupancy Rate',
      value: '67%',
      change: '+5%',
      changeType: 'increase',
      icon: ChartBarIcon
    }
  ]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your property performance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  stat.changeType === 'increase' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Placeholder */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart placeholder - Revenue trend over time</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Performance</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart placeholder - Property performance metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
