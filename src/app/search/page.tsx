'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import Footer from '@/components/common/Footer';
import { Property } from '@/types';
import { MagnifyingGlassIcon, MapPinIcon, HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

// Mock data for demonstration
const mockProperties: Property[] = [
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
  {
    id: '3',
    title: 'Luxury Penthouse',
    description: 'Stunning penthouse with panoramic city views, modern amenities, and premium finishes.',
    location: 'Uptown, Luxury District',
    bedrooms: 4,
    bathrooms: 3,
    price: 5800,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80',
    available: false,
    landlordId: 'landlord3',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Studio Apartment',
    description: 'Perfect studio apartment for young professionals, fully furnished and ready to move in.',
    location: 'Midtown, Business District',
    bedrooms: 1,
    bathrooms: 1,
    price: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    available: true,
    landlordId: 'landlord4',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Family Townhouse',
    description: 'Spacious townhouse with multiple levels, perfect for growing families.',
    location: 'Suburban Area, South District',
    bedrooms: 4,
    bathrooms: 3,
    price: 4200,
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    available: true,
    landlordId: 'landlord5',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    title: 'Modern Loft',
    description: 'Industrial-style loft with high ceilings, exposed brick, and modern appliances.',
    location: 'Arts District, Downtown',
    bedrooms: 2,
    bathrooms: 2,
    price: 2800,
    imageUrl: 'https://images.unsplash.com/photo-1560448075-bb485b067938?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    available: true,
    landlordId: 'landlord6',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  useEffect(() => {
    filterProperties();
  }, [filters, properties]);

  const filterProperties = () => {
    let filtered = [...properties];

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by bedrooms
    if (filters.bedrooms) {
      filtered = filtered.filter(property =>
        property.bedrooms >= parseInt(filters.bedrooms)
      );
    }

    // Filter by max price
    if (filters.maxPrice) {
      filtered = filtered.filter(property =>
        property.price <= parseInt(filters.maxPrice)
      );
    }

    setFilteredProperties(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      bedrooms: '',
      maxPrice: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search Properties</h1>
          <p className="mt-2 text-lg text-gray-600">
            Found {filteredProperties.length} properties matching your criteria
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Location Filter */}
            <div>
              <label htmlFor="location" className="form-label">
                Location
              </label>
              <div className="mt-1 relative">
                <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Enter location..."
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Bedrooms Filter */}
            <div>
              <label htmlFor="bedrooms" className="form-label">
                Bedrooms
              </label>
              <div className="mt-1 relative">
                <HomeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  id="bedrooms"
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="input-field pl-10"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            {/* Max Price Filter */}
            <div>
              <label htmlFor="maxPrice" className="form-label">
                Max Price
              </label>
              <div className="mt-1 relative">
                <CurrencyDollarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  id="maxPrice"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="Enter max price..."
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div>
              <label className="form-label">
                &nbsp;
              </label>
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProperties.map((property) => (
              <div key={property.id} className="animate-fade-in">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center border border-gray-200">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search criteria or clear the filters.
            </p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
