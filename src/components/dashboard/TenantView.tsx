'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HeartIcon, ClockIcon, MapPinIcon, CurrencyDollarIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Property } from '@/types';

// Mock data for tenant view
const mockSavedProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Downtown Apartment',
    description: 'Beautiful 2-bedroom apartment in the heart of downtown with stunning city views.',
    location: 'Downtown, City Center',
    bedrooms: 2,
    bathrooms: 2,
    price: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    available: true,
    landlordId: 'landlord1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Cozy Suburban House',
    description: 'Family-friendly 3-bedroom house in a quiet suburban neighborhood with a backyard.',
    location: 'Suburban Area, North District',
    bedrooms: 3,
    bathrooms: 2,
    price: 3200,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    available: true,
    landlordId: 'landlord2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockApplications = [
  {
    id: '1',
    propertyTitle: 'Modern Downtown Apartment',
    status: 'pending',
    appliedDate: new Date('2024-01-15'),
    propertyId: '1',
  },
  {
    id: '2',
    propertyTitle: 'Luxury Penthouse',
    status: 'approved',
    appliedDate: new Date('2024-01-10'),
    propertyId: '3',
  },
];

export default function TenantView() {
  const [activeTab, setActiveTab] = useState(0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { name: 'Saved Properties', value: 0 },
    { name: 'Applications', value: 1 },
    { name: 'Recent Activity', value: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.value
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Saved Properties Tab */}
        {activeTab === 0 && (
          <div className="py-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mockSavedProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="relative h-48">
                    {property.imageUrl ? (
                      <Image
                        src={property.imageUrl}
                        alt={property.title}
                        width={400}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <HomeIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-50">
                      <HeartIcon className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {property.location}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <HomeIcon className="h-4 w-4 mr-1" />
                          {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                        </div>
                        <div>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-1" />
                        <span className="font-semibold">{property.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 1 && (
          <div className="py-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Your Applications</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {mockApplications.map((application) => (
                  <div key={application.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <HomeIcon className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">{application.propertyTitle}</h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Applied on {application.appliedDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Tab */}
        {activeTab === 2 && (
          <div className="py-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <HeartIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Saved a new property</p>
                      <p className="text-sm text-gray-500">Modern Downtown Apartment</p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <HomeIcon className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Application submitted</p>
                      <p className="text-sm text-gray-500">Luxury Penthouse</p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-sm text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
