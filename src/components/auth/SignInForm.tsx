"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authClasses, authFormPatterns } from "@/styles/auth";
import { AUTH_ERRORS, SUCCESS_MESSAGES } from "@/types/error-messages";
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AuthErrorAlert from '@/components/auth/AuthErrorAlert';
import {
  consumeOAuthErrorPresentation,
  getCallbackUrlFromSearch,
  getOAuthErrorFromUrl,
} from '@/lib/oauthCallback';
import { resolveAuthError } from '@/lib/resolveAuthError';
import type { AuthErrorPresentation } from '@/types/auth-errors';

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [authError, setAuthError] = useState<AuthErrorPresentation | null>(null);

  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message) {
      setSuccessMessage(message);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    let presentation = consumeOAuthErrorPresentation();

    if (!presentation) {
      const urlError = getOAuthErrorFromUrl();
      if (urlError) {
        presentation = resolveAuthError({
          code: urlError.code,
          description: urlError.description,
        });
      }
    }

    if (presentation) {
      setAuthError(presentation);
      showToast('error', presentation.message);
      if (urlParams.has('oauth_error') || urlParams.has('error')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    const savedRememberMe = localStorage.getItem('dropiti_remember_me');
    if (savedRememberMe === 'true') {
      setRememberMe(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    try {
      localStorage.setItem('dropiti_remember_me', rememberMe.toString());

      const result = await login(email, password, rememberMe);

      if (result.success) {
        showToast('success', SUCCESS_MESSAGES.SIGNED_IN);
        router.push(getCallbackUrlFromSearch());
      } else {
        const presentation =
          result.presentation ??
          resolveAuthError({ code: result.errorCode, message: result.error });
        setAuthError(presentation);
        showToast('error', presentation.message);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      const presentation = resolveAuthError({ code: 'unknown' });
      setAuthError(presentation);
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

        {authError && (
          <AuthErrorAlert
            presentation={authError}
            onDismiss={() => setAuthError(null)}
          />
        )}

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

      <div id="recaptcha-container"></div>
    </div>
  );
}
