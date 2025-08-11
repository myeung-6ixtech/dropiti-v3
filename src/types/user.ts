// ========================================
// USER TYPES
// ========================================

// ========================================
// CORE USER INTERFACE
// ========================================

export interface User {
  id: string;
  firebase_uid: string;
  display_name: string;
  email: string;
  photo_url?: string;
  auth_provider: 'firebase' | 'google' | 'facebook' | 'apple';
  user_since: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  location?: string;
  about?: string;
  education?: string;
  occupation?: string;
  marital_status?: string;
  languages?: string[];
  response_time?: string;
  verified: boolean;
  rating: number;
  review_count: number;
  response_rate: number;
  avg_response_time?: string;
  total_properties: number;
  total_guests: number;
  preferences: UserPreferences;
  notification_settings: NotificationSettings;
  privacy_settings: PrivacySettings;
  created_at: string;
  updated_at: string;
}

// ========================================
// USER PREFERENCES
// ========================================

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  currency?: string;
  timezone?: string;
  date_format?: string;
  time_format?: '12h' | '24h';
}

// ========================================
// NOTIFICATION SETTINGS
// ========================================

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing_emails?: boolean;
  property_updates?: boolean;
  message_notifications?: boolean;
  booking_notifications?: boolean;
  review_notifications?: boolean;
}

// ========================================
// PRIVACY SETTINGS
// ========================================

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showContactInfo: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowMessages: boolean;
  allowReviews: boolean;
}

// ========================================
// USER CREATION & UPDATE
// ========================================

export interface CreateUserInput {
  firebase_uid: string;
  display_name: string;
  email: string;
  photo_url?: string;
  auth_provider?: 'firebase' | 'google' | 'facebook' | 'apple';
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  location?: string;
  about?: string;
  education?: string;
  occupation?: string;
  marital_status?: string;
  languages?: string[];
  preferences?: Partial<UserPreferences>;
  notification_settings?: Partial<NotificationSettings>;
  privacy_settings?: Partial<PrivacySettings>;
}

export interface UpdateUserInput {
  display_name?: string;
  photo_url?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  location?: string;
  about?: string;
  education?: string;
  occupation?: string;
  marital_status?: string;
  languages?: string[];
  response_time?: string;
  verified?: boolean;
  rating?: number;
  review_count?: number;
  response_rate?: number;
  avg_response_time?: string;
  total_properties?: number;
  total_guests?: number;
  preferences?: Partial<UserPreferences>;
  notification_settings?: Partial<NotificationSettings>;
  privacy_settings?: Partial<PrivacySettings>;
}

// ========================================
// USER PROFILE (For UI Display)
// ========================================

export interface UserProfile {
  name: string;
  avatar: string;
  email: string;
  location?: string;
  joinDate: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  about?: string;
  languages: string[];
  responseTime: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
  stats: {
    responseRate: number;
    avgResponseTime: string;
    totalProperties: number;
    totalGuests: number;
  };
}

// ========================================
// USER STATISTICS
// ========================================

export interface UserStats {
  totalProperties: number;
  totalGuests: number;
  totalReviews: number;
  averageRating: number;
  responseRate: number;
  averageResponseTime: string;
  totalBookings: number;
  totalRevenue?: number;
  memberSince: string;
}

// ========================================
// USER ROLES & PERMISSIONS
// ========================================

export type UserRole = 'admin' | 'landlord' | 'tenant' | 'agent' | 'moderator';

export interface UserRoleInfo {
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  assignedAt: string;
  assignedBy?: string;
}

// ========================================
// USER VERIFICATION
// ========================================

export interface UserVerification {
  email_verified: boolean;
  phone_verified: boolean;
  identity_verified: boolean;
  government_id_verified: boolean;
  address_verified: boolean;
  verification_date?: string;
  verification_method?: string;
}

// ========================================
// USER ACTIVITY
// ========================================

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'login' | 'logout' | 'profile_update' | 'property_create' | 'property_update' | 'message_sent' | 'review_posted';
  description: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ========================================
// USER SESSIONS
// ========================================

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info: {
    user_agent: string;
    ip_address: string;
    device_type: string;
    browser: string;
    os: string;
  };
  is_active: boolean;
  created_at: string;
  last_activity: string;
  expires_at: string;
}

// ========================================
// USER RELATIONSHIPS
// ========================================

export interface UserRelationship {
  id: string;
  user_id: string;
  related_user_id: string;
  relationship_type: 'friend' | 'family' | 'colleague' | 'neighbor';
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

// ========================================
// USER PREFERENCES OPTIONS
// ========================================

export const educationOptions = [
  'Highschool',
  'Bachelors',
  'Post-Graduate',
  'Diploma',
  'PhD'
] as const;

export const occupationOptions = [
  'Student',
  'Engineer',
  'Doctor',
  'Teacher',
  'Business Owner',
  'Designer',
  'Developer',
  'Manager',
  'Consultant',
  'Other'
] as const;

export const maritalStatusOptions = [
  'Single',
  'Married',
  'In a Relationship',
  'Widowed',
  'Rather not Say'
] as const;

export const availableLanguages = [
  'English',
  'Cantonese',
  'Mandarin',
  'Japanese',
  'Korean',
  'French',
  'German',
  'Spanish',
  'Italian',
  'Portuguese',
  'Russian',
  'Arabic',
  'Hindi',
  'Thai',
  'Vietnamese'
] as const;

// ========================================
// UTILITY TYPES
// ========================================

export type Education = typeof educationOptions[number];
export type Occupation = typeof occupationOptions[number];
export type MaritalStatus = typeof maritalStatusOptions[number];
export type Language = typeof availableLanguages[number];
