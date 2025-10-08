-- Add missing fields to real_estate_review table for old database compatibility
-- This script adds the missing fields that are expected by the current codebase

BEGIN;

-- Check if the table exists first
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'real_estate_review') THEN
        RAISE EXCEPTION 'Table real_estate_review does not exist. Please run the complete database setup first.';
    END IF;
END $$;

-- Add missing fields to real_estate_review table
ALTER TABLE real_estate_review 
ADD COLUMN IF NOT EXISTS reviewee_firebase_uid VARCHAR(128),
ADD COLUMN IF NOT EXISTS title VARCHAR(200),
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS comment TEXT; -- Keep both content and comment for backward compatibility

-- Add foreign key constraint for reviewee_firebase_uid if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'real_estate_review_reviewee_firebase_uid_fkey'
    ) THEN
        ALTER TABLE real_estate_review 
        ADD CONSTRAINT real_estate_review_reviewee_firebase_uid_fkey 
        FOREIGN KEY (reviewee_firebase_uid) REFERENCES real_estate_user(firebase_uid) ON DELETE CASCADE;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_review_reviewee_firebase_uid ON real_estate_review(reviewee_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_review_property_uuid ON real_estate_review(property_uuid);
CREATE INDEX IF NOT EXISTS idx_review_offer_uuid ON real_estate_review(offer_uuid);

-- Update existing records to have reviewee_firebase_uid
-- This is a temporary fix - you may need to update this based on your business logic
UPDATE real_estate_review 
SET reviewee_firebase_uid = (
    SELECT property_owner_firebase_uid 
    FROM real_estate_property_listing 
    WHERE property_uuid = real_estate_review.property_uuid
    LIMIT 1
)
WHERE reviewee_firebase_uid IS NULL 
AND property_uuid IS NOT NULL;

-- For reviews without property_uuid, set reviewee_firebase_uid to a default or leave NULL
-- You may need to customize this based on your business logic
UPDATE real_estate_review 
SET reviewee_firebase_uid = reviewer_firebase_uid
WHERE reviewee_firebase_uid IS NULL 
AND property_uuid IS NULL;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'real_estate_review' 
  AND column_name IN ('reviewee_firebase_uid', 'title', 'content', 'comment')
ORDER BY ordinal_position;

-- Show sample data
SELECT 
    id,
    review_uuid,
    reviewer_firebase_uid,
    reviewee_firebase_uid,
    review_type,
    rating,
    title,
    content,
    comment
FROM real_estate_review 
LIMIT 3;

COMMIT;

-- Display success message
SELECT 'Migration completed successfully! Added missing fields to real_estate_review table.' as status;
