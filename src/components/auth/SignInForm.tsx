"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authClasses, authFormPatterns } from "@/styles/auth";
import { AUTH_ERRORS, SUCCESS_MESSAGES } from "@/types/error-messages";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        
        <form onSubmit={handleSubmit} className={authClasses.form}>
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

        <div className={`${authClasses.sectionSpacing} text-center`}>
          <p className={authClasses.textCenter}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className={authClasses.link}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
