import { useState } from 'react';
import Link from 'next/link';
import { authClasses, authFormPatterns } from '@/styles/auth';

interface PasswordResetFormProps {
  onSubmit: (password: string, confirmPassword: string) => Promise<void>;
  isLoading: boolean;
  error: string;
}

export default function PasswordResetForm({ onSubmit, isLoading, error }: PasswordResetFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(password, confirmPassword);
  };

  return (
    <div className={authClasses.container}>
      <div className={authClasses.formSection}>
        <div className={authClasses.formWrapper}>
          <div className={authClasses.sectionSpacing}>
            <Link href="/" className={authClasses.backLink}>
              ← Back to homepage
            </Link>
          </div>
          
          <div>
            <div className={authClasses.sectionSpacing}>
              <h1 className={authClasses.title}>
                Create New Password
              </h1>
              <p className={authClasses.subtitle}>
                Enter your new password below. Make sure it's secure and easy to remember.
              </p>
            </div>
            
            {error && (
              <div className={authClasses.error}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className={authClasses.form}>
              <div className={authFormPatterns.fieldWithIcon.container}>
                <label className={authFormPatterns.fieldWithIcon.label}>
                  New Password <span className={authFormPatterns.fieldWithIcon.required}>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={authFormPatterns.fieldWithIcon.input}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={authFormPatterns.fieldWithIcon.icon}
                    disabled={isLoading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div className={authFormPatterns.fieldWithIcon.container}>
                <label className={authFormPatterns.fieldWithIcon.label}>
                  Confirm New Password <span className={authFormPatterns.fieldWithIcon.required}>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={authFormPatterns.fieldWithIcon.input}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={authFormPatterns.fieldWithIcon.icon}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading || !password.trim() || !confirmPassword.trim()}
                  className={authClasses.button}
                >
                  {isLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>

            <div className={`${authClasses.sectionSpacing} text-center`}>
              <p className={authClasses.textCenter}>
                Remember your password?{" "}
                <Link href="/auth/signin" className={authClasses.link}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={authClasses.contentSection}>
        <div className={authClasses.contentWrapper}>
          <div className="max-w-md">
            <h2 className={authClasses.headingWhite}>
              Create New Password
            </h2>
            <p className={authClasses.descriptionWhite}>
              Choose a strong, secure password that you'll remember. Your new password will protect your account and all your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
