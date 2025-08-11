"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const router = useRouter();
  const { login } = useAuth();

  // Check for success message from URL params
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get('message');
      if (message) {
        setSuccessMessage(message);
        // Clear the message from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <div className="auth-section-spacing">
        <Link href="/" className="auth-back-link">
          ← Back to dashboard
        </Link>
      </div>
      
      <div>
        <div className="auth-section-spacing">
          <h1 className="auth-title">
            Sign In
          </h1>
          <p className="auth-subtitle">
            Enter your email and password to sign in to your account.
          </p>
        </div>
        
        {successMessage && (
          <div className="auth-success">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="auth-label">
              Email address <span className="text-red-500">*</span>
            </label>
            <input 
              type="email"
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
          </div>
          
          <div>
            <label className="auth-label">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input-with-icon"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-input-icon"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="auth-checkbox"
              />
              <label htmlFor="remember-me" className="auth-checkbox-label">
                Remember me
              </label>
            </div>
            <Link href="/reset-password" className="auth-link-secondary">
              Forgot password?
            </Link>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="auth-button"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="auth-section-spacing text-center">
          <p className="auth-text-center">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
