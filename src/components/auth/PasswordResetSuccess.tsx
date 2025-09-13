import Link from 'next/link';
import { authClasses } from '@/styles/auth';

export default function PasswordResetSuccess() {
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
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className={authClasses.title}>
                Password Reset Successfully!
              </h1>
              <p className={authClasses.subtitle}>
                Your password has been updated. You can now sign in with your new password.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link href="/auth/signin" className={authClasses.button}>
                Sign In with New Password
              </Link>
              
              <Link href="/" className={authClasses.link}>
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={authClasses.contentSection}>
        <div className={authClasses.contentWrapper}>
          <div className="max-w-md">
            <h2 className={authClasses.headingWhite}>
              Password Updated!
            </h2>
            <p className={authClasses.descriptionWhite}>
              Your password has been successfully changed. You can now access your account with your new secure password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
