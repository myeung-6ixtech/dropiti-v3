-- Alternative approach: Check what fields actually exist in your current database
-- Run this query first to see what fields are available

-- Check current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'real_estate_review' 
ORDER BY ordinal_position;

-- Check if specific fields exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'real_estate_review' 
        AND column_name = 'reviewee_firebase_uid'
    ) THEN 'EXISTS' ELSE 'MISSING' END as reviewee_firebase_uid_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'real_estate_review' 
        AND column_name = 'title'
    ) THEN 'EXISTS' ELSE 'MISSING' END as title_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'real_estate_review' 
        AND column_name = 'content'
    ) THEN 'EXISTS' ELSE 'MISSING' END as content_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'real_estate_review' 
        AND column_name = 'comment'
    ) THEN 'EXISTS' ELSE 'MISSING' END as comment_status;

-- Show sample data structure
SELECT * FROM real_estate_review LIMIT 1;
