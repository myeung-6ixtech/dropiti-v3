-- Fix property status constraint issue
-- This script ensures the status field and constraint are properly set up

BEGIN;

-- First, check if the status column exists, if not add it
ALTER TABLE real_estate_property_listing 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';

-- Drop the existing constraint if it exists (in case it has wrong values)
ALTER TABLE real_estate_property_listing 
DROP CONSTRAINT IF EXISTS property_listing_status_check;

ALTER TABLE real_estate_property_listing 
DROP CONSTRAINT IF EXISTS check_property_status;

-- Add the correct constraint with the right values
ALTER TABLE real_estate_property_listing 
ADD CONSTRAINT property_listing_status_check 
CHECK (status IN ('draft', 'published', 'archived', 'expired'));

-- Update existing records to have proper status values
UPDATE real_estate_property_listing 
SET status = CASE 
  WHEN is_public = true THEN 'published'
  ELSE 'draft'
END
WHERE status IS NULL OR status = '';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_property_status ON real_estate_property_listing(status);

-- Verify the constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'real_estate_property_listing'::regclass 
  AND conname LIKE '%status%';

-- Show current status values in the table
SELECT DISTINCT status, COUNT(*) as count
FROM real_estate_property_listing 
GROUP BY status;

COMMIT;
