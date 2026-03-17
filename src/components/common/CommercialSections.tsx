'use client';

import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function CommercialSections() {
  return (
    <>
      {/* Beyond Property Section */}
      <div className="text-center">
        <p className="text-lg sm:text-xl text-gray-600 mb-3">
          One platform, endless possibilities
        </p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">
          Dropiti - Where Property Meets Innovation
        </p>
      </div>

      {/* Services Section */}
      <div className="py-16">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 justify-center">
            
            {/* Real Estate Service */}
            <div className="group cursor-pointer text-center flex flex-col items-center">
              <div className="mb-4 px-4 sm:px-0">
                <div className="relative w-80 sm:w-[25rem] h-[20rem] sm:h-[25rem] mx-auto">
                  <Image
                    src="/images/dropiti-homepage-001.webp"
                    alt="Real Estate Service"
                    fill
                    className="object-cover rounded-[2rem] transition-all duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="space-y-3 max-w-sm">
                <h3 className="text-lg sm:text-md font-semibold text-gray-900">Smart Property Search</h3>
                <p className="text-base sm:text-sm text-gray-600 leading-relaxed">
                  AI-powered matching finds properties tailored to your lifestyle. 
                  Virtual tours, instant notifications, and verified listings make 
                  your search effortless and efficient.
                </p>
                <div className="flex items-center justify-center text-black font-semibold group-hover:text-purple-600 transition-colors">
                  <span className="text-sm">Explore Properties</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* My Home Service */}
            <div className="group cursor-pointer text-center flex flex-col items-center">
              <div className="mb-4 px-4 sm:px-0">
                <div className="relative w-80 sm:w-[25rem] h-[20rem] sm:h-[25rem] mx-auto">
                  <Image
                    src="/images/dropiti-homepage-002.webp"
                    alt="My Home Service"
                    fill
                    className="object-cover rounded-[2rem] transition-all duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="space-y-3 max-w-sm">
                <h3 className="text-lg sm:text-md font-semibold text-gray-900">Property Management</h3>
                <p className="text-base sm:text-sm text-gray-600 leading-relaxed">
                  Manage your entire property portfolio from your phone. 
                  Track rent payments, schedule maintenance, communicate with tenants, 
                  and access financial insights instantly.
                </p>
                <div className="flex items-center justify-center text-black font-semibold group-hover:text-purple-600 transition-colors">
                  <span className="text-sm">Manage Properties</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Smart Home */}
            <div className="group cursor-pointer text-center flex flex-col items-center">
              <div className="mb-4 px-4 sm:px-0">
                <div className="relative w-80 sm:w-[25rem] h-[20rem] sm:h-[25rem] mx-auto">
                  <Image
                    src="/images/dropiti-homepage-003.webp"
                    alt="Smart Home"
                    fill
                    className="object-cover rounded-[2rem] transition-all duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="space-y-3 max-w-sm">
                <h3 className="text-lg sm:text-md font-semibold text-gray-900">Smart Home Integration</h3>
                <p className="text-base sm:text-sm text-gray-600 leading-relaxed">
                  Transform any property into a connected smart home. 
                  Control lighting, security, climate, and appliances remotely. 
                  Energy-efficient automation saves money and enhances comfort.
                </p>
                <div className="flex items-center justify-center text-black font-semibold group-hover:text-purple-600 transition-colors">
                  <span className="text-sm">Smart Solutions</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Dropiti Connect */}
            <div className="group cursor-pointer text-center flex flex-col items-center">
              <div className="mb-4 px-4 sm:px-0">
                <div className="relative w-80 sm:w-[25rem] h-[20rem] sm:h-[25rem] mx-auto">
                  <Image
                    src="/images/dropiti-connect.webp"
                    alt="Dropiti Connect"
                    fill
                    className="object-cover rounded-[2rem] transition-all duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="space-y-3 max-w-sm">
                <h3 className="text-lg sm:text-md font-semibold text-gray-900">Community Network</h3>
                <p className="text-base sm:text-sm text-gray-600 leading-relaxed">
                  Connect with landlords, tenants, and property professionals. 
                  Share experiences, get recommendations, and build relationships 
                  that make property management easier and more rewarding.
                </p>
                <div className="flex items-center justify-center text-black font-semibold group-hover:text-purple-600 transition-colors">
                  <span className="text-sm">Join Community</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Innovation Statement Section */}
      <div className="py-16 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">
            Ready to revolutionize your property experience?
          </h2>
          <p className="text-base sm:text-lg opacity-90 mb-6 text-white">
            Join thousands of users who trust Dropiti for smarter property management, 
            seamless transactions, and innovative solutions that make property ownership effortless.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105 text-sm">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
