/* ========================================
   PROPERTY CARD STYLE UTILITIES
   ======================================== */

import { componentStyles } from './design-system';

// Export the styles for easy access
export const propertyCardStyles = componentStyles.propertyCard;

// Helper function to get all classes for a specific section
export const getPropertyCardClasses = (section: keyof typeof componentStyles.propertyCard) => {
  return componentStyles.propertyCard[section];
};

// Pre-composed class combinations for common use cases
export const propertyCardClasses = {
  // Main Container
  container: 'property-card',
  
  // Image Section
  image: {
    container: 'property-card-image',
    placeholder: 'property-card-image-placeholder',
  },
  
  // Details Section
  details: 'property-card-details',
  title: 'property-card-title',
  
  // Features Section
  features: {
    container: 'property-card-features',
    location: 'property-card-location',
    row: 'property-card-features-row',
    feature: 'property-card-feature',
    icon: 'property-card-feature-icon',
    text: 'property-card-feature-text',
    type: 'property-card-type',
  },
  
  // Price Section
  price: {
    container: 'property-card-price-container',
    amount: 'property-card-price-amount',
    unit: 'property-card-price-unit',
  },
  
  // Actions Section
  actions: {
    container: 'property-card-actions',
    button: 'property-card-action-button',
    buttonPrimary: 'property-card-action-button-primary',
    buttonSecondary: 'property-card-action-button-secondary',
    buttonFull: 'property-card-action-button-full',
  },
  
  // Dashboard Edit Icon
  editIcon: {
    container: 'property-card-edit-icon',
    link: 'property-card-edit-link',
    svg: 'property-card-edit-icon-svg',
  },
  
  // Grid Layouts
  grid: {
    default: 'property-card-grid',
    search: 'property-card-grid-search',
  },
  
  // Hover Effects
  hover: 'property-card-hover',
  
  // Loading States
  skeleton: {
    container: 'property-card-skeleton',
    image: 'property-card-skeleton-image',
    content: 'property-card-skeleton-content',
    title: 'property-card-skeleton-title',
    feature: 'property-card-skeleton-feature',
    price: 'property-card-skeleton-price',
  },
  
  // Responsive Utilities
  responsive: 'property-card-responsive',
  mobileOptimized: 'property-card-mobile-optimized',
} as const;

// Type for the property card classes
export type PropertyCardSection = keyof typeof propertyCardClasses;

// Helper function to combine multiple classes
export const combinePropertyCardClasses = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

// Pre-built class combinations for common patterns
export const propertyCardPatterns = {
  // Standard property card
  standard: combinePropertyCardClasses(
    propertyCardClasses.container,
    propertyCardClasses.hover
  ),
  
  // Dashboard property card
  dashboard: combinePropertyCardClasses(
    propertyCardClasses.container,
    propertyCardClasses.hover,
    propertyCardClasses.responsive
  ),
  
  // Search result property card
  search: combinePropertyCardClasses(
    propertyCardClasses.container,
    propertyCardClasses.hover,
    propertyCardClasses.mobileOptimized
  ),
  
  // Loading skeleton
  skeleton: combinePropertyCardClasses(
    propertyCardClasses.container,
    propertyCardClasses.skeleton.container
  ),
} as const;
