-- ========================================
-- MIGRATION: Remove is_public column from property_listing
-- Date: 2025-01-XX
-- Description: Migrate from is_public field to status-only approach
-- ========================================
-- 
-- This migration:
-- 1. Ensures all properties have status set based on is_public (if status is NULL)
-- 2. Syncs status with is_public for existing records
-- 3. Drops the index on is_public
-- 4. Drops the is_public column
--
-- IMPORTANT: Run this migration AFTER deploying code changes that remove is_public usage
-- ========================================

BEGIN;

-- Step 1: Ensure all properties have status set based on is_public (if status is NULL)
UPDATE real_estate.property_listing 
SET status = CASE 
  WHEN is_public = true AND (status IS NULL OR status = 'draft') THEN 'published'
  WHEN is_public = false AND (status IS NULL OR status = 'published') THEN 'draft'
  ELSE status
END
WHERE status IS NULL OR (is_public = true AND status = 'draft') OR (is_public = false AND status = 'published');

-- Step 2: Don't override archived/expired statuses - only update if status is NULL or mismatched
UPDATE real_estate.property_listing 
SET status = 'published'
WHERE is_public = true AND status NOT IN ('archived', 'expired', 'published') AND status IS NOT NULL;

-- Step 3: Verify data integrity (this query should return 0 rows after migration)
-- Uncomment to run verification:
-- SELECT COUNT(*) as mismatched_records FROM real_estate.property_listing 
-- WHERE (is_public = true AND status != 'published' AND status NOT IN ('archived', 'expired')) 
--    OR (is_public = false AND status = 'published' AND status NOT IN ('archived', 'expired'));

-- Step 4: Drop the index on is_public (must be done before dropping column)
DROP INDEX IF EXISTS real_estate.idx_property_is_public;

-- Step 5: Drop the column
ALTER TABLE real_estate.property_listing 
DROP COLUMN IF EXISTS is_public;

-- Step 6: Final verification (should return 0 rows)
-- SELECT COUNT(*) FROM real_estate.property_listing WHERE status IS NULL;

COMMIT;

-- ========================================
-- ROLLBACK SCRIPT (if needed)
-- ========================================
-- If you need to rollback, run this:
--
-- BEGIN;
-- ALTER TABLE real_estate.property_listing 
-- ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
--
-- UPDATE real_estate.property_listing 
-- SET is_public = (status = 'published');
--
-- CREATE INDEX IF NOT EXISTS idx_property_is_public ON real_estate.property_listing(is_public);
-- COMMIT;
-- ========================================

