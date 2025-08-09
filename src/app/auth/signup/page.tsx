'use client';

import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form (50%) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white">
        <SignUpForm />
      </div>

      {/* Right Side - Content (50%) */}
      <div className="hidden lg:block flex-1 bg-gray-100">
        <div className="h-full flex flex-col justify-center items-center text-center p-12">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join PropertiesApp
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Create your account and start your journey in real estate. Whether you're looking to rent or list properties, we've got you covered.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span className="text-gray-700">Create your profile</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span className="text-gray-700">Browse properties</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span className="text-gray-700">Connect with landlords</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span className="text-gray-700">Manage your listings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
