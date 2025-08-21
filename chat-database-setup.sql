-- ========================================
-- REAL-TIME CHAT DATABASE SETUP
-- ========================================
-- Based on: documentation/product-features/real-time-chat-with-hasura.md
-- Last updated: 2025-01-01
-- Schema: real_estate

-- ========================================
-- CREATE TABLES
-- ========================================

-- 1. Chat Room Table
CREATE TABLE IF NOT EXISTS real_estate.chat_room (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT,
    room_type TEXT CHECK (room_type IN ('direct', 'group', 'support')) DEFAULT 'direct',
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Chat Room Participant Table
CREATE TABLE IF NOT EXISTS real_estate.chat_room_participant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES real_estate.chat_room(id) ON DELETE CASCADE,
    user_firebase_uid TEXT NOT NULL,
    role TEXT CHECK (role IN ('tenant', 'landlord', 'support', 'admin')) DEFAULT 'tenant',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(room_id, user_firebase_uid)
);

-- 3. Chat Message Table
CREATE TABLE IF NOT EXISTS real_estate.chat_message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES real_estate.chat_room(id) ON DELETE CASCADE,
    sender_firebase_uid TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'system')) DEFAULT 'text',
    status TEXT CHECK (status IN ('sent', 'delivered', 'read')) DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reply_to_message_id UUID REFERENCES real_estate.chat_message(id),
    metadata JSONB DEFAULT '{}'
);

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Chat room indexes
CREATE INDEX IF NOT EXISTS idx_chat_room_updated_at ON real_estate.chat_room(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_room_last_message_at ON real_estate.chat_room(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_room_type ON real_estate.chat_room(room_type);

-- Chat room participant indexes
CREATE INDEX IF NOT EXISTS idx_chat_room_participant_room_id ON real_estate.chat_room_participant(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_participant_user_firebase_uid ON real_estate.chat_room_participant(user_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_chat_room_participant_active ON real_estate.chat_room_participant(room_id, is_active) WHERE is_active = true;

-- Chat message indexes
CREATE INDEX IF NOT EXISTS idx_chat_message_room_id_created_at ON real_estate.chat_message(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_message_sender ON real_estate.chat_message(sender_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_chat_message_status ON real_estate.chat_message(status);
CREATE INDEX IF NOT EXISTS idx_chat_message_type ON real_estate.chat_message(message_type);

-- ========================================
-- CREATE FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update chat_room.updated_at and last_message_at
CREATE OR REPLACE FUNCTION real_estate.update_chat_room_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the chat_room's updated_at and last_message_at when a message is inserted
    UPDATE real_estate.chat_room 
    SET 
        updated_at = NOW(),
        last_message_at = NOW()
    WHERE id = NEW.room_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update chat_room timestamps
CREATE TRIGGER trigger_update_chat_room_timestamps
    AFTER INSERT ON real_estate.chat_message
    FOR EACH ROW
    EXECUTE FUNCTION real_estate.update_chat_room_timestamps();

-- Function to update message status to 'delivered' for all participants
CREATE OR REPLACE FUNCTION real_estate.mark_messages_as_delivered(room_uuid UUID, user_uid TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE real_estate.chat_message 
    SET status = 'delivered'
    WHERE room_id = room_uuid 
      AND sender_firebase_uid != user_uid 
      AND status = 'sent';
END;
$$ LANGUAGE plpgsql;

-- Function to mark messages as read for a specific user
CREATE OR REPLACE FUNCTION real_estate.mark_messages_as_read(room_uuid UUID, user_uid TEXT)
RETURNS VOID AS $$
BEGIN
    -- Update message status to 'read'
    UPDATE real_estate.chat_message 
    SET status = 'read'
    WHERE room_id = room_uuid 
      AND sender_firebase_uid != user_uid 
      AND status IN ('sent', 'delivered');
    
    -- Update participant's last_read_at
    UPDATE real_estate.chat_room_participant 
    SET last_read_at = NOW()
    WHERE room_id = room_uuid 
      AND user_firebase_uid = user_uid;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ========================================

-- View for user's chat rooms with last message info
CREATE OR REPLACE VIEW real_estate.user_chat_rooms AS
SELECT 
    cr.id as room_id,
    cr.title,
    cr.room_type,
    cr.created_at,
    cr.updated_at,
    cr.last_message_at,
    crp.role as user_role,
    crp.joined_at,
    crp.last_read_at,
    (
        SELECT COUNT(*) 
        FROM real_estate.chat_message cm 
        WHERE cm.room_id = cr.id 
          AND cm.sender_firebase_uid != crp.user_firebase_uid
          AND cm.status != 'read'
          AND cm.created_at > crp.last_read_at
    ) as unread_count,
    (
        SELECT cm.content 
        FROM real_estate.chat_message cm 
        WHERE cm.room_id = cr.id 
        ORDER BY cm.created_at DESC 
        LIMIT 1
    ) as last_message_content,
    (
        SELECT cm.sender_firebase_uid 
        FROM real_estate.chat_message cm 
        WHERE cm.room_id = cr.id 
        ORDER BY cm.created_at DESC 
        LIMIT 1
    ) as last_message_sender
FROM real_estate.chat_room cr
JOIN real_estate.chat_room_participant crp ON cr.id = crp.room_id
WHERE cr.is_active = true AND crp.is_active = true;

-- View for room participants with user info
CREATE OR REPLACE VIEW real_estate.room_participants_info AS
SELECT 
    crp.room_id,
    crp.user_firebase_uid,
    crp.role,
    crp.joined_at,
    crp.last_read_at,
    ru.display_name,
    ru.photo_url,
    ru.verified
FROM real_estate.chat_room_participant crp
LEFT JOIN real_estate.real_estate_user ru ON crp.user_firebase_uid = ru.firebase_uid
WHERE crp.is_active = true;

-- ========================================
-- INSERT SAMPLE DATA (OPTIONAL)
-- ========================================

-- Insert a sample support chat room
INSERT INTO real_estate.chat_room (title, room_type) 
VALUES ('Support Chat', 'support') 
ON CONFLICT DO NOTHING;

-- ========================================
-- HASURA PERMISSIONS SETUP
-- ========================================

-- Note: These permissions should be configured in Hasura Console
-- The following are guidelines for setting up row-level security

-- Chat Room Permissions:
-- - Users can only see rooms they participate in
-- - Row-level security: WHERE id IN (SELECT room_id FROM real_estate.chat_room_participant WHERE user_firebase_uid = x-hasura-user-id)

-- Chat Room Participant Permissions:
-- - Users can only see participants of rooms they're in
-- - Row-level security: WHERE room_id IN (SELECT room_id FROM real_estate.chat_room_participant WHERE user_firebase_uid = x-hasura-user-id)

-- Chat Message Permissions:
-- - Users can only see messages from rooms they participate in
-- - Users can only insert messages in rooms they participate in
-- - Row-level security: WHERE room_id IN (SELECT room_id FROM real_estate.chat_room_participant WHERE user_firebase_uid = x-hasura-user-id)

-- ========================================
-- ADDITIONAL TABLES FOR ENHANCED FEATURES
-- ========================================

-- Chat Presence Table (for online/offline status)
CREATE TABLE IF NOT EXISTS real_estate.chat_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_firebase_uid TEXT NOT NULL UNIQUE,
    room_id UUID REFERENCES real_estate.chat_room(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('online', 'away', 'busy', 'offline')) DEFAULT 'offline',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Typing Table (for typing indicators)
CREATE TABLE IF NOT EXISTS real_estate.chat_typing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES real_estate.chat_room(id) ON DELETE CASCADE,
    user_firebase_uid TEXT NOT NULL,
    is_typing BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_firebase_uid)
);

-- Chat Message Reaction Table (for message reactions)
CREATE TABLE IF NOT EXISTS real_estate.chat_message_reaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES real_estate.chat_message(id) ON DELETE CASCADE,
    user_firebase_uid TEXT NOT NULL,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_firebase_uid, reaction_type)
);

-- Indexes for additional tables
CREATE INDEX IF NOT EXISTS idx_chat_presence_user ON real_estate.chat_presence(user_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_chat_presence_room ON real_estate.chat_presence(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_typing_room ON real_estate.chat_typing(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_reaction_message ON real_estate.chat_message_reaction(message_id);

-- ========================================
-- CLEANUP AND MAINTENANCE FUNCTIONS
-- ========================================

-- Function to clean up old typing indicators (older than 30 seconds)
CREATE OR REPLACE FUNCTION real_estate.cleanup_old_typing_indicators()
RETURNS VOID AS $$
BEGIN
    DELETE FROM real_estate.chat_typing 
    WHERE started_at < NOW() - INTERVAL '30 seconds';
END;
$$ LANGUAGE plpgsql;

-- Function to archive old messages (older than 1 year)
CREATE OR REPLACE FUNCTION real_estate.archive_old_messages()
RETURNS VOID AS $$
BEGIN
    -- This is a placeholder for future implementation
    -- You might want to move old messages to an archive table
    -- or implement a retention policy
    NULL;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CREATE VIEWS FOR EASY QUERYING
-- ========================================

-- View to get user chat rooms with last message info and unread counts
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

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'real_estate' 
  AND table_name LIKE 'chat_%'
ORDER BY table_name;

-- Verify indexes were created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'real_estate' 
  AND tablename LIKE 'chat_%'
ORDER BY tablename, indexname;

-- Verify functions were created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'real_estate' 
  AND routine_name LIKE '%chat%'
ORDER BY routine_name;

-- ========================================
-- ROLLBACK SCRIPT (IF NEEDED)
-- ========================================

/*
-- To rollback all changes, run these commands in reverse order:

-- Drop additional tables
DROP TABLE IF EXISTS real_estate.chat_message_reaction CASCADE;
DROP TABLE IF EXISTS real_estate.chat_typing CASCADE;
DROP TABLE IF EXISTS real_estate.chat_presence CASCADE;

-- Drop views
DROP VIEW IF EXISTS real_estate.room_participants_info CASCADE;
DROP VIEW IF EXISTS real_estate.user_chat_rooms CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS real_estate.cleanup_old_typing_indicators() CASCADE;
DROP FUNCTION IF EXISTS real_estate.archive_old_messages() CASCADE;
DROP FUNCTION IF EXISTS real_estate.mark_messages_as_read(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS real_estate.mark_messages_as_delivered(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS real_estate.update_chat_room_timestamps() CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_chat_room_timestamps ON real_estate.chat_message CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS real_estate.chat_message CASCADE;
DROP TABLE IF EXISTS real_estate.chat_room_participant CASCADE;
DROP TABLE IF EXISTS real_estate.chat_room CASCADE;
*/
