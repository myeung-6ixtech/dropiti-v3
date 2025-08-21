-- Create the user_chat_rooms view for the chat API
-- This view provides a comprehensive view of user chat rooms with last message info and unread counts

CREATE OR REPLACE VIEW real_estate.user_chat_rooms AS
SELECT 
    crp.id as participant_id,
    crp.room_id,
    crp.user_firebase_uid,
    crp.role as user_role,
    crp.joined_at,
    crp.last_read_at,
    cr.id as room_id_uuid,
    cr.title,
    cr.room_type,
    cr.created_at as room_created_at,
    cr.updated_at as room_updated_at,
    cr.last_message_at,
    -- Get the last message content
    (SELECT content FROM real_estate.chat_message 
     WHERE room_id = cr.id 
     ORDER BY created_at DESC 
     LIMIT 1) as last_message_content,
    -- Get the last message sender
    (SELECT sender_firebase_uid FROM real_estate.chat_message 
     WHERE room_id = cr.id 
     ORDER BY created_at DESC 
     LIMIT 1) as last_message_sender,
    -- Calculate unread count (messages after last_read_at)
    (SELECT COUNT(*) FROM real_estate.chat_message 
     WHERE room_id = cr.id 
     AND created_at > crp.last_read_at
     AND sender_firebase_uid != crp.user_firebase_uid) as unread_count
FROM real_estate.chat_room_participant crp
JOIN real_estate.chat_room cr ON crp.room_id = cr.id
WHERE crp.is_active = true;

-- Grant permissions to the view (adjust as needed for your Hasura setup)
-- GRANT SELECT ON real_estate.user_chat_rooms TO hasura_role;

-- Verify the view was created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'real_estate' 
  AND table_name = 'user_chat_rooms';
