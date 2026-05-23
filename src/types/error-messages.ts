/**
 * Centralized Error Messages
 * 
 * This file contains all error messages used throughout the application.
 * This allows for consistent messaging and easy maintenance.
 */

// ========================================
// AUTHENTICATION ERRORS
// ========================================

export const AUTH_ERRORS = {
  // Sign In Errors
  INVALID_CREDENTIALS: "Invalid email or password",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
  SUCCESS_SIGN_IN: "Successfully signed in!",
  
  // Sign Up Errors
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters long",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists",
  PASSWORD_TOO_WEAK: "Password is too weak",
  SIGNUP_ERROR: "An error occurred during signup",
  ACCOUNT_CREATED_SUCCESS: "Account created successfully! Please check your email to verify your account before signing in.",
  GOOGLE_SIGNUP_DISABLED: "Google sign-up is disabled. Please create an account using email/password first, then link your Google account in Settings.",
  
  // Password Reset Errors
  INVALID_ACTION_LINK: "Invalid action link. Please check your email for the correct link.",
  INVALID_ACTION_MODE: "Invalid action mode. Please check your email for the correct link.",
  ACTION_LINK_EXPIRED: "This action link has expired or is invalid. Please request a new one.",
  ACTION_LINK_EXPIRED_ALT: "This action link has expired. Please request a new one.",
  ACCOUNT_DISABLED: "This account has been disabled. Please contact support.",
  PASSWORD_TOO_SHORT_RESET: "Password must be at least 6 characters long.",
  PASSWORDS_DO_NOT_MATCH_RESET: "Passwords do not match.",
  INVALID_RESET_LINK: "Invalid reset link. Please request a new password reset.",
  PASSWORD_RESET_SUCCESS: "Password reset successfully! You can now sign in with your new password.",
  PASSWORD_RESET_FAILED: "Failed to reset password. Please try again.",
  RESET_LINK_EXPIRED: "This reset link has expired or is invalid. Please request a new password reset.",
  RESET_LINK_EXPIRED_ALT: "This reset link has expired. Please request a new password reset.",
  PASSWORD_TOO_WEAK_RESET: "Password is too weak. Please choose a stronger password.",
} as const;

// Re-export structured auth error resolver (see src/lib/resolveAuthError.ts)
export { mapNhostOAuthError, resolveAuthError } from '@/lib/resolveAuthError';
export type { AuthErrorPresentation, AuthErrorAction } from '@/types/auth-errors';

// ========================================
// GENERAL APPLICATION ERRORS
// ========================================

export const APP_ERRORS = {
  // General Errors
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNAUTHORIZED: "You must be logged in to perform this action.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  
  // Loading Errors
  FAILED_TO_LOAD: "Failed to load data",
  FAILED_TO_LOAD_REVIEWS: "Failed to load reviews",
  FAILED_TO_LOAD_SETTINGS: "Failed to load settings data",
  FAILED_TO_LOAD_CHAT_ROOMS: "Failed to load chat rooms",
  FAILED_TO_LOAD_PROPERTY_DETAILS: "Failed to load property details",
  FAILED_TO_LOAD_RENTAL_INFO: "Failed to load rental information",
  FAILED_TO_LOAD_ADDRESS_DATA: "Failed to load address data",
  
  // Save/Update Errors
  FAILED_TO_SAVE: "Failed to save changes",
  FAILED_TO_SAVE_DRAFT: "Failed to save draft",
  FAILED_TO_UPDATE: "Failed to update data",
  FAILED_TO_UPDATE_PROPERTY_DETAILS: "Failed to update property details",
  FAILED_TO_UPDATE_RENTAL_INFO: "Failed to update rental information",
  FAILED_TO_UPDATE_ADDRESS: "Failed to update address. Please try again.",
  
  // Validation Errors
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_PHONE: "Please enter a valid phone number",
  INVALID_URL: "Please enter a valid URL",
  INVALID_DATE: "Please enter a valid date",
  INVALID_NUMBER: "Please enter a valid number",
  
  // Missing Information
  MISSING_REQUIRED_INFO: "Missing required information to submit review",
  LANDLORD_INFO_NOT_AVAILABLE: "Landlord information not available",
  PROPERTY_INFO_NOT_AVAILABLE: "Property information not available",
} as const;

// ========================================
// OFFER ERRORS
// ========================================

