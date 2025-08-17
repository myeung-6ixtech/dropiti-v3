import { REVIEW_STATUS } from '@/constants/review';

/**
 * Check if a review opportunity has expired
 * @param reviewWindowEnd - The end timestamp of the review window
 * @returns boolean indicating if the review opportunity has expired
 */
export function isReviewExpired(reviewWindowEnd: string): boolean {
  const endDate = new Date(reviewWindowEnd);
  const now = new Date();
  return now > endDate;
}

/**
 * Calculate days remaining for a review opportunity
 * @param reviewWindowEnd - The end timestamp of the review window
 * @returns number of days remaining (0 if expired)
 */
export function getDaysRemaining(reviewWindowEnd: string): number {
  const endDate = new Date(reviewWindowEnd);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Get review status based on completion and expiration
 * @param isCompleted - Whether the review has been completed
 * @param reviewWindowEnd - The end timestamp of the review window
 * @returns ReviewStatus
 */
export function getReviewStatus(isCompleted: boolean, reviewWindowEnd: string): string {
  if (isCompleted) {
    return REVIEW_STATUS.COMPLETED;
  }
  
  if (isReviewExpired(reviewWindowEnd)) {
    return REVIEW_STATUS.EXPIRED;
  }
  
  return REVIEW_STATUS.PENDING;
}

/**
 * Check if a review opportunity is urgent (3 days or less remaining)
 * @param reviewWindowEnd - The end timestamp of the review window
 * @returns boolean indicating if the review is urgent
 */
export function isReviewUrgent(reviewWindowEnd: string): boolean {
  const daysRemaining = getDaysRemaining(reviewWindowEnd);
  return daysRemaining <= 3 && daysRemaining > 0;
}

/**
 * Format review window end date for display
 * @param reviewWindowEnd - The end timestamp of the review window
 * @returns formatted date string
 */
export function formatReviewWindowEnd(reviewWindowEnd: string): string {
  return new Date(reviewWindowEnd).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
