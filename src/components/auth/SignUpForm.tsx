"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  
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
            Create Account
          </h1>
          <p className="auth-subtitle">
            Enter your details to create your account.
          </p>
        </div>
        
        <form className="auth-form">
          <div className="auth-form-row">
            {/* First Name */}
            <div>
              <label className="auth-label">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fname"
                name="fname"
                placeholder="Enter your first name"
                className="auth-input"
                required
              />
            </div>
            {/* Last Name */}
            <div>
              <label className="auth-label">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lname"
                name="lname"
                placeholder="Enter your last name"
                className="auth-input"
                required
              />
            </div>
          </div>
          
          {/* Email */}
          <div>
            <label className="auth-label">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="auth-input"
              required
            />
          </div>
          
          {/* Password */}
          <div>
            <label className="auth-label">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
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
          
          {/* Checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="auth-checkbox mt-0.5"
            />
            <label htmlFor="terms" className="auth-text">
              By creating an account, you agree to our{" "}
              <span className="auth-link">Terms and Conditions</span>{" "}
              and{" "}
              <span className="auth-link">Privacy Policy</span>
            </label>
          </div>
          
          {/* Button */}
          <div>
            <button type="submit" className="auth-button">
              Create account
            </button>
          </div>
        </form>

        <div className="auth-section-spacing text-center">
          <p className="auth-text-center">
            Already have an account?{" "}
            <Link href="/auth/signin" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
