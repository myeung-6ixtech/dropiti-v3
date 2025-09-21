"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usersAPI } from '@/lib/api-client';
import { useToast } from "@/context/ToastContext";
import { authClasses, authFormPatterns } from "@/styles/auth";
import { AUTH_ERRORS, SUCCESS_MESSAGES } from "@/types/error-messages";

// Validation utilities
const validateEmail = (email: string): { isValid: boolean; message: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    return { isValid: false, message: "Email is required" };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }
  return { isValid: true, message: "" };
};

const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password.trim()) {
    return { isValid: false, message: "Password is required" };
  }
  if (password.length < 6) {
    return { isValid: false, message: "Password must be at least 6 characters long" };
  }
  return { isValid: true, message: "" };
};

const validateName = (name: string): { isValid: boolean; message: string } => {
  if (!name.trim()) {
    return { isValid: false, message: "Full name is required" };
  }
  if (name.trim().length < 2) {
    return { isValid: false, message: "Name must be at least 2 characters long" };
  }
  return { isValid: true, message: "" };
};

const validateConfirmPassword = (password: string, confirmPassword: string): { isValid: boolean; message: string } => {
  if (!confirmPassword.trim()) {
    return { isValid: false, message: "Please confirm your password" };
  }
  if (password !== confirmPassword) {
    return { isValid: false, message: "Passwords do not match" };
  }
  return { isValid: true, message: "" };
};

interface FieldError {
  [key: string]: string;
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  
  const router = useRouter();
  const { showToast } = useToast();

  // Real-time validation functions
  const validateField = (fieldName: string, value: string, additionalValue?: string) => {
    let validation: { isValid: boolean; message: string };
    
    switch (fieldName) {
      case 'name':
        validation = validateName(value);
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'password':
        validation = validatePassword(value);
        break;
      case 'confirmPassword':
        validation = validateConfirmPassword(password, value);
        break;
      default:
        return;
    }

    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: validation.isValid ? '' : validation.message
    }));
  };

  // Handle input changes with validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    validateField('name', value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateField('email', value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validateField('password', value);
    // Re-validate confirm password when password changes
    if (confirmPassword) {
      validateField('confirmPassword', confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateField('confirmPassword', value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);

    // Set all field errors
    setFieldErrors({
      name: nameValidation.isValid ? '' : nameValidation.message,
      email: emailValidation.isValid ? '' : emailValidation.message,
      password: passwordValidation.isValid ? '' : passwordValidation.message,
      confirmPassword: confirmPasswordValidation.isValid ? '' : confirmPasswordValidation.message,
    });

    // Check if any validation failed
    if (!nameValidation.isValid || !emailValidation.isValid || 
        !passwordValidation.isValid || !confirmPasswordValidation.isValid) {
      showToast('error', 'Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Update Firebase profile with display name
      await updateProfile(user, {
        displayName: name
      });

      // Step 3: Send email verification
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/auth/`,
          handleCodeInApp: true,
        };
        await sendEmailVerification(user, actionCodeSettings);
        console.log('Email verification sent successfully');
      } catch (emailError) {
        console.warn('Failed to send email verification:', emailError);
        // Don't fail the signup if email verification fails
      }

      // Step 4: Create user in Hasura database
      try {
        const user = {
          firebase_uid: userCredential.user.uid,
          display_name: name,
          email: email,
          photo_url: '/images/Portrait_Placeholder.png', // Set default profile photo
          auth_provider: 'firebase' as const,
          phone_number: undefined,
          location: undefined,
          about: undefined,
          education: undefined,
          occupation: undefined,
          marital_status: undefined,
          languages: []
        };
        const createUserResponse = await usersAPI.createUser(user);

        if (createUserResponse.success) {
          console.log('User created successfully in database:', createUserResponse.data);
        } else {
          console.warn('Failed to create user in database:', createUserResponse.error);
          // Don't fail the signup if database creation fails, but log it
        }
      } catch (dbError) {
        console.error('Error creating user in database:', dbError);
        // Don't fail the signup if database creation fails, but log it
      }

      // Step 5: Redirect to sign in page with verification message
      router.push(`/auth/signin?message=${SUCCESS_MESSAGES.ACCOUNT_CREATED}`);
    } catch (error: unknown) {
      console.error("Signup error:", error);
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'auth/email-already-in-use') {
          showToast('error', AUTH_ERRORS.EMAIL_ALREADY_EXISTS);
        } else if (error.code === 'auth/weak-password') {
          showToast('error', AUTH_ERRORS.PASSWORD_TOO_WEAK);
        } else {
          showToast('error', AUTH_ERRORS.SIGNUP_ERROR);
        }
      } else {
        showToast('error', AUTH_ERRORS.SIGNUP_ERROR);
      }
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
            Create Account
          </h1>
          <p className={authClasses.subtitle}>
            Sign up to start managing your properties.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className={authClasses.form}>
          <div className={authFormPatterns.field.container}>
            <label className={authFormPatterns.field.label}>
              Full Name <span className={authFormPatterns.field.required}>*</span>
            </label>
            <input 
              type="text"
              placeholder="Enter your full name" 
              value={name}
              onChange={handleNameChange}
              className={`${authFormPatterns.field.input} ${fieldErrors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
              required
            />
            {fieldErrors.name && (
              <p className="text-red-500 text-sm mt-1 text-left">{fieldErrors.name}</p>
            )}
          </div>

          <div className={authFormPatterns.field.container}>
            <label className={authFormPatterns.field.label}>
              Email address <span className={authFormPatterns.field.required}>*</span>
            </label>
            <input 
              type="email"
              placeholder="Enter your email" 
              value={email}
              onChange={handleEmailChange}
              className={`${authFormPatterns.field.input} ${fieldErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
              required
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1 text-left">{fieldErrors.email}</p>
            )}
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
                onChange={handlePasswordChange}
                className={`${authFormPatterns.fieldWithIcon.input} ${fieldErrors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
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
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1 text-left">{fieldErrors.password}</p>
            )}
          </div>

          <div className={authFormPatterns.fieldWithIcon.container}>
            <label className={authFormPatterns.fieldWithIcon.label}>
              Confirm Password <span className={authFormPatterns.fieldWithIcon.required}>*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`${authFormPatterns.fieldWithIcon.input} ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={authFormPatterns.fieldWithIcon.icon}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1 text-left">{fieldErrors.confirmPassword}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={authClasses.button}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <div className={`${authClasses.sectionSpacing} text-center`}>
          <p className={authClasses.textCenter}>
            Already have an account?{" "}
            <Link href="/auth/signin" className={authClasses.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}