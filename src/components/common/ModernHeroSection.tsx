'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import Image from 'next/image';

export default function ModernHeroSection() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  const handleLearnMore = () => {
    router.push('/search');
  };

  return (
    <section className="relative bg-white overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
              <FiCheckCircle className="w-3 h-3 mr-1.5" />
              Trusted by thousands of renters
            </div>

            {/* Main heading - Scaled down from hero section */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Looking to rent a{' '}
                <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  new home
                </span>
              </h2>
              
              {/* Scaled down subtitle */}
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg">
                Sign up to dropiti and we can make your move easier!
              </p>
            </div>

            {/* Features list - Scaled down */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700 font-medium">Find verified properties instantly</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700 font-medium">Direct communication with landlords</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700 font-medium">Secure and transparent process</span>
              </div>
            </div>

            {/* CTA Buttons - Scaled down */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleGetStarted}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out"
              >
                <span className="relative z-10">Get Started</span>
                <FiArrowRight className={`ml-1.5 w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button
                onClick={handleLearnMore}
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-purple-700 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Explore Properties
              </button>
            </div>
          </div>

          {/* Right side - Image without container box */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Direct image without container - using transparent background PNG */}
            <div className="relative w-full max-w-md lg:max-w-lg">
              <Image
                src="/images/dropiti-homepage-004-nobg.png"
                alt="Modern cityscape with beautiful buildings and serene atmosphere"
                width={600}
                height={400}
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* Decorative elements - Scaled down */}
            <div className="absolute top-1/2 -left-6 w-12 h-12 bg-purple-400 rounded-full opacity-20 animate-bounce"></div>
            <div className="absolute bottom-1/4 -right-6 w-8 h-8 bg-purple-300 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
