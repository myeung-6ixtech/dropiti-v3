'use client';

import { 
  ArrowRightIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function LatestNewsSection() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Latest News</h2>
          <div className="w-20 h-1 bg-purple-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* News Item 1 */}
          <div className="group cursor-pointer">
            <div className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-all duration-300">
              <div className="flex items-center mb-2">
                <DocumentTextIcon className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-xs font-medium text-purple-600">Press Release</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
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
                <DocumentTextIcon className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-xs font-medium text-purple-600">Press Release</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
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
                <DocumentTextIcon className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-xs font-medium text-purple-600">Press Release</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
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
          <button className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <span className="text-sm">Read more news</span>
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
