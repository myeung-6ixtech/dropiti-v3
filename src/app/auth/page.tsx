'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AuthRedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Get the mode and oobCode from the URL parameters
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    
    // Redirect to the action page with the same parameters
    if (mode && oobCode) {
      router.replace(`/auth/action?mode=${mode}&oobCode=${oobCode}`);
    } else {
      // If no valid parameters, redirect to signin
      router.replace('/auth/signin');
    }
  }, [searchParams, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
