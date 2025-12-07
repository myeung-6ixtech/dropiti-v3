/**
 * Property Status Management Utility
 * Centralized functions for working with property status
 * NO is_public field - status is the single source of truth
 */

export type PropertyStatus = 'draft' | 'published' | 'archived' | 'expired';

/**
 * Check if a property is published
 */
export function isPropertyPublished(status: PropertyStatus | string | null | undefined): boolean {
  return status === 'published';
}

/**
 * Validate status value
 */
export function isValidStatus(status: string | null | undefined): status is PropertyStatus {
  const validStatuses: PropertyStatus[] = ['draft', 'published', 'archived', 'expired'];
  return status !== null && status !== undefined && validStatuses.includes(status as PropertyStatus);
}

/**
 * Get default status for new properties
 */
export function getDefaultStatus(isDraft: boolean): PropertyStatus {
  return isDraft ? 'draft' : 'published';
}