export const OFFER_ERRORS = {
  // General Offer Errors
  FAILED_TO_ACCEPT: "Failed to accept offer. Please try again.",
  FAILED_TO_REJECT: "Failed to reject offer. Please try again.",
  FAILED_TO_WITHDRAW: "Failed to withdraw application",
  FAILED_TO_CREATE: "Failed to create offer",
  FAILED_TO_SUBMIT_COUNTER: "Failed to submit final counter offer. Please try again.",
  
  // Validation Errors
  MUST_BE_LOGGED_IN: "You must be logged in to perform this action",
  CANNOT_CHAT_SELF: "You cannot chat with yourself",
  FAILED_TO_CREATE_CHAT: "Failed to create chat room",
  FAILED_TO_START_CHAT: "Failed to start chat. Please try again.",
  
  // Draft Errors
  MUST_BE_LOGGED_IN_DRAFT: "You must be logged in to save a draft.",
  MINIMAL_DATA_REQUIRED: "Please add at least a property name, type, or address to save a draft.",
} as const;

// ========================================
// REVIEW ERRORS
// ========================================

export const REVIEW_ERRORS = {
  FAILED_TO_SUBMIT: "Failed to submit review. Please try again.",
  FAILED_TO_LOAD: "Failed to load reviews",
  MISSING_INFO: "Missing required information to submit review",
} as const;

// ========================================
// PROPERTY ERRORS
// ========================================

export const PROPERTY_ERRORS = {
  // Address Errors
  ADDRESS_PARSE_ERROR: "Error parsing address data",
  ADDRESS_LOAD_ERROR: "Error loading address data",
  ADDRESS_UPDATE_ERROR: "Error updating address. Please try again.",
  
  // Property Details Errors
  DETAILS_LOAD_ERROR: "Error loading property details",
  DETAILS_UPDATE_ERROR: "Error updating property details. Please try again.",
  
  // Rental Info Errors
  RENTAL_LOAD_ERROR: "Error loading rental information",
  RENTAL_UPDATE_ERROR: "Error updating rental information. Please try again.",
} as const;

// ========================================
// SUCCESS MESSAGES
// ========================================

export const SUCCESS_MESSAGES = {
  // General Success
  SAVED_SUCCESSFULLY: "Saved successfully",
  UPDATED_SUCCESSFULLY: "Updated successfully",
  DELETED_SUCCESSFULLY: "Deleted successfully",
  
  // Authentication Success
  SIGNED_IN: "Successfully signed in!",
  ACCOUNT_CREATED: "Account created successfully! Please check your email to verify your account before signing in.",
  PASSWORD_RESET: "Password reset successfully! You can now sign in with your new password.",
  
  // Offer Success
  OFFER_ACCEPTED: "Offer accepted successfully",
  OFFER_REJECTED: "Offer rejected successfully",
  OFFER_WITHDRAWN: "Offer withdrawn successfully",
  OFFER_CREATED: "Offer created successfully",
  COUNTER_OFFER_SUBMITTED: "Counter offer submitted successfully",
  
  // Review Success
  REVIEW_SUBMITTED: "Review submitted successfully!",
  
  // Property Success
  DRAFT_SAVED: "Draft saved successfully",
  PROPERTY_PUBLISHED: "Property published successfully",
  PROPERTY_UPDATED: "Property updated successfully",
} as const;

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get error message by key with fallback
 */
export function getErrorMessage(
  key: string, 
  fallback: string = "An unexpected error occurred"
): string {
  // Search through all error objects
  const allErrors = {
    ...AUTH_ERRORS,
    ...APP_ERRORS,
    ...OFFER_ERRORS,
    ...REVIEW_ERRORS,
    ...PROPERTY_ERRORS,
  };
  
  return allErrors[key as keyof typeof allErrors] || fallback;
}

/**
 * Get success message by key with fallback
 */
export function getSuccessMessage(
  key: string, 
  fallback: string = "Operation completed successfully"
): string {
  return SUCCESS_MESSAGES[key as keyof typeof SUCCESS_MESSAGES] || fallback;
}

// ========================================
// TYPE EXPORTS
// ========================================

export type AuthErrorKey = keyof typeof AUTH_ERRORS;
export type AppErrorKey = keyof typeof APP_ERRORS;
export type OfferErrorKey = keyof typeof OFFER_ERRORS;
export type ReviewErrorKey = keyof typeof REVIEW_ERRORS;
export type PropertyErrorKey = keyof typeof PROPERTY_ERRORS;
export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES;

export type ErrorKey = AuthErrorKey | AppErrorKey | OfferErrorKey | ReviewErrorKey | PropertyErrorKey;
export type MessageKey = ErrorKey | SuccessMessageKey;
