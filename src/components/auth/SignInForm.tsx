"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authClasses, authFormPatterns } from "@/styles/auth";
import { AUTH_ERRORS, SUCCESS_MESSAGES } from "@/types/error-messages";
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import PhoneInput from '@/components/common/PhoneInput';

type SignInMethod = 'email' | 'phone';

export default function SignInForm() {
  const [signInMethod, setSignInMethod] = useState<SignInMethod>('email');
  const [showPassword, setShowPassword] = useState(false);
  
  // Email sign-in
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Phone sign-in
  const [areaCode, setAreaCode] = useState('+852');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  // Check for success message from URL params and load remember me preference
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get('message');
      if (message) {
        setSuccessMessage(message);
        // Clear the message from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Load remember me preference from localStorage
      const savedRememberMe = localStorage.getItem('dropiti_remember_me');
      if (savedRememberMe === 'true') {
        setRememberMe(true);
      }
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save remember me preference to localStorage
      localStorage.setItem('dropiti_remember_me', rememberMe.toString());
      
      const result = await login(email, password, rememberMe);
      
      if (result.success) {
        showToast('success', SUCCESS_MESSAGES.SIGNED_IN);
        router.push("/dashboard");
      } else {
        showToast('error', result.error || AUTH_ERRORS.INVALID_CREDENTIALS);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      showToast('error', AUTH_ERRORS.UNEXPECTED_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement Firebase phone authentication
      // For now, just show a coming soon message
      showToast('info', 'Phone sign-in coming soon! Please use email/password for now.');
    } catch (error) {
      console.error('Phone sign-in error:', error);
      showToast('error', 'An error occurred during phone sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={authClasses.formWrapper}>
      <div className={authClasses.sectionSpacing}>
        <Link href="/" className={authClasses.backLink}>
          ← Back to homepage
        </Link>
      </div>
      
      <div>
        <div className={authClasses.sectionSpacing}>
          <h1 className={authClasses.title}>
            Sign In
          </h1>
          <p className={authClasses.subtitle}>
            Enter your email and password to sign in to your account.
          </p>
        </div>
        
        {successMessage && (
          <div className={authClasses.success}>
            {successMessage}
          </div>
        )}

        {/* Sign-in method toggle */}
        <div className="mb-6">
          <div className="flex rounded-lg border border-gray-300 p-1 bg-gray-50">
            <button
              type="button"
              onClick={() => setSignInMethod('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                signInMethod === 'email'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setSignInMethod('phone')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                signInMethod === 'phone'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Phone Number
            </button>
          </div>
        </div>
        
        {/* Email Sign-In Form */}
        {signInMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className={authClasses.form}>
          <div className={authFormPatterns.field.container}>
            <label className={authFormPatterns.field.label}>
              Email address <span className={authFormPatterns.field.required}>*</span>
            </label>
            <input 
              type="email"
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authFormPatterns.field.input}
              required
            />
          </div>
          
          <div className={authFormPatterns.fieldWithIcon.container}>
            <label className={authFormPatterns.fieldWithIcon.label}>
              Password <span className={authFormPatterns.fieldWithIcon.required}>*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={authFormPatterns.fieldWithIcon.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={authFormPatterns.fieldWithIcon.icon}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className={authFormPatterns.checkbox.container}>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={authFormPatterns.checkbox.input}
              />
              <label htmlFor="remember-me" className={authFormPatterns.checkbox.label}>
                Remember me
              </label>
            </div>
            <Link href="/auth/reset-password" className={authClasses.linkSecondary}>
              Forgot password?
            </Link>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={authClasses.button}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
        )}

        {/* Phone Sign-In Form */}
        {signInMethod === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className={authClasses.form}>
            <PhoneInput
              areaCode={areaCode}
              phoneNumber={phoneNumber}
              onAreaCodeChange={setAreaCode}
              onPhoneNumberChange={setPhoneNumber}
              required={true}
              placeholder="1234 5678"
            />

            {codeSent && (
              <div className={authFormPatterns.field.container}>
                <label className={authFormPatterns.field.label}>
                  Verification Code <span className={authFormPatterns.field.required}>*</span>
                </label>
                <input 
                  type="text"
                  placeholder="Enter 6-digit code" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className={authFormPatterns.field.input}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  We sent a verification code to {areaCode} {phoneNumber}
                </p>
              </div>
            )}
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={authClasses.button}
              >
                {isLoading 
                  ? "Processing..." 
                  : codeSent 
                    ? "Verify Code" 
                    : "Send Code"}
              </button>
            </div>

            {codeSent && (
              <button
                type="button"
                onClick={() => {
                  setCodeSent(false);
                  setVerificationCode('');
                  showToast('info', 'Resend code functionality coming soon');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Resend code
              </button>
            )}
          </form>
        )}

        {/* Social sign-in */}
        <div className="auth-divider">
          <span className="auth-divider-text">or</span>
        </div>

        <GoogleSignInButton mode="signin" />

        <div className={`${authClasses.sectionSpacing} text-center`}>
          <p className={authClasses.textCenter}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className={authClasses.link}>
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* reCAPTCHA container (invisible) */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
