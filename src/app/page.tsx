'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, MapPinIcon, HomeIcon, CurrencyDollarIcon, UserIcon } from '@heroicons/react/24/outline';
import Footer from '@/components/common/Footer';

export default function HomePage() {
  const router = useRouter();
  const [searchData, setSearchData] = useState({
    location: '',
    bedrooms: '',
    maxPrice: ''
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.bedrooms) params.append('bedrooms', searchData.bedrooms);
    if (searchData.maxPrice) params.append('maxPrice', searchData.maxPrice);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-100/50"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Find Your Perfect</span>{' '}
                  <span className="block text-blue-600 xl:inline">Property</span>
                </h1>
                <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover thousands of properties for rent and sale. Search by location, bedrooms, and price to find your ideal home.
                </p>
                
                {/* Integrated Search Bar */}
                <div className="mt-8 sm:mt-10">
                  <form onSubmit={handleSearch} className="max-w-4xl mx-auto lg:mx-0">
                    <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2">
                      {/* Location */}
                      <div className="flex-1 relative">
                        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={searchData.location}
                          onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                          placeholder="Enter city, neighborhood..."
                          className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500 rounded-xl"
                        />
                      </div>

                      {/* Bedrooms */}
                      <div className="flex-1 relative">
                        <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          value={searchData.bedrooms}
                          onChange={(e) => setSearchData({ ...searchData, bedrooms: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 focus:outline-none text-gray-900 bg-transparent rounded-xl appearance-none cursor-pointer"
                        >
                          <option value="">Any Bedrooms</option>
                          <option value="1">1 Bedroom</option>
                          <option value="2">2 Bedrooms</option>
                          <option value="3">3 Bedrooms</option>
                          <option value="4">4 Bedrooms</option>
                          <option value="5">5+ Bedrooms</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Max Price */}
                      <div className="flex-1 relative">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          value={searchData.maxPrice}
                          onChange={(e) => setSearchData({ ...searchData, maxPrice: e.target.value })}
                          placeholder="Max Price"
                          className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500 rounded-xl"
                        />
                      </div>

                      {/* Search Button */}
                      <button
                        type="submit"
                        className="flex-shrink-0 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <MagnifyingGlassIcon className="h-6 w-6 text-white" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Dropiti?
            </h2>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <MagnifyingGlassIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Advanced Search</h3>
                <p className="mt-2 text-base text-gray-600">
                  Find properties by location, bedrooms, price, and more with our powerful search engine.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <HomeIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Verified Properties</h3>
                <p className="mt-2 text-base text-gray-600">
                  All properties are verified and listed by trusted landlords and real estate agents.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <UserIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">User Dashboard</h3>
                <p className="mt-2 text-base text-gray-600">
                  Manage your properties, applications, and preferences with our comprehensive dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
