-- Check the current schema of the real_estate_review table
-- This will help identify any missing fields or schema mismatches

-- Check if the table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'real_estate_review';

-- Check the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'real_estate_review' 
ORDER BY ordinal_position;

-- Check for any constraints
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'real_estate_review';

-- Check for any indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'real_estate_review';

-- Check if there are any sample records
SELECT COUNT(*) as total_reviews FROM real_estate_review;

-- Show a sample record structure (if any exist)
SELECT * FROM real_estate_review LIMIT 1;
