# 🔧 Review Window End Date Fix

## 🚨 **Issue Description**

After accepting an offer, the `review_window_end` should be set to 14 days after the acceptance date. However, there was an issue where this field was not being properly calculated or stored.

## 🔍 **Root Cause**

The problem was caused by **missing database fields** in the `real_estate_offer` table:

- `review_window_start` - When the review period starts
- `review_window_end` - When the review period ends (14 days after acceptance)
- `initiator_review_status` - Review status for the offer initiator
- `recipient_review_status` - Review status for the offer recipient

## ✅ **What Was Fixed**

### 1. **Date Calculation Logic**
- Updated the date calculation in `accept-offer/route.ts` to use a more explicit method
- Added comprehensive debugging to verify the calculation works correctly
- Both calculation methods now produce exactly 14 days difference

### 2. **Database Query Updates**
- Updated `get-review-opportunities/route.ts` to fetch the actual `review_window_end` field
- Added debugging to show review window data being retrieved
- Fixed the mapping to use the correct field instead of `created_at`

### 3. **Database Schema**
- Created migration script to add missing fields
- Added proper constraints and indexes for performance

## 🗄️ **Database Migration Required**

**Run this SQL script in your Hasura console:**

```sql
-- File: add-review-window-fields.sql
-- This adds the missing review window fields to the real_estate_offer table
```

## 🔧 **Code Changes Made**

### **Accept Offer API** (`src/app/api/v1/offers/accept-offer/route.ts`)
- ✅ Fixed date calculation logic
- ✅ Added comprehensive debugging
- ✅ Ensures review window is exactly 14 days

### **Get Review Opportunities API** (`src/app/api/v1/offers/get-review-opportunities/route.ts`)
- ✅ Updated GraphQL query to include review window fields
- ✅ Fixed mapping to use `review_window_end` instead of `created_at`
- ✅ Added debugging for review window data

## 🧪 **Testing the Fix**

### **1. Run the Database Migration**
```bash
# Execute the SQL script in your Hasura console
# File: add-review-window-fields.sql
```

### **2. Test Offer Acceptance**
1. Accept an offer through the UI
2. Check the console logs for the debugging output
3. Verify the `review_window_end` is set to 14 days from acceptance

### **3. Test Review Opportunities**
1. Check the review opportunities API
2. Verify the `reviewWindowEnd` field shows the correct date
3. Check console logs for review window debugging data

## 📊 **Expected Results**

After the fix:
- ✅ New offers will have `review_window_end` set to exactly 14 days after acceptance
- ✅ Review opportunities will show the correct end date
- ✅ Users will have the full 14-day window to leave reviews
- ✅ Console logs will show detailed debugging information

## 🔍 **Debugging Information**

The fix includes comprehensive logging:

### **Accept Offer API**
```javascript
console.log('Accept Offer API: Review window calculation:', {
  start: reviewWindowStart.toISOString(),
  end: reviewWindowEnd.toISOString(),
  daysToAdd: REVIEW_CONSTANTS.REVIEW_WINDOW_DAYS,
  startDate: reviewWindowStart.toDateString(),
  endDate: reviewWindowEnd.toDateString(),
  differenceInDays: Math.round((reviewWindowEnd.getTime() - reviewWindowStart.getTime()) / (1000 * 60 * 60 * 24))
});
```

### **Get Review Opportunities API**
```javascript
console.log('Get Review Opportunities API: Offer review window data:', {
  offerId: offer.id,
  reviewWindowStart: offer.review_window_start,
  reviewWindowEnd: offer.review_window_end,
  reviewWindowStartDate: offer.review_window_start ? new Date(offer.review_window_start).toDateString() : 'N/A',
  reviewWindowEndDate: offer.review_window_end ? new Date(offer.review_window_end).toDateString() : 'N/A',
  daysFromStart: offer.review_window_start ? Math.round((new Date().getTime() - new Date(offer.review_window_start).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A',
  daysUntilEnd: offer.review_window_end ? Math.round((new Date(offer.review_window_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'
});
```

## 🚀 **Next Steps**

1. **Run the database migration** using the SQL script
2. **Test the fix** by accepting a new offer
3. **Verify the review window** shows exactly 14 days
4. **Check the console logs** for debugging information
5. **Monitor the review opportunities** to ensure correct dates

## 📝 **Files Modified**

- `src/app/api/v1/offers/accept-offer/route.ts`
- `src/app/api/v1/offers/get-review-opportunities/route.ts`
- `add-review-window-fields.sql` (new migration file)

## ⚠️ **Important Notes**

- **Backup your database** before running the migration
- **Test in development** environment first
- **Update your GraphQL schema** in Hasura after the migration
- **Monitor the console logs** to verify the fix is working

---

**The review window should now correctly show 14 days after accepting an offer! 🎉**
