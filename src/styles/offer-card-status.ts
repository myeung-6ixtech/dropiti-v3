/* ========================================
   OFFER CARD STATUS STYLE UTILITIES
   ======================================== */

import { componentStyles } from './design-system';

// Export the styles for easy access
export const offerCardStatusStyles = componentStyles.offerCardStatus;

// Helper function to get all classes for a specific status variant
export const getStatusClasses = (variant: keyof typeof componentStyles.offerCardStatus.variants) => {
  return componentStyles.offerCardStatus.variants[variant];
};

// Helper function to get final terms classes
export const getFinalTermsClasses = () => {
  return componentStyles.offerCardStatus.finalTerms;
};

// Helper function to get status message classes
export const getStatusMessageClasses = () => {
  return componentStyles.offerCardStatus.status;
};

// Pre-composed class combinations for common use cases
export const offerStatusClasses = {
  // Final Accepted Terms Display
  finalTermsContainer: 'offer-final-terms',
  finalTermsHeader: 'offer-final-terms-header',
  finalTermsGrid: 'offer-final-terms-grid',
  finalTermsColumn: 'offer-final-terms-column',
  finalTermsRow: 'offer-final-terms-row',
  finalTermsLabel: 'offer-final-terms-label',
  finalTermsValue: 'offer-final-terms-value',
  finalTermsDivider: 'offer-final-terms-divider',
  finalTermsStatus: 'offer-final-terms-status',
  finalTermsStatusLabel: 'offer-final-terms-status-label',
  finalTermsStatusBadge: 'offer-final-terms-status-badge',
  
  // Status Container
  statusContainer: 'offer-status-container',
  
  // Status Message
  statusMessage: 'offer-status-message',
  statusMessageText: 'offer-status-message-text',
  statusMessageSubtext: 'offer-status-message-subtext',
  
  // Status Variants
  accepted: {
    container: 'offer-status-accepted offer-status-rounded offer-status-padding offer-status-margin',
    text: 'offer-status-accepted-text',
    subtext: 'offer-status-accepted-subtext',
  },
  rejected: {
    container: 'offer-status-rejected offer-status-rounded offer-status-padding offer-status-margin',
    text: 'offer-status-rejected-text',
    subtext: 'offer-status-rejected-subtext',
  },
  withdrawn: {
    container: 'offer-status-withdrawn offer-status-rounded offer-status-padding offer-status-margin',
    text: 'offer-status-withdrawn-text',
  },
  pending: {
    container: 'offer-status-pending offer-status-rounded offer-status-padding offer-status-margin',
    text: 'offer-status-pending-text',
    subtext: 'offer-status-pending-subtext',
  },
  counterRecipient: {
    container: 'offer-status-counter-recipient offer-status-rounded offer-status-padding',
    text: 'offer-status-counter-recipient-text',
    subtext: 'offer-status-counter-recipient-subtext',
  },
  counterInitiator: {
    container: 'offer-status-counter-initiator offer-status-rounded offer-status-padding',
    text: 'offer-status-counter-initiator-text',
    subtext: 'offer-status-counter-initiator-subtext',
  },
  
  // Counter Offer Container
  counterContainer: 'offer-counter-container',
} as const;

// Type for the status classes
export type OfferStatusVariant = keyof typeof offerStatusClasses.accepted | 
                                keyof typeof offerStatusClasses.rejected | 
                                keyof typeof offerStatusClasses.withdrawn | 
                                keyof typeof offerStatusClasses.pending | 
                                keyof typeof offerStatusClasses.counterRecipient | 
                                keyof typeof offerStatusClasses.counterInitiator;
