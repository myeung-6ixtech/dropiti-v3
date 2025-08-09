'use client';

import SignInForm from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form (50%) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white">
        <SignInForm />
      </div>

      {/* Right Side - Content (50%) */}
      <div className="hidden lg:block flex-1 bg-gray-100">
        <div className="h-full flex flex-col justify-center items-center text-center p-12">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to PropertiesApp
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Find your perfect property or list your space with our comprehensive real estate platform.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span className="text-gray-700">Search thousands of properties</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span className="text-gray-700">Secure authentication</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span className="text-gray-700">Manage your properties</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
