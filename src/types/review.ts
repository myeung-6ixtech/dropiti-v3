// ========================================
// REVIEW TYPES
// ========================================

// ========================================
// CORE REVIEW INTERFACE
// ========================================

export interface Review {
  id: string;
  reviewUuid: string;
  reviewerFirebaseUid: string;
  reviewedUserFirebaseUid: string;
  reviewType: ReviewType;
  rating: number;
  title?: string;
  comment?: string;
  offerUuid?: string;
  propertyUuid?: string;
  isPublic: boolean;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  // Related data
  reviewer?: ReviewUser;
  reviewedUser?: ReviewUser;
  property?: ReviewProperty;
}

// ========================================
// REVIEW TYPES
// ========================================

export type ReviewType = 'offer_review' | 'tenant_to_landlord' | 'landlord_to_tenant';

// ========================================
// REVIEW OPPORTUNITY INTERFACE
// ========================================

export interface ReviewOpportunity {
  id: string;
  propertyTitle: string;
  otherPartyName: string;
  reviewType: ReviewType;
  reviewWindowEnd: string;
  daysRemaining?: number; // Optional since it's calculated on the frontend
  status: string;
  offerId: string;
  offerUuid: string;
  propertyUuid: string;
  otherPartyId: string;
}

// ========================================
// REVIEW TAB TYPES
// ========================================

export type ReviewTabType = 'upcoming' | 'given' | 'received';

export interface ReviewTab {
  id: ReviewTabType;
  name: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// ========================================
// RELATED USER INTERFACE
// ========================================

export interface ReviewUser {
  uuid: string;
  displayName: string;
  email: string;
  photoUrl?: string;
}

// ========================================
// RELATED PROPERTY INTERFACE
// ========================================

export interface ReviewProperty {
  propertyUuid: string;
  title: string;
  location: string;
  rentalPrice: number;
  rentalPriceCurrency: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  photos: string[];
}

// ========================================
// REVIEW CREATION & UPDATE
// ========================================

export interface CreateReviewInput {
  reviewerFirebaseUid: string;
  reviewedUserFirebaseUid: string;
  reviewType: ReviewType;
  rating: number;
  title?: string;
  comment?: string;
  offerUuid?: string;
  propertyUuid?: string;
  isPublic?: boolean;
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  comment?: string;
  reviewType?: ReviewType;
  isPublic?: boolean;
  isVerified?: boolean;
  helpfulCount?: number;
}

// ========================================
// REVIEW RESPONSES
// ========================================

export interface ReviewResponse {
  success: boolean;
  data: Review | Review[];
  total?: number;
  message: string;
}

export interface ReviewListResponse {
  success: boolean;
  data: Review[];
  total: number;
  message: string;
}

// ========================================
// REVIEW FILTERS
// ========================================

export interface ReviewFilters {
  reviewType?: ReviewType;
  rating?: number;
  isPublic?: boolean;
  isVerified?: boolean;
  limit?: number;
  offset?: number;
}

// ========================================
// REVIEW STATISTICS
// ========================================

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    '0.5': number;
    '1.0': number;
    '1.5': number;
    '2.0': number;
    '2.5': number;
    '3.0': number;
    '3.5': number;
    '4.0': number;
    '4.5': number;
    '5.0': number;
  };
  reviewTypeBreakdown: {
    offer_review: number;
    tenant_to_landlord: number;
    landlord_to_tenant: number;
  };
  verifiedReviews: number;
  helpfulReviews: number;
}

// ========================================
// REVIEW COMPONENT PROPS
// ========================================

export interface ReviewCardProps {
  review: Review;
  showPropertyInfo?: boolean;
  showActions?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewUuid: string) => void;
  onMarkHelpful?: (reviewUuid: string) => void;
}

export interface ReviewOpportunityCardProps {
  opportunity: ReviewOpportunity;
  onCreateReview: () => void;
}

export interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: ReviewData) => void;
  reviewType: string;
  otherPartyName: string;
  propertyTitle: string;
}

export interface ReviewData {
  rating: number;
  comment: string;
}

export interface ReviewFormProps {
  onSubmit: (review: CreateReviewInput) => void;
  onCancel: () => void;
  initialData?: Partial<CreateReviewInput>;
  isEditing?: boolean;
  loading?: boolean;
}

export interface ReviewListProps {
  reviews: Review[];
  loading?: boolean;
  error?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  showFilters?: boolean;
  onFilterChange?: (filters: ReviewFilters) => void;
}

// ========================================
// REVIEW UTILITY TYPES
// ========================================

export interface ReviewRatingOption {
  value: number;
  label: string;
  description: string;
}

export const REVIEW_RATING_OPTIONS: ReviewRatingOption[] = [
  { value: 0.5, label: '0.5', description: 'Very Poor' },
  { value: 1.0, label: '1.0', description: 'Poor' },
  { value: 1.5, label: '1.5', description: 'Below Average' },
  { value: 2.0, label: '2.0', description: 'Below Average' },
  { value: 2.5, label: '2.5', description: 'Average' },
  { value: 3.0, label: '3.0', description: 'Average' },
  { value: 3.5, label: '3.5', description: 'Above Average' },
  { value: 4.0, label: '4.0', description: 'Good' },
  { value: 4.5, label: '4.5', description: 'Very Good' },
  { value: 5.0, label: '5.0', description: 'Excellent' },
];

export const REVIEW_TYPE_LABELS: Record<ReviewType, string> = {
  offer_review: 'Offer Review',
  tenant_to_landlord: 'Tenant Review',
  landlord_to_tenant: 'Landlord Review',
};

export const REVIEW_TYPE_DESCRIPTIONS: Record<ReviewType, string> = {
  offer_review: 'Review of a rental offer or application',
  tenant_to_landlord: 'Review of a tenant by a landlord',
  landlord_to_tenant: 'Review of a landlord by a tenant',
};
