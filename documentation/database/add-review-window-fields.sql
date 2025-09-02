-- Add review window fields to real_estate_offer table
-- This script adds the missing fields needed for the review system

BEGIN;

-- Add review window fields
ALTER TABLE real_estate_offer 
ADD COLUMN IF NOT EXISTS review_window_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS review_window_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS initiator_review_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS recipient_review_status VARCHAR(20) DEFAULT 'pending';

-- Add constraints for review status
ALTER TABLE real_estate_offer 
ADD CONSTRAINT IF NOT EXISTS check_initiator_review_status 
CHECK (initiator_review_status IN ('pending', 'completed', 'expired', 'missed'));

ALTER TABLE real_estate_offer 
ADD CONSTRAINT IF NOT EXISTS check_recipient_review_status 
CHECK (recipient_review_status IN ('pending', 'completed', 'expired', 'missed'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offer_review_window_start ON real_estate_offer(review_window_start);
CREATE INDEX IF NOT EXISTS idx_offer_review_window_end ON real_estate_offer(review_window_end);
CREATE INDEX IF NOT EXISTS idx_offer_initiator_review_status ON real_estate_offer(initiator_review_status);
CREATE INDEX IF NOT EXISTS idx_offer_recipient_review_status ON real_estate_offer(recipient_review_status);

-- Update existing accepted offers to have review window data
-- Set review window end to 14 days from created_at for offers that are already accepted
UPDATE real_estate_offer 
SET 
  review_window_start = created_at,
  review_window_end = created_at + INTERVAL '14 days'
WHERE offer_status = 'accepted' 
  AND review_window_end IS NULL;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'real_estate_offer' 
  AND column_name IN ('review_window_start', 'review_window_end', 'initiator_review_status', 'recipient_review_status')
ORDER BY ordinal_position;

COMMIT;

-- Display success message
SELECT 'Review window fields added successfully!' as message;
