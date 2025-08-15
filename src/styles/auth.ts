/* ========================================
   AUTH STYLE UTILITIES
   ======================================== */

import { componentStyles } from './design-system';

// Export the styles for easy access
export const authStyles = componentStyles.auth;

// Helper function to get all classes for a specific section
export const getAuthClasses = (section: keyof typeof componentStyles.auth) => {
  return componentStyles.auth[section];
};

// Pre-composed class combinations for common use cases
export const authClasses = {
  // Main Layout
  container: 'auth-container',
  formSection: 'auth-form-section',
  contentSection: 'auth-content-section',
  contentWrapper: 'auth-content-wrapper',
  formWrapper: 'auth-form-wrapper',
  
  // Typography
  title: 'auth-title',
  subtitle: 'auth-subtitle',
  heading: 'auth-heading',
  description: 'auth-description',
  textCenter: 'auth-text-center',
  
  // Buttons
  button: 'auth-button',
  buttonSecondary: 'auth-button-secondary',
  
  // Form Elements
  input: 'auth-input',
  inputWithIcon: 'auth-input-with-icon',
  inputIcon: 'auth-input-icon',
  label: 'auth-label',
  form: 'auth-form',
  checkbox: 'auth-checkbox',
  checkboxLabel: 'auth-checkbox-label',
  
  // Spacing and Layout
  sectionSpacing: 'auth-section-spacing',
  contentSpacing: 'auth-content-spacing',
  
  // Links
  backLink: 'auth-back-link',
  link: 'auth-link',
  linkSecondary: 'auth-link-secondary',
  
  // Status Messages
  success: 'auth-success',
  error: 'auth-error',
  
  // Content Features
  featureItem: 'auth-feature-item',
  featureDot: 'auth-feature-dot',
  featureText: 'auth-feature-text',
  
  // Responsive Utilities
  responsive: 'auth-responsive',
  mobileOptimized: 'auth-mobile-optimized',
  
  // Loading States
  loading: 'auth-loading',
  loadingText: 'auth-loading-text',
  
  // Focus States
  focusRing: 'auth-focus-ring',
  
  // Hover Effects
  hover: 'auth-hover',
  
  // Animation Utilities
  fadeIn: 'auth-fade-in',
  slideUp: 'auth-slide-up',
} as const;

// Type for the auth classes
export type AuthSection = keyof typeof authClasses;

// Helper function to combine multiple classes
export const combineAuthClasses = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

// Pre-built class combinations for common patterns
export const authPatterns = {
  // Standard auth form
  standardForm: combineAuthClasses(
    authClasses.formWrapper,
    authClasses.responsive
  ),
  
  // Auth page layout
  pageLayout: combineAuthClasses(
    authClasses.container,
    authClasses.hover
  ),
  
  // Form section
  formSection: combineAuthClasses(
    authClasses.formSection,
    authClasses.mobileOptimized
  ),
  
  // Content section
  contentSection: combineAuthClasses(
    authClasses.contentSection,
    authClasses.fadeIn
  ),
  
  // Input field with icon
  inputWithIcon: combineAuthClasses(
    authClasses.inputWithIcon,
    authClasses.focusRing
  ),
  
  // Button with loading state
  buttonLoading: combineAuthClasses(
    authClasses.button,
    authClasses.loading
  ),
  
  // Success message with animation
  successMessage: combineAuthClasses(
    authClasses.success,
    authClasses.slideUp
  ),
  
  // Error message with animation
  errorMessage: combineAuthClasses(
    authClasses.error,
    authClasses.slideUp
  ),
} as const;

// Common form field patterns
export const authFormPatterns = {
  // Standard form field
  field: {
    container: 'space-y-2',
    label: authClasses.label,
    input: authClasses.input,
    required: 'text-red-500',
  },
  
  // Form field with icon
  fieldWithIcon: {
    container: 'space-y-2',
    label: authClasses.label,
    input: authClasses.inputWithIcon,
    icon: authClasses.inputIcon,
    required: 'text-red-500',
  },
  
  // Checkbox field
  checkbox: {
    container: 'flex items-center',
    input: authClasses.checkbox,
    label: authClasses.checkboxLabel,
  },
  
  // Form actions
  actions: {
    container: 'space-y-4',
    button: authClasses.button,
    buttonSecondary: authClasses.buttonSecondary,
  },
} as const;
