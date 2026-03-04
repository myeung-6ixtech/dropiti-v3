// ========================================
// AUTHENTICATION TYPES
// ========================================

// ========================================
// AUTH CONTEXT TYPES
// ========================================

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ error?: string }>;
  logout: () => void;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}

// ========================================
// AUTHENTICATION FORMS
// ========================================

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'landlord' | 'tenant';
  acceptTerms: boolean;
}

export interface PasswordResetFormData {
  email: string;
}

export interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
  token: string;
}

// ========================================
// AUTHENTICATION RESPONSES
// ========================================

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
  message?: string;
  token?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  error?: string;
}

// ========================================
// AUTHENTICATION ERRORS
// ========================================

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
  timestamp?: string;
}

export type AuthErrorCode = 
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS'
  | 'WEAK_PASSWORD'
  | 'INVALID_EMAIL'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'RATE_LIMIT_EXCEEDED'
  | 'ACCOUNT_LOCKED'
  | 'EMAIL_NOT_VERIFIED';

// ========================================
// AUTHENTICATION SETTINGS
// ========================================

export interface AuthSettings {
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  allowSocialLogin: boolean;
  passwordMinLength: number;
  sessionTimeout: number; // in minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
}

// ========================================
// SOCIAL LOGIN TYPES
// ========================================

export interface SocialLoginProvider {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export interface SocialLoginData {
  provider: string;
  accessToken: string;
  userData: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
}

// ========================================
// VERIFICATION TYPES
// ========================================

export interface VerificationToken {
  id: string;
  userId: string;
  token: string;
  type: 'email' | 'phone' | 'password-reset';
  expiresAt: Date;
  used: boolean;
}

export interface VerificationRequest {
  userId: string;
  type: 'email' | 'phone';
  method: 'email' | 'sms';
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  expiresIn: number; // seconds
  error?: string;
}

// ========================================
// PERMISSION & AUTHORIZATION
// ========================================

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  conditions?: Record<string, unknown>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault: boolean;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy?: string;
}

// ========================================
// SESSION MANAGEMENT
// ========================================

export interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    deviceType: string;
    browser: string;
    os: string;
  };
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface SessionActivity {
  id: string;
  sessionId: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
