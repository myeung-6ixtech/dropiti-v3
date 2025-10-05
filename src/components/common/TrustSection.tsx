'use client';

import Image from 'next/image';
import { FiAward, FiShield, FiUsers } from 'react-icons/fi';

export default function TrustSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-purple-50 to-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-48 h-48 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-48 h-48 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-48 h-48 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          
          {/* Left side - Cyberport image (desktop) / Bottom (mobile) */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* Cyberport trust image */}
              <Image
                src="/images/dropiti-homepage-trust.webp"
                width={500}
                height={350}
                alt="Cyberport Hong Kong partnership and trust"
                className="object-cover w-full h-auto"
                priority
              />
              
              {/* Floating trust elements */}
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg transform rotate-12 opacity-90 flex items-center justify-center">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg shadow-lg transform -rotate-12 opacity-90 flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-1/2 -left-4 w-8 h-8 bg-purple-300 rounded-full opacity-20 animate-bounce"></div>
            <div className="absolute bottom-1/4 -right-4 w-6 h-6 bg-purple-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Right side - Trust content (desktop) / Top (mobile) */}
          <div className="space-y-5 order-1 lg:order-2">
            {/* Trust badge */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
              <FiAward className="w-3 h-3 mr-1.5" />
              Government-Backed Innovation
            </div>

            {/* Main heading */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                Trusted by{' '}
                <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  Cyberport Hong Kong
                </span>
              </h2>
              
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Dropiti is proud to be a{' '}
                <span className="font-semibold text-purple-700">Cyberport Creative Micro Fund (CCMF)</span>{' '}
                project, recognized for our innovative approach to property technology.
              </p>
            </div>

            {/* Trust indicators */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2.5">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <FiShield className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Government Endorsed</h3>
                  <p className="text-xs text-gray-600">Selected by Hong Kong's premier innovation hub</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2.5">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <FiUsers className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Innovation Focused</h3>
                  <p className="text-xs text-gray-600">Part of Hong Kong's digital transformation initiative</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2.5">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <FiAward className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Quality Assured</h3>
                  <p className="text-xs text-gray-600">Rigorous evaluation process ensures excellence</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-3">
              <button className="inline-flex items-center px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <span className="text-xs">Learn More About Our Story</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
