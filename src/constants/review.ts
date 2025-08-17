export const REVIEW_CONSTANTS = {
  REVIEW_WINDOW_DAYS: 14,
  REVIEW_EXPIRATION_HOURS: 24, // Buffer time after window closes
} as const;

export const REVIEW_TYPES = {
  TENANT_TO_LANDLORD: 'tenant_to_landlord',
  LANDLORD_TO_TENANT: 'landlord_to_tenant',
} as const;

export type ReviewType = typeof REVIEW_TYPES[keyof typeof REVIEW_TYPES];

// Review status for tracking
export const REVIEW_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  MISSED: 'missed',
} as const;

export type ReviewStatus = typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS];
