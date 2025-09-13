import Link from 'next/link';
import { authClasses } from '@/styles/auth';

interface AuthActionErrorProps {
  error: string;
  actionMode?: string | null;
}

export default function AuthActionError({ error, actionMode }: AuthActionErrorProps) {
  return (
    <div className={authClasses.container}>
      <div className={authClasses.formSection}>
        <div className={authClasses.formWrapper}>
          <div className={authClasses.sectionSpacing}>
            <Link href="/" className={authClasses.backLink}>
              ← Back to homepage
            </Link>
          </div>
          
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className={authClasses.title}>
                {actionMode === 'resetPassword' ? 'Invalid Reset Link' : 'Invalid Action Link'}
              </h1>
              <p className={authClasses.subtitle}>
                {error || 'This action link is invalid or has expired.'}
              </p>
            </div>
            
            <div className="space-y-3">
              {actionMode === 'resetPassword' ? (
                <Link href="/auth/reset-password" className={authClasses.button}>
                  Request New Reset Link
                </Link>
              ) : (
                <Link href="/" className={authClasses.button}>
                  Go to Homepage
                </Link>
              )}
              
              <Link href="/auth/signin" className={authClasses.link}>
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={authClasses.contentSection}>
        <div className={authClasses.contentWrapper}>
          <div className="max-w-md">
            <h2 className={authClasses.headingWhite}>
              {actionMode === 'resetPassword' ? 'Link Expired' : 'Invalid Action'}
            </h2>
            <p className={authClasses.descriptionWhite}>
              {actionMode === 'resetPassword' 
                ? 'Action links expire for security reasons. Request a new one to continue.'
                : 'This action link is invalid or has expired. Please check your email for the correct link.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
