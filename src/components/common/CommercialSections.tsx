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
            
            {/* Map & search */}
            <div className="group cursor-pointer text-center flex flex-col items-center">
              <div className="mb-4 px-4 sm:px-0">
                <div className="relative w-80 sm:w-[25rem] h-[20rem] sm:h-[25rem] mx-auto">
                  <Image
                    src="/images/dropiti-homepage-001.webp"
                    alt="Map and list property search"
                    fill
                    className="object-cover rounded-[2rem] transition-all duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="space-y-3 max-w-sm">
                <h3 className="text-lg sm:text-md font-semibold text-gray-900">Map-aware property search</h3>
                <p className="text-base sm:text-sm text-gray-600 leading-relaxed">
                  Filter by area, bedrooms, and budget, then explore places on an interactive map or in a
                  list—so you can see what&apos;s available before you commit.
                </p>
                <div className="flex items-center justify-center text-black font-semibold group-hover:text-purple-600 transition-colors">
                  <span className="text-sm">Explore listings</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Landlord dashboard & listings */}
            <div className="group cursor-pointer text-center flex flex-col items-center">
              <div className="mb-4 px-4 sm:px-0">
                <div className="relative w-80 sm:w-[25rem] h-[20rem] sm:h-[25rem] mx-auto">
                  <Image
                    src="/images/dropiti-homepage-002.webp"
                    alt="Landlord listings dashboard"
                    fill
                    className="object-cover rounded-[2rem] transition-all duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="space-y-3 max-w-sm">
                <h3 className="text-lg sm:text-md font-semibold text-gray-900">Your listings, in one dashboard</h3>
                <p className="text-base sm:text-sm text-gray-600 leading-relaxed">
                  Publish and manage properties, keep drafts as you go, and stay on top of what you&apos;ve
                  posted—all from the landlord side of the platform.
                </p>
                <div className="flex items-center justify-center text-black font-semibold group-hover:text-purple-600 transition-colors">
                  <span className="text-sm">Manage listings</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Offers & listing flow */}
            <div className="group cursor-pointer text-center flex flex-col items-center">
              <div className="mb-4 px-4 sm:px-0">
                <div className="relative w-80 sm:w-[25rem] h-[20rem] sm:h-[25rem] mx-auto">
                  <Image
                    src="/images/dropiti-homepage-003.webp"
                    alt="From browsing a listing to making an offer"
                    fill
                    className="object-cover rounded-[2rem] transition-all duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="space-y-3 max-w-sm">
                <h3 className="text-lg sm:text-md font-semibold text-gray-900">From browsing to making an offer</h3>
                <p className="text-base sm:text-sm text-gray-600 leading-relaxed">
                  Open a listing, review the details, and move forward when you&apos;re ready—so interested
                  renters and landlords can progress without leaving the platform.
                </p>
                <div className="flex items-center justify-center text-black font-semibold group-hover:text-purple-600 transition-colors">
                  <span className="text-sm">Browse listings</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* In-app chat */}
            <div className="group cursor-pointer text-center flex flex-col items-center">
              <div className="mb-4 px-4 sm:px-0">
                <div className="relative w-80 sm:w-[25rem] h-[20rem] sm:h-[25rem] mx-auto">
                  <Image
                    src="/images/dropiti-connect.webp"
                    alt="In-app chat with landlords and tenants"
                    fill
                    className="object-cover rounded-[2rem] transition-all duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="space-y-3 max-w-sm">
                <h3 className="text-lg sm:text-md font-semibold text-gray-900">Chat with landlords and tenants</h3>
                <p className="text-base sm:text-sm text-gray-600 leading-relaxed">
                  Start a conversation in-app when you need clarity on a listing or next steps—no juggling
                  scattered apps and threads.
                </p>
                <div className="flex items-center justify-center text-black font-semibold group-hover:text-purple-600 transition-colors">
                  <span className="text-sm">Open messages</span>
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
