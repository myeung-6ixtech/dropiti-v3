"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { nhost } from '@/lib/nhost';
import { usersAPI } from '@/lib/api-client';
import { useToast } from "@/context/ToastContext";
import { authClasses, authFormPatterns } from "@/styles/auth";
import { AUTH_ERRORS, SUCCESS_MESSAGES } from "@/types/error-messages";
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

const validateEmail = (email: string): { isValid: boolean; message: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return { isValid: false, message: "Email is required" };
  if (!emailRegex.test(email)) return { isValid: false, message: "Please enter a valid email address" };
  return { isValid: true, message: "" };
};

const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password.trim()) return { isValid: false, message: "Password is required" };
  if (password.length < 6) return { isValid: false, message: "Password must be at least 6 characters long" };
  return { isValid: true, message: "" };
};

const validateName = (name: string): { isValid: boolean; message: string } => {
  if (!name.trim()) return { isValid: false, message: "Full name is required" };
  if (name.trim().length < 2) return { isValid: false, message: "Name must be at least 2 characters long" };
  return { isValid: true, message: "" };
};

const validateConfirmPassword = (password: string, confirmPassword: string): { isValid: boolean; message: string } => {
  if (!confirmPassword.trim()) return { isValid: false, message: "Please confirm your password" };
  if (password !== confirmPassword) return { isValid: false, message: "Passwords do not match" };
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

  const validateField = (fieldName: string, value: string) => {
    let validation: { isValid: boolean; message: string };
    switch (fieldName) {
      case 'name': validation = validateName(value); break;
      case 'email': validation = validateEmail(value); break;
      case 'password': validation = validatePassword(value); break;
      case 'confirmPassword': validation = validateConfirmPassword(password, value); break;
      default: return;
    }
    setFieldErrors(prev => ({ ...prev, [fieldName]: validation.isValid ? '' : validation.message }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => { setName(e.target.value); validateField('name', e.target.value); };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); validateField('email', e.target.value); };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    validateField('password', e.target.value);
    if (confirmPassword) validateField('confirmPassword', confirmPassword);
  };
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => { setConfirmPassword(e.target.value); validateField('confirmPassword', e.target.value); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameV = validateName(name);
    const emailV = validateEmail(email);
    const passV = validatePassword(password);
    const confirmV = validateConfirmPassword(password, confirmPassword);

    setFieldErrors({
      name: nameV.isValid ? '' : nameV.message,
      email: emailV.isValid ? '' : emailV.message,
      password: passV.isValid ? '' : passV.message,
      confirmPassword: confirmV.isValid ? '' : confirmV.message,
    });

    if (!nameV.isValid || !emailV.isValid || !passV.isValid || !confirmV.isValid) {
      showToast('error', 'Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create Nhost auth user
      const { session, error } = await nhost.auth.signUp({
        email,
        password,
        options: { displayName: name },
      });

      if (error) {
        const code = (error as { error?: string })?.error || '';
        if (code === 'email-already-in-use') {
          showToast('error', AUTH_ERRORS.EMAIL_ALREADY_EXISTS);
        } else if (code === 'weak-password') {
          showToast('error', AUTH_ERRORS.PASSWORD_TOO_WEAK);
        } else {
          showToast('error', AUTH_ERRORS.SIGNUP_ERROR);
        }
        return;
      }

      if (!session) {
        // Nhost may require email verification before the session is active
        showToast('success', 'Account created! Please check your email to verify your address.');
        router.push(`/auth/signin?message=${SUCCESS_MESSAGES.ACCOUNT_CREATED}`);
        return;
      }

      // Step 2: Create DB profile row
      try {
        await usersAPI.createUser({
          nhost_user_id: session.user.id,
          display_name: name,
          email,
          photo_url: '/images/Portrait_Placeholder.png',
          auth_provider: 'email',
        });
      } catch (dbErr) {
        console.error('Failed to create DB profile:', dbErr);
      }

      router.push(`/auth/signin?message=${SUCCESS_MESSAGES.ACCOUNT_CREATED}`);
    } catch (error: unknown) {
      console.error("Signup error:", error);
      showToast('error', AUTH_ERRORS.SIGNUP_ERROR);
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
          <h1 className={authClasses.title}>Create Account</h1>
          <p className={authClasses.subtitle}>Sign up to start managing your properties.</p>
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
            {fieldErrors.name && <p className="text-red-500 text-sm mt-1 text-left">{fieldErrors.name}</p>}
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
            {fieldErrors.email && <p className="text-red-500 text-sm mt-1 text-left">{fieldErrors.email}</p>}
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
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={authFormPatterns.fieldWithIcon.icon}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-500 text-sm mt-1 text-left">{fieldErrors.password}</p>}
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
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={authFormPatterns.fieldWithIcon.icon}>
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.confirmPassword && <p className="text-red-500 text-sm mt-1 text-left">{fieldErrors.confirmPassword}</p>}
          </div>

          <div>
            <button type="submit" disabled={isLoading} className={authClasses.button}>
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <div className="auth-divider">
          <span className="auth-divider-text">or</span>
        </div>

        <GoogleSignInButton mode="signup" />

        <div className={`${authClasses.sectionSpacing} text-center`}>
          <p className={authClasses.textCenter}>
            Already have an account?{" "}
            <Link href="/auth/signin" className={authClasses.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
