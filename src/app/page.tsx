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
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow-lg">
                    <a
                      href="#search"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200 shadow-sm"
                    >
                      Start Searching
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div id="search" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Search Properties
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Find your dream property with our advanced search
            </p>
          </div>

          <div className="mt-8 max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white shadow-xl rounded-lg p-6 border border-gray-200">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Location */}
                <div>
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <div className="mt-1 relative">
                    <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="location"
                      value={searchData.location}
                      onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                      placeholder="Enter city, neighborhood..."
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label htmlFor="bedrooms" className="form-label">
                    Bedrooms
                  </label>
                  <div className="mt-1 relative">
                    <HomeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      id="bedrooms"
                      value={searchData.bedrooms}
                      onChange={(e) => setSearchData({ ...searchData, bedrooms: e.target.value })}
                      className="input-field pl-10"
                    >
                      <option value="">Any</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                </div>

                {/* Max Price */}
                <div>
                  <label htmlFor="maxPrice" className="form-label">
                    Max Price
                  </label>
                  <div className="mt-1 relative">
                    <CurrencyDollarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      id="maxPrice"
                      value={searchData.maxPrice}
                      onChange={(e) => setSearchData({ ...searchData, maxPrice: e.target.value })}
                      placeholder="Enter max price..."
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Search Properties
                </button>
              </div>
            </form>
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
