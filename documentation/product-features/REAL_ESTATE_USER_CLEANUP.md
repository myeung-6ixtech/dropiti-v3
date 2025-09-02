# Real Estate User Table Cleanup

## Overview
This document contains SQL commands to clean up the `real_estate_user` table by removing redundant fields that are either:
1. Calculable from other fields (e.g., `user_since` from `created_at`)
2. Not actively used in the simplified user system
3. Can be derived from related tables

## Fields to Remove

### 1. Remove `user_since` field
```sql
-- Remove user_since column (redundant with created_at)
ALTER TABLE real_estate_user DROP COLUMN user_since;
```

### 2. Remove `first_name` and `last_name` fields
```sql
-- Remove first_name and last_name columns (can be extracted from display_name)
ALTER TABLE real_estate_user DROP COLUMN first_name;
ALTER TABLE real_estate_user DROP COLUMN last_name;
```

### 3. Remove unused response time fields
```sql
-- Remove response_time and avg_response_time (not actively used)
ALTER TABLE real_estate_user DROP COLUMN response_time;
ALTER TABLE real_estate_user DROP COLUMN avg_response_time;
```

### 4. Remove calculable statistics fields
```sql
-- Remove total_properties and total_guests (can be calculated from related tables)
ALTER TABLE real_estate_user DROP COLUMN total_properties;
ALTER TABLE real_estate_user DROP COLUMN total_guests;
```

## Complete Cleanup Script
```sql
-- Execute all cleanup commands in sequence
BEGIN;

-- Remove redundant fields
ALTER TABLE real_estate_user DROP COLUMN IF EXISTS user_since;
ALTER TABLE real_estate_user DROP COLUMN IF EXISTS first_name;
ALTER TABLE real_estate_user DROP COLUMN IF EXISTS last_name;
ALTER TABLE real_estate_user DROP COLUMN IF EXISTS response_time;
ALTER TABLE real_estate_user DROP COLUMN IF EXISTS avg_response_time;
ALTER TABLE real_estate_user DROP COLUMN IF EXISTS total_properties;
ALTER TABLE real_estate_user DROP COLUMN IF EXISTS total_guests;

-- Verify the cleanup
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'real_estate_user' 
ORDER BY ordinal_position;

COMMIT;
```

## Expected Result
After cleanup, the `real_estate_user` table should have these columns:
- `uuid` (Primary Key)
- `firebase_uid`
- `display_name`
- `email`
- `photo_url`
- `auth_provider`
- `phone_number`
- `location`
- `about`
- `education`
- `occupation`
- `marital_status`
- `languages`
- `verified`
- `rating`
- `review_count`
- `response_rate`
- `preferences`
- `notification_settings`
- `privacy_settings`
- `created_at`
- `updated_at`

## Benefits of Cleanup
1. **Reduced redundancy** - No duplicate timestamp fields
2. **Simplified schema** - Fewer fields to maintain
3. **Better performance** - Smaller table size
4. **Cleaner code** - No need to handle redundant fields
5. **Easier maintenance** - Less complexity in data operations

## Migration Notes
- `user_since` values can be replaced with `created_at` in the frontend
- `first_name` and `last_name` can be extracted from `display_name` using string splitting
- Statistics fields can be calculated on-demand from related tables
- Response time fields can be added back later if needed
