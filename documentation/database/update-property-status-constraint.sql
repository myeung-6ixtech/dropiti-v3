-- Update property status constraint to allow new values
-- This script updates the database constraint to support our new status values

BEGIN;

-- Drop the existing constraint (it might have different names)
ALTER TABLE real_estate_property_listing 
DROP CONSTRAINT IF EXISTS property_listing_status_check;

ALTER TABLE real_estate_property_listing 
DROP CONSTRAINT IF EXISTS check_property_status;

-- Add the status column if it doesn't exist
ALTER TABLE real_estate_property_listing 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';

-- Add the new constraint with our status values
ALTER TABLE real_estate_property_listing 
ADD CONSTRAINT property_listing_status_check 
CHECK (status IN ('draft', 'published', 'archived', 'expired'));

-- Update existing records to use the new status values
-- Map old values to new values
UPDATE real_estate_property_listing 
SET status = CASE 
  WHEN status = 'available' OR is_public = true THEN 'published'
  WHEN status = 'pending' OR (is_public = false AND status IS NULL) THEN 'draft'
  WHEN status = 'maintenance' THEN 'archived'
  WHEN status = 'rented' THEN 'expired'
  ELSE 'draft'
END
WHERE status IS NULL OR status IN ('available', 'pending', 'maintenance', 'rented');

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
