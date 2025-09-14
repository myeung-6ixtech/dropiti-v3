'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Bed } from '@/assets/icons';

interface SearchData {
  location: string;
  bedrooms: string;
}

export default function HeroSection() {
  const router = useRouter();
  const [searchData, setSearchData] = useState<SearchData>({
    location: '',
    bedrooms: ''
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only proceed if at least one search criteria is provided
    if (!searchData.location && !searchData.bedrooms) {
      return;
    }
    
    const params = new URLSearchParams();
    if (searchData.location) params.append('location', searchData.location.trim());
    if (searchData.bedrooms) params.append('bedrooms', searchData.bedrooms);
    
    const searchUrl = `/search?${params.toString()}`;
    console.log('Homepage search: Navigating to:', searchUrl, 'with params:', Object.fromEntries(params));
    
    router.push(searchUrl);
  };

  const getSearchSummary = () => {
    const parts: string[] = [];
    if (searchData.location) parts.push(`${searchData.location} property`);
    if (searchData.bedrooms) parts.push(`${searchData.bedrooms} bedroom`);
    return parts.join(' ');
  };

  return (
    <div className="relative overflow-hidden bg-gray-900">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/dropiti-header-image-003.webp')"
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              {/* Hero Title - Now White */}
              <h1 className="text-4xl tracking-tight font-bold text-white sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Find Your Perfect</span>{' '}
                <span className="block text-blue-400 xl:inline">Home</span>
              </h1>
              
              {/* Hero Description - Now White */}
              <p className="mt-3 text-base text-white sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 opacity-90">
                Discover thousands of properties for rent and sale. Search by location, bedrooms, and price to find your ideal home.
              </p>
              
              {/* Integrated Search Bar */}
              <div className="mt-8 sm:mt-10">
                <form onSubmit={handleSearch} className="max-w-4xl mx-auto lg:mx-0">
                  <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2">
                    {/* Location - Made larger on desktop */}
                    <div className="flex-1 sm:flex-[2] relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-900" />
                      <input
                        type="text"
                        value={searchData.location}
                        onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                        placeholder="Enter city, neighborhood, or address..."
                        className="w-full pl-10 pr-4 py-4 border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500 rounded-xl mb-0"
                      />
                    </div>

                    {/* Bedrooms */}
                    <div className="flex-1 relative">
                      <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={searchData.bedrooms}
                        onChange={(e) => setSearchData({ ...searchData, bedrooms: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 focus:outline-none text-gray-900 bg-transparent rounded-xl appearance-none cursor-pointer mb-0"
                      >
                        <option value="">Any Bedrooms</option>
                        <option value="1">1 Bedroom</option>
                        <option value="2">2 Bedrooms</option>
                        <option value="3">3 Bedrooms</option>
                        <option value="4">4 Bedrooms</option>
                        <option value="5">5+ Bedrooms</option>
                      </select>
                    </div>



                    {/* Search Button - Full width on mobile, fixed width on desktop */}
                    <button
                      type="submit"
                      className="flex-shrink-0 w-full sm:w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-xl sm:rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      disabled={!searchData.location && !searchData.bedrooms}
                    >
                      <MagnifyingGlassIcon className="h-6 w-6 text-white" />
                      <span className="sm:hidden ml-2 text-white font-medium">Search Properties</span>
                    </button>
                  </div>
                  
                  {/* Search Hint - Now White */}
                  <p className="mt-3 text-sm text-white text-center lg:text-left opacity-80">
                    {searchData.location || searchData.bedrooms 
                      ? `Searching for: ${getSearchSummary()}`
                      : 'Enter your preferences above to start searching'
                    }
                  </p>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
