export type BudgetCurrency = 'HKD' | 'USD' | 'EUR' | 'GBP' | 'SGD';

export type PaymentPreference = 'monthly' | 'quarterly' | 'annually';
export type RentalSpacePreference = 'entire_place' | 'private_room' | 'shared_room';
export type FurnishingPreference = 'fully' | 'partially' | 'unfurnished';
export type LocationFlexibility = 'strict' | 'moderate' | 'flexible';
export type NoticePeriod = 'immediate' | '1_month' | '2_months' | '3_months' | 'flexible';
export type UrgencyLevel = 'immediate' | 'within_month' | 'flexible';
export type ResponseTimeExpectation = 'immediate' | 'within_hour' | 'within_day' | 'flexible';
export type TenantListingStatus = 'draft' | 'active' | 'inactive' | 'paused';

export interface TenantProfileData {
  // Database fields
  tenant_uuid?: string;
  user_firebase_uid?: string;
  created_at?: string;
  updated_at?: string;
  
  // Step 1
  tenant_listing_title?: string;
  tenant_listing_description?: string;
  photo_url?: string;

  // Step 2
  budget_min?: number;
  budget_max?: number;
  budget_currency?: BudgetCurrency;
  payment_preferences?: PaymentPreference[];
  deposit_capability?: boolean;

  preferred_property_types?: string[];
  rental_space_preference?: RentalSpacePreference;
  furnishing_preference?: FurnishingPreference;
  pets_allowed?: boolean;

  preferred_locations?: string[];
  transportation_proximity?: string[];
  neighborhood_preferences?: string[];
  location_flexibility?: LocationFlexibility;

  preferred_move_in_date?: string; // ISO string
  preferred_lease_duration?: number; // months
  notice_period?: NoticePeriod;
  urgency_level?: UrgencyLevel;

  work_location?: string;
  lifestyle_preferences?: string[];
  special_requirements?: string[];

  contact_preferences?: Array<'chat' | 'email' | 'phone'>;
  best_contact_times?: Array<'morning' | 'afternoon' | 'evening' | 'weekend'>;
  response_time_expectation?: ResponseTimeExpectation;
  tenant_privacy_settings?: Record<string, boolean>;

  // Review
  tenant_listing_status?: TenantListingStatus;
}


