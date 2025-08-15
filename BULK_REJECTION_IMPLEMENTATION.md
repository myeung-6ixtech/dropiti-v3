# Bulk Rejection Implementation for Offer Acceptance

## Overview
This document outlines the implementation of automatic bulk rejection of pending offers when one offer is accepted for a property. This ensures that only one offer can be accepted per property, maintaining data integrity and business logic.

## Implementation Summary

### ✅ Step 1: Updated Accept Offer API
- **File**: `src/app/api/v1/offers/accept-offer/route.ts`
- **Changes**:
  - Added `REJECT_PENDING_OFFERS_MUTATION` GraphQL mutation for bulk updates
  - Added `GET_PENDING_OFFERS_QUERY` to identify pending offers
  - Implemented logic to find and reject other pending offers for the same property
  - Created action records for all rejected offers with `SYSTEM_REJECTED` action type
  - Enhanced response to include bulk rejection information

### ✅ Step 2: Updated Frontend Components
- **Files Updated**:
  - `src/components/common/IncomingOfferCardActions.tsx`
  - `src/components/common/OutgoingOfferCardActions.tsx`
  - `src/components/common/IncomingOfferCardStatus.tsx`
  - `src/components/common/OutgoingOfferCardStatus.tsx`
  - `src/components/common/OfferCard.tsx`
  - `src/components/common/IncomingOffers.tsx`

- **Changes**:
  - Enhanced offer acceptance handlers to process bulk rejection responses
  - Added bulk rejection notifications in toast messages
  - Updated offer status displays to show bulk rejection information
  - Added visual indicators for automatically rejected offers
  - Created `BulkRejectionNotification` component for comprehensive feedback

### ✅ Step 3: Added Validation
- **File**: `src/lib/offer-validation.ts` (NEW)
- **Features**:
  - `validateSingleAcceptance()` - Ensures only one offer per property
  - `validateOfferStatusTransition()` - Validates status transitions
  - `validateNegotiationState()` - Checks if offers can be modified
  - `validatePropertyAvailability()` - Verifies property availability
  - `getOfferValidationSummary()` - Comprehensive validation summary

### ✅ Step 4: Enhanced Types and Utilities
- **Files Updated**:
  - `src/types/offer.ts` - Added `SYSTEM_REJECTED` action type
  - `src/lib/offer-negotiation.ts` - Added bulk operation utilities
  - `src/styles/offer-card-status.ts` - Enhanced status styling

## Technical Details

### GraphQL Mutations
```graphql
# Bulk rejection of pending offers
mutation RejectPendingOffers($propertyUuid: String!, $excludeOfferId: Int!) {
  update_real_estate_offer(
    where: { 
      property_uuid: { _eq: $propertyUuid }
      id: { _neq: $excludeOfferId }
      offer_status: { _eq: "pending" }
      is_active: { _eq: true }
    }
    _set: {
      offer_status: "rejected"
      is_active: false
      last_action_by: "system"
      last_action_at: "now()"
      last_action_type: "SYSTEM_REJECTED"
      updated_at: "now()"
    }
  ) {
    affected_rows
    returning { id, offer_key, property_uuid, offer_status, updated_at }
  }
}
```

### API Response Structure
```typescript
{
  success: true,
  data: {
    offerId: string,
    offerKey: string,
    newStatus: string,
    updatedAt: string,
    action: string,
    bulkRejection: {
      rejectedOffersCount: number,
      rejectedOffers: Array<{ id: string; offerKey: string }>
    }
  },
  message: string
}
```

### Action Types
- **NEW**: `SYSTEM_REJECTED` - Automatically rejected by system
- **Purpose**: Distinguishes system rejections from user rejections
- **Behavior**: Updates offer status to 'rejected' and deactivates offer

## User Experience Enhancements

### Toast Notifications
1. **Success Toast**: Shows acceptance confirmation with final deal terms
2. **Info Toast**: Informs about bulk rejection of other offers
3. **Comprehensive Message**: Combines acceptance and rejection information

### Visual Indicators
1. **Bulk Rejection Banner**: Orange warning banner in offer status displays
2. **Property Deal Finalized**: Clear indication that property is no longer available
3. **Rejection Count**: Shows how many offers were automatically rejected

### Status Updates
1. **Real-time Updates**: Offer lists refresh automatically
2. **Status Consistency**: All related offers show correct status
3. **Action History**: Complete audit trail of all actions

## Business Logic

### Single Acceptance Rule
- Only one offer can be accepted per property
- All other pending offers are automatically rejected
- System maintains data integrity and prevents conflicts

### Automatic Rejection Process
1. User accepts an offer
2. System identifies all pending offers for the same property
3. System rejects all pending offers except the accepted one
4. Action records are created for audit purposes
5. Users are notified of the bulk rejection

### Edge Case Handling
- **Already Accepted**: Prevents accepting offers for properties with existing deals
- **Inactive Offers**: Only processes active, pending offers
- **Error Recovery**: Main acceptance succeeds even if bulk rejection fails
- **Audit Trail**: Complete history of all actions and rejections

## Testing Scenarios

### ✅ Test Cases Implemented
1. **Single Offer Acceptance**: Normal flow without bulk rejection
2. **Multiple Offers**: Bulk rejection of competing offers
3. **Error Handling**: Graceful failure handling for bulk operations
4. **Status Consistency**: All offers show correct final status
5. **User Notifications**: Appropriate feedback for all scenarios

### 🔄 Recommended Testing
1. **Multiple Pending Offers**: Create several offers for the same property
2. **Acceptance Flow**: Accept one offer and verify others are rejected
3. **Notification Display**: Check toast messages and status updates
4. **Data Integrity**: Verify database state after operations
5. **Edge Cases**: Test with various offer statuses and configurations

## Future Enhancements

### Potential Improvements
1. **Email Notifications**: Send emails to users with rejected offers
2. **Rejection Reasons**: More detailed explanations for rejections
3. **Recovery Options**: Allow users to reactivate rejected offers if needed
4. **Analytics**: Track bulk rejection patterns and metrics
5. **Admin Dashboard**: Interface for managing bulk operations

### Performance Optimizations
1. **Batch Operations**: Optimize database operations for large offer sets
2. **Caching**: Cache property availability status
3. **Async Processing**: Handle bulk rejections asynchronously
4. **Rate Limiting**: Prevent abuse of offer creation

## Conclusion

The bulk rejection implementation successfully addresses the business requirement of ensuring only one offer can be accepted per property. The solution provides:

- **Data Integrity**: Prevents conflicting accepted offers
- **User Experience**: Clear feedback and notifications
- **Audit Trail**: Complete history of all actions
- **Error Handling**: Robust failure recovery
- **Scalability**: Efficient bulk operations

The implementation is production-ready and follows best practices for:
- TypeScript type safety
- ESLint compliance
- Error handling and logging
- User interface consistency
- Database operation efficiency
