'use client';

import { 
  MagnifyingGlassIcon, 
  HomeIcon, 
  CogIcon, 
  UserGroupIcon,
  ArrowRightIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function CommercialSections() {
  return (
    <>
      {/* Beyond Property Section - Inspired by Zigbang */}
      <div className="py-20 bg-white">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Beyond Property
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-700 mb-8">
            Innovation in housing for a new era
          </h2>
          <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-blue-600 mb-12">
            A New Way of Living by Dropiti
          </h3>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
            
            {/* Real Estate Service */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                <div className="flex items-center mb-5">
                  <div className="p-2 bg-blue-100 rounded-full mr-3">
                    <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Real Estate Service</h3>
                </div>
                <p className="text-gray-600 text-base mb-5 leading-relaxed">
                  From Hong Kong's premier property search platform to providing seamless real-time property discovery, 
                  virtual property tours, and AI-powered matching, Dropiti continues to revolutionize the real estate market.
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-800 transition-colors">
                  <span className="text-sm">View more</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* My Home Service */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                <div className="flex items-center mb-5">
                  <div className="p-2 bg-green-100 rounded-full mr-3">
                    <HomeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">My Home Service</h3>
                </div>
                <p className="text-gray-600 text-base mb-5 leading-relaxed">
                  Enjoy a convenient lifestyle with Mobile Home Management by Dropiti. 
                  Manage your property portfolio, track maintenance, handle tenant communications, 
                  and access financial insights all from your mobile device.
                </p>
                <div className="flex items-center text-green-600 font-semibold group-hover:text-green-800 transition-colors">
                  <span className="text-sm">View more</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Smart Home */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                <div className="flex items-center mb-5">
                  <div className="p-2 bg-purple-100 rounded-full mr-3">
                    <CogIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Smart Home</h3>
                </div>
                <p className="text-gray-600 text-base mb-5 leading-relaxed">
                  Easier and safer through digital integration and smart home technology. 
                  A connected residential experience created by Dropiti with IoT devices, 
                  automated systems, and intelligent property management.
                </p>
                <div className="flex items-center text-purple-600 font-semibold group-hover:text-purple-800 transition-colors">
                  <span className="text-sm">View more</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Dropiti Connect */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                <div className="flex items-center mb-5">
                  <div className="p-2 bg-orange-100 rounded-full mr-3">
                    <UserGroupIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Dropiti Connect</h3>
                </div>
                <p className="text-gray-600 text-base mb-5 leading-relaxed">
                  The Future of Property Networking. A revolutionary platform that connects landlords, 
                  tenants, and property professionals in ways that go beyond traditional property management.
                </p>
                <div className="flex items-center text-orange-600 font-semibold group-hover:text-orange-800 transition-colors">
                  <span className="text-sm">View more</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

          </div>

          {/* Bottom tagline */}
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-3">
              A new and improved space and experience
            </p>
            <p className="text-xl font-bold text-gray-900">
              Beyond Property, Dropiti
            </p>
          </div>
        </div>
      </div>

      {/* Latest News Section */}
      <div className="py-16 bg-white">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Latest News</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            
            {/* News Item 1 */}
            <div className="group cursor-pointer">
              <div className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <DocumentTextIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-xs font-medium text-blue-600">Press Release</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Dropiti Launches AI-Powered Property Matching with 95% Accuracy Rate
                </h3>
                <div className="flex items-center text-xs text-gray-500">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  <span>2025.01.15</span>
                </div>
              </div>
            </div>

            {/* News Item 2 */}
            <div className="group cursor-pointer">
              <div className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <DocumentTextIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-xs font-medium text-blue-600">Press Release</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Dropiti Expands to Macau Market with Revolutionary Property Platform
                </h3>
                <div className="flex items-center text-xs text-gray-500">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  <span>2025.01.08</span>
                </div>
              </div>
            </div>

            {/* News Item 3 */}
            <div className="group cursor-pointer">
              <div className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <DocumentTextIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-xs font-medium text-blue-600">Press Release</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Dropiti Reports 300% Growth in User Base During Q4 2024
                </h3>
                <div className="flex items-center text-xs text-gray-500">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  <span>2024.12.28</span>
                </div>
              </div>
            </div>

          </div>

          {/* Read More News Button */}
          <div className="text-center">
            <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <span className="text-sm">Read more news</span>
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Innovation Statement Section */}
      <div className="py-16 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Dropiti is creating a new era of residential innovation.
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Join thousands of property seekers and landlords who trust Dropiti 
            to revolutionize their real estate experience with cutting-edge technology 
            and unparalleled service.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm">
              Explore Properties
            </button>
            <button className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 text-sm">
              List Your Property
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
