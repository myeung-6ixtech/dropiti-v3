/**
 * Translation utilities for error messages and other text
 */

import { AUTH_ERRORS, APP_ERRORS, SUCCESS_MESSAGES } from '@/types/error-messages';

// Translation mappings for error messages
const errorTranslations = {
  en: {
    // Auth errors
    [AUTH_ERRORS.INVALID_CREDENTIALS]: "Invalid email or password",
    [AUTH_ERRORS.UNEXPECTED_ERROR]: "An unexpected error occurred. Please try again.",
    [AUTH_ERRORS.SUCCESS_SIGN_IN]: "Successfully signed in!",
    [AUTH_ERRORS.PASSWORDS_DO_NOT_MATCH]: "Passwords do not match",
    [AUTH_ERRORS.PASSWORD_TOO_SHORT]: "Password must be at least 6 characters long",
    [AUTH_ERRORS.EMAIL_ALREADY_EXISTS]: "An account with this email already exists",
    [AUTH_ERRORS.PASSWORD_TOO_WEAK]: "Password is too weak",
    [AUTH_ERRORS.SIGNUP_ERROR]: "An error occurred during signup",
    [AUTH_ERRORS.ACCOUNT_CREATED_SUCCESS]: "Account created successfully! Please check your email to verify your account before signing in.",
    [AUTH_ERRORS.INVALID_ACTION_LINK]: "Invalid action link. Please check your email for the correct link.",
    [AUTH_ERRORS.INVALID_ACTION_MODE]: "Invalid action mode. Please check your email for the correct link.",
    [AUTH_ERRORS.ACTION_LINK_EXPIRED]: "This action link has expired or is invalid. Please request a new one.",
    [AUTH_ERRORS.ACTION_LINK_EXPIRED_ALT]: "This action link has expired. Please request a new one.",
    [AUTH_ERRORS.ACCOUNT_DISABLED]: "This account has been disabled. Please contact support.",
    [AUTH_ERRORS.PASSWORD_TOO_SHORT_RESET]: "Password must be at least 6 characters long.",
    [AUTH_ERRORS.PASSWORDS_DO_NOT_MATCH_RESET]: "Passwords do not match.",
    [AUTH_ERRORS.INVALID_RESET_LINK]: "Invalid reset link. Please request a new password reset.",
    [AUTH_ERRORS.PASSWORD_RESET_SUCCESS]: "Password reset successfully! You can now sign in with your new password.",
    [AUTH_ERRORS.PASSWORD_RESET_FAILED]: "Failed to reset password. Please try again.",
    [AUTH_ERRORS.RESET_LINK_EXPIRED]: "This reset link has expired or is invalid. Please request a new password reset.",
    [AUTH_ERRORS.RESET_LINK_EXPIRED_ALT]: "This reset link has expired. Please request a new password reset.",
    [AUTH_ERRORS.PASSWORD_TOO_WEAK_RESET]: "Password is too weak. Please choose a stronger password.",

    // App errors
    [APP_ERRORS.NETWORK_ERROR]: "Network error. Please check your connection and try again.",
    [APP_ERRORS.UNAUTHORIZED]: "You must be logged in to perform this action.",
    [APP_ERRORS.FORBIDDEN]: "You don't have permission to perform this action.",
    [APP_ERRORS.NOT_FOUND]: "The requested resource was not found.",
    [APP_ERRORS.SERVER_ERROR]: "Server error. Please try again later.",
    [APP_ERRORS.FAILED_TO_LOAD]: "Failed to load data",
    [APP_ERRORS.FAILED_TO_LOAD_REVIEWS]: "Failed to load reviews",
    [APP_ERRORS.FAILED_TO_LOAD_SETTINGS]: "Failed to load settings data",
    [APP_ERRORS.FAILED_TO_LOAD_CHAT_ROOMS]: "Failed to load chat rooms",
    [APP_ERRORS.FAILED_TO_LOAD_PROPERTY_DETAILS]: "Failed to load property details",
    [APP_ERRORS.FAILED_TO_LOAD_RENTAL_INFO]: "Failed to load rental information",
    [APP_ERRORS.FAILED_TO_LOAD_ADDRESS_DATA]: "Failed to load address data",
    [APP_ERRORS.FAILED_TO_SAVE]: "Failed to save changes",
    [APP_ERRORS.FAILED_TO_SAVE_DRAFT]: "Failed to save draft",
    [APP_ERRORS.FAILED_TO_UPDATE]: "Failed to update data",
    [APP_ERRORS.FAILED_TO_UPDATE_PROPERTY_DETAILS]: "Failed to update property details",
    [APP_ERRORS.FAILED_TO_UPDATE_RENTAL_INFO]: "Failed to update rental information",
    [APP_ERRORS.FAILED_TO_UPDATE_ADDRESS]: "Failed to update address. Please try again.",
    [APP_ERRORS.REQUIRED_FIELD]: "This field is required",
    [APP_ERRORS.INVALID_EMAIL]: "Please enter a valid email address",
    [APP_ERRORS.INVALID_PHONE]: "Please enter a valid phone number",
    [APP_ERRORS.INVALID_URL]: "Please enter a valid URL",
    [APP_ERRORS.INVALID_DATE]: "Please enter a valid date",
    [APP_ERRORS.INVALID_NUMBER]: "Please enter a valid number",
    [APP_ERRORS.MISSING_REQUIRED_INFO]: "Missing required information to submit review",
    [APP_ERRORS.LANDLORD_INFO_NOT_AVAILABLE]: "Landlord information not available",
    [APP_ERRORS.PROPERTY_INFO_NOT_AVAILABLE]: "Property information not available",

    // Success messages
    [SUCCESS_MESSAGES.SAVED_SUCCESSFULLY]: "Saved successfully",
    [SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY]: "Updated successfully",
    [SUCCESS_MESSAGES.DELETED_SUCCESSFULLY]: "Deleted successfully",
    [SUCCESS_MESSAGES.OFFER_ACCEPTED]: "Offer accepted successfully",
    [SUCCESS_MESSAGES.OFFER_REJECTED]: "Offer rejected successfully",
    [SUCCESS_MESSAGES.OFFER_WITHDRAWN]: "Offer withdrawn successfully",
    [SUCCESS_MESSAGES.OFFER_CREATED]: "Offer created successfully",
    [SUCCESS_MESSAGES.COUNTER_OFFER_SUBMITTED]: "Counter offer submitted successfully",
    [SUCCESS_MESSAGES.REVIEW_SUBMITTED]: "Review submitted successfully!",
    [SUCCESS_MESSAGES.DRAFT_SAVED]: "Draft saved successfully",
    [SUCCESS_MESSAGES.PROPERTY_PUBLISHED]: "Property published successfully",
    [SUCCESS_MESSAGES.PROPERTY_UPDATED]: "Property updated successfully",
  },
  'zh-HK': {
    // Auth errors
    [AUTH_ERRORS.INVALID_CREDENTIALS]: "無效的電郵或密碼",
    [AUTH_ERRORS.UNEXPECTED_ERROR]: "發生意外錯誤。請重試。",
    [AUTH_ERRORS.SUCCESS_SIGN_IN]: "登入成功！",
    [AUTH_ERRORS.PASSWORDS_DO_NOT_MATCH]: "密碼不匹配",
    [AUTH_ERRORS.PASSWORD_TOO_SHORT]: "密碼必須至少 6 個字符",
    [AUTH_ERRORS.EMAIL_ALREADY_EXISTS]: "此電郵已存在帳戶",
    [AUTH_ERRORS.PASSWORD_TOO_WEAK]: "密碼太弱",
    [AUTH_ERRORS.SIGNUP_ERROR]: "註冊時發生錯誤",
    [AUTH_ERRORS.ACCOUNT_CREATED_SUCCESS]: "帳戶建立成功！請檢查您的電郵以驗證帳戶後再登入。",
    [AUTH_ERRORS.INVALID_ACTION_LINK]: "無效的操作連結。請檢查您的電郵以獲取正確的連結。",
    [AUTH_ERRORS.INVALID_ACTION_MODE]: "無效的操作模式。請檢查您的電郵以獲取正確的連結。",
    [AUTH_ERRORS.ACTION_LINK_EXPIRED]: "此操作連結已過期或無效。請申請新的連結。",
    [AUTH_ERRORS.ACTION_LINK_EXPIRED_ALT]: "此操作連結已過期。請申請新的連結。",
    [AUTH_ERRORS.ACCOUNT_DISABLED]: "此帳戶已被停用。請聯絡支援。",
    [AUTH_ERRORS.PASSWORD_TOO_SHORT_RESET]: "密碼必須至少 6 個字符。",
    [AUTH_ERRORS.PASSWORDS_DO_NOT_MATCH_RESET]: "密碼不匹配。",
    [AUTH_ERRORS.INVALID_RESET_LINK]: "無效的重置連結。請申請新的密碼重置。",
    [AUTH_ERRORS.PASSWORD_RESET_SUCCESS]: "密碼重置成功！您現在可以使用新密碼登入。",
    [AUTH_ERRORS.PASSWORD_RESET_FAILED]: "密碼重置失敗。請重試。",
    [AUTH_ERRORS.RESET_LINK_EXPIRED]: "此重置連結已過期或無效。請申請新的密碼重置。",
    [AUTH_ERRORS.RESET_LINK_EXPIRED_ALT]: "此重置連結已過期。請申請新的密碼重置。",
    [AUTH_ERRORS.PASSWORD_TOO_WEAK_RESET]: "密碼太弱。請選擇更強的密碼。",

    // App errors
    [APP_ERRORS.NETWORK_ERROR]: "網絡錯誤。請檢查您的連接並重試。",
    [APP_ERRORS.UNAUTHORIZED]: "您必須登入才能執行此操作。",
    [APP_ERRORS.FORBIDDEN]: "您沒有權限執行此操作。",
    [APP_ERRORS.NOT_FOUND]: "找不到請求的資源。",
    [APP_ERRORS.SERVER_ERROR]: "伺服器錯誤。請稍後重試。",
    [APP_ERRORS.FAILED_TO_LOAD]: "載入數據失敗",
    [APP_ERRORS.FAILED_TO_LOAD_REVIEWS]: "載入評論失敗",
    [APP_ERRORS.FAILED_TO_LOAD_SETTINGS]: "載入設定數據失敗",
    [APP_ERRORS.FAILED_TO_LOAD_CHAT_ROOMS]: "載入聊天室失敗",
    [APP_ERRORS.FAILED_TO_LOAD_PROPERTY_DETAILS]: "載入物業詳情失敗",
    [APP_ERRORS.FAILED_TO_LOAD_RENTAL_INFO]: "載入租賃資訊失敗",
    [APP_ERRORS.FAILED_TO_LOAD_ADDRESS_DATA]: "載入地址數據失敗",
    [APP_ERRORS.FAILED_TO_SAVE]: "儲存變更失敗",
    [APP_ERRORS.FAILED_TO_SAVE_DRAFT]: "儲存草稿失敗",
    [APP_ERRORS.FAILED_TO_UPDATE]: "更新數據失敗",
    [APP_ERRORS.FAILED_TO_UPDATE_PROPERTY_DETAILS]: "更新物業詳情失敗",
    [APP_ERRORS.FAILED_TO_UPDATE_RENTAL_INFO]: "更新租賃資訊失敗",
    [APP_ERRORS.FAILED_TO_UPDATE_ADDRESS]: "更新地址失敗。請重試。",
    [APP_ERRORS.REQUIRED_FIELD]: "此欄位為必填",
    [APP_ERRORS.INVALID_EMAIL]: "請輸入有效的電郵地址",
    [APP_ERRORS.INVALID_PHONE]: "請輸入有效的電話號碼",
    [APP_ERRORS.INVALID_URL]: "請輸入有效的網址",
    [APP_ERRORS.INVALID_DATE]: "請輸入有效的日期",
    [APP_ERRORS.INVALID_NUMBER]: "請輸入有效的數字",
    [APP_ERRORS.MISSING_REQUIRED_INFO]: "缺少提交評論所需的資訊",
    [APP_ERRORS.LANDLORD_INFO_NOT_AVAILABLE]: "房東資訊不可用",
    [APP_ERRORS.PROPERTY_INFO_NOT_AVAILABLE]: "物業資訊不可用",

    // Success messages
    [SUCCESS_MESSAGES.SAVED_SUCCESSFULLY]: "儲存成功",
    [SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY]: "更新成功",
    [SUCCESS_MESSAGES.DELETED_SUCCESSFULLY]: "刪除成功",
    [SUCCESS_MESSAGES.OFFER_ACCEPTED]: "出價接受成功",
    [SUCCESS_MESSAGES.OFFER_REJECTED]: "出價拒絕成功",
    [SUCCESS_MESSAGES.OFFER_WITHDRAWN]: "出價撤回成功",
    [SUCCESS_MESSAGES.OFFER_CREATED]: "出價建立成功",
    [SUCCESS_MESSAGES.COUNTER_OFFER_SUBMITTED]: "反出價提交成功",
    [SUCCESS_MESSAGES.REVIEW_SUBMITTED]: "評論提交成功！",
    [SUCCESS_MESSAGES.DRAFT_SAVED]: "草稿儲存成功",
    [SUCCESS_MESSAGES.PROPERTY_PUBLISHED]: "物業發布成功",
    [SUCCESS_MESSAGES.PROPERTY_UPDATED]: "物業更新成功",
  }
};

/**
 * Get translated error message
 */
export function getTranslatedError(key: string, locale: string = 'en'): string {
  const translations = errorTranslations[locale as keyof typeof errorTranslations] || errorTranslations.en;
  return translations[key as keyof typeof translations] || key;
}

/**
 * Get translated success message
 */
export function getTranslatedSuccess(key: string, locale: string = 'en'): string {
  const translations = errorTranslations[locale as keyof typeof errorTranslations] || errorTranslations.en;
  return translations[key as keyof typeof translations] || key;
}

/**
 * Get translated message (works for both errors and success)
 */
export function getTranslatedMessage(key: string, locale: string = 'en'): string {
  return getTranslatedError(key, locale) || getTranslatedSuccess(key, locale) || key;
}
