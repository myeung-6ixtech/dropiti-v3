-- ========================================
-- DROPITI PLATFORM - COMPLETE DATABASE SETUP
-- ========================================
-- This script creates a complete database schema for the Dropiti real estate platform
-- Last updated: 2025-01-01
-- Schema: real_estate
-- 
-- IMPORTANT: Run this script on a fresh PostgreSQL database
-- Make sure to create the 'real_estate' schema first if it doesn't exist

-- ========================================
-- CREATE SCHEMA
-- ========================================

CREATE SCHEMA IF NOT EXISTS real_estate;

-- ========================================
-- CREATE EXTENSIONS
-- ========================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable case-insensitive text search
CREATE EXTENSION IF NOT EXISTS "citext";

-- ========================================
-- CORE USER MANAGEMENT TABLES
-- ========================================

-- 1. Real Estate User Table
CREATE TABLE IF NOT EXISTS real_estate.real_estate_user (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    auth_provider TEXT CHECK (auth_provider IN ('firebase', 'google', 'facebook', 'apple')) DEFAULT 'firebase',
    photo_url TEXT,
    phone_number TEXT,
    location TEXT,
    about TEXT,
    education TEXT,
    occupation TEXT,
    marital_status TEXT,
    languages JSONB DEFAULT '[]',
    verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    response_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (response_rate >= 0 AND response_rate <= 100),
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PROPERTY MANAGEMENT TABLES
-- ========================================

-- 2. Property Listing Table
CREATE TABLE IF NOT EXISTS real_estate.real_estate_property_listing (
    id SERIAL PRIMARY KEY,
    property_uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    landlord_firebase_uid TEXT NOT NULL REFERENCES real_estate.real_estate_user(firebase_uid) ON DELETE CASCADE,
    property_type TEXT CHECK (property_type IN ('apartment', 'house', 'condo', 'studio', 'townhouse', 'loft', 'other')) DEFAULT 'apartment',
    rental_space TEXT CHECK (rental_space IN ('entire_place', 'private_room', 'shared_room')) DEFAULT 'entire_place',
    address TEXT NOT NULL,
    show_specific_location BOOLEAN DEFAULT true,
    gross_area_size DECIMAL(10,2),
    gross_area_size_unit TEXT CHECK (gross_area_size_unit IN ('sqft', 'sqm')) DEFAULT 'sqft',
    num_bedroom INTEGER CHECK (num_bedroom >= 0),
    num_bathroom DECIMAL(3,1) CHECK (num_bathroom >= 0),
    furnished BOOLEAN DEFAULT false,
    pets_allowed BOOLEAN DEFAULT false,
    amenities JSONB DEFAULT '[]',
    display_image TEXT,
    uploaded_images JSONB DEFAULT '[]',
    rental_price DECIMAL(12,2) NOT NULL CHECK (rental_price > 0),
    rental_price_currency TEXT CHECK (rental_price_currency IN ('HKD', 'USD', 'EUR', 'GBP', 'SGD')) DEFAULT 'HKD',
    availability_date DATE,
    is_public BOOLEAN DEFAULT false,
    status TEXT CHECK (status IN ('draft', 'published', 'archived', 'expired')) DEFAULT 'draft',
    last_saved_at TIMESTAMPTZ DEFAULT NOW(),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- OFFER MANAGEMENT TABLES
-- ========================================

-- 3. Real Estate Offer Table
CREATE TABLE IF NOT EXISTS real_estate.real_estate_offer (
    id SERIAL PRIMARY KEY,
    offer_key TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    property_uuid UUID NOT NULL REFERENCES real_estate.real_estate_property_listing(property_uuid) ON DELETE CASCADE,
    initiator_firebase_uid TEXT NOT NULL REFERENCES real_estate.real_estate_user(firebase_uid) ON DELETE CASCADE,
    recipient_firebase_uid TEXT NOT NULL REFERENCES real_estate.real_estate_user(firebase_uid) ON DELETE CASCADE,
    proposing_rent_price DECIMAL(12,2) NOT NULL CHECK (proposing_rent_price > 0),
    proposing_rent_price_currency TEXT CHECK (proposing_rent_price_currency IN ('HKD', 'USD', 'EUR', 'GBP', 'SGD')) DEFAULT 'HKD',
    num_leasing_months INTEGER NOT NULL CHECK (num_leasing_months > 0),
    payment_frequency TEXT CHECK (payment_frequency IN ('monthly', 'quarterly', 'annually')) DEFAULT 'monthly',
    move_in_date DATE NOT NULL,
    offer_status TEXT CHECK (offer_status IN ('pending', 'tentatively_accepted', 'countered', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Negotiation fields
    current_rent_price DECIMAL(12,2),
    current_rent_price_currency TEXT CHECK (current_rent_price_currency IN ('HKD', 'USD', 'EUR', 'GBP', 'SGD')) DEFAULT 'HKD',
    current_num_leasing_months INTEGER,
    current_payment_frequency TEXT CHECK (current_payment_frequency IN ('monthly', 'quarterly', 'annually')) DEFAULT 'monthly',
    current_move_in_date DATE,
    negotiation_round INTEGER DEFAULT 0 CHECK (negotiation_round >= 0 AND negotiation_round <= 2),
    last_action_by TEXT CHECK (last_action_by IN ('initiator', 'recipient')) DEFAULT 'initiator',
    last_action_at TIMESTAMPTZ DEFAULT NOW(),
    last_action_type TEXT,
    -- Review window fields
    review_window_start TIMESTAMPTZ,
    review_window_end TIMESTAMPTZ,
    initiator_review_status TEXT CHECK (initiator_review_status IN ('pending', 'completed', 'expired', 'missed')) DEFAULT 'pending',
    recipient_review_status TEXT CHECK (recipient_review_status IN ('pending', 'completed', 'expired', 'missed')) DEFAULT 'pending'
);

-- ========================================
-- REVIEW SYSTEM TABLES
-- ========================================

-- 4. Review Table
CREATE TABLE IF NOT EXISTS real_estate.real_estate_review (
    id SERIAL PRIMARY KEY,
    review_uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    reviewer_firebase_uid TEXT NOT NULL REFERENCES real_estate.real_estate_user(firebase_uid) ON DELETE CASCADE,
    reviewee_firebase_uid TEXT NOT NULL REFERENCES real_estate.real_estate_user(firebase_uid) ON DELETE CASCADE,
    property_uuid UUID REFERENCES real_estate.real_estate_property_listing(property_uuid) ON DELETE CASCADE,
    offer_id INTEGER REFERENCES real_estate.real_estate_offer(id) ON DELETE CASCADE,
    review_type TEXT CHECK (review_type IN ('offer_review', 'tenant_to_landlord', 'landlord_to_tenant')) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
    is_verified BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- NOTIFICATION SYSTEM TABLES
-- ========================================

-- 5. Notification Type Table
CREATE TABLE IF NOT EXISTS real_estate.real_estate_notification_type (
    id SERIAL PRIMARY KEY,
    type_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('offer', 'property', 'user', 'system')) NOT NULL,
    template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notification Table
CREATE TABLE IF NOT EXISTS real_estate.real_estate_notification (
    id SERIAL PRIMARY KEY,
    type_id INTEGER NOT NULL REFERENCES real_estate.real_estate_notification_type(id) ON DELETE CASCADE,
    recipient_firebase_uid TEXT NOT NULL REFERENCES real_estate.real_estate_user(firebase_uid) ON DELETE CASCADE,
    sender_firebase_uid TEXT REFERENCES real_estate.real_estate_user(firebase_uid) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ
);

-- 7. Notification Preference Table
CREATE TABLE IF NOT EXISTS real_estate.real_estate_notification_preference (
    id SERIAL PRIMARY KEY,
    user_firebase_uid TEXT NOT NULL REFERENCES real_estate.real_estate_user(firebase_uid) ON DELETE CASCADE,
    type_id INTEGER NOT NULL REFERENCES real_estate.real_estate_notification_type(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    delivery_method TEXT CHECK (delivery_method IN ('in_app', 'email', 'push', 'all')) DEFAULT 'in_app',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_firebase_uid, type_id)
);

-- ========================================
-- CHAT SYSTEM TABLES
-- ========================================

-- 8. Chat Room Table
CREATE TABLE IF NOT EXISTS real_estate.chat_room (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT,
    room_type TEXT CHECK (room_type IN ('direct', 'group', 'support')) DEFAULT 'direct',
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Chat Room Participant Table
CREATE TABLE IF NOT EXISTS real_estate.chat_room_participant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES real_estate.chat_room(id) ON DELETE CASCADE,
    user_firebase_uid TEXT NOT NULL REFERENCES real_estate.real_estate_user(firebase_uid) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('tenant', 'landlord', 'support', 'admin')) DEFAULT 'tenant',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(room_id, user_firebase_uid)
);

-- 10. Chat Message Table
CREATE TABLE IF NOT EXISTS real_estate.chat_message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES real_estate.chat_room(id) ON DELETE CASCADE,
    sender_firebase_uid TEXT NOT NULL REFERENCES real_estate.real_estate_user(firebase_uid) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'system')) DEFAULT 'text',
    status TEXT CHECK (status IN ('sent', 'delivered', 'read')) DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reply_to_message_id UUID REFERENCES real_estate.chat_message(id),
    metadata JSONB DEFAULT '{}'
);

-- ========================================
-- ENHANCED CHAT FEATURES TABLES
-- ========================================

-- 11. Chat Presence Table
CREATE TABLE IF NOT EXISTS real_estate.chat_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_firebase_uid TEXT NOT NULL UNIQUE REFERENCES real_estate.real_estate_user(firebase_uid) ON DELETE CASCADE,
    room_id UUID REFERENCES real_estate.chat_room(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('online', 'away', 'busy', 'offline')) DEFAULT 'offline',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Chat Typing Table
CREATE TABLE IF NOT EXISTS real_estate.chat_typing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES real_estate.chat_room(id) ON DELETE CASCADE,
    user_firebase_uid TEXT NOT NULL REFERENCES real_estate.real_estate_user(firebase_uid) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_firebase_uid)
);

-- 13. Chat Message Reaction Table
CREATE TABLE IF NOT EXISTS real_estate.chat_message_reaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES real_estate.chat_message(id) ON DELETE CASCADE,
    user_firebase_uid TEXT NOT NULL REFERENCES real_estate.real_estate_user(firebase_uid) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_firebase_uid, reaction_type)
);

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_user_firebase_uid ON real_estate.real_estate_user(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_user_email ON real_estate.real_estate_user(email);
CREATE INDEX IF NOT EXISTS idx_user_verified ON real_estate.real_estate_user(verified);
CREATE INDEX IF NOT EXISTS idx_user_rating ON real_estate.real_estate_user(rating);

-- Property indexes
CREATE INDEX IF NOT EXISTS idx_property_uuid ON real_estate.real_estate_property_listing(property_uuid);
CREATE INDEX IF NOT EXISTS idx_property_landlord ON real_estate.real_estate_property_listing(landlord_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_property_status ON real_estate.real_estate_property_listing(status);
CREATE INDEX IF NOT EXISTS idx_property_is_public ON real_estate.real_estate_property_listing(is_public);
CREATE INDEX IF NOT EXISTS idx_property_type ON real_estate.real_estate_property_listing(property_type);
CREATE INDEX IF NOT EXISTS idx_property_rental_price ON real_estate.real_estate_property_listing(rental_price);
CREATE INDEX IF NOT EXISTS idx_property_location ON real_estate.real_estate_property_listing(address);
CREATE INDEX IF NOT EXISTS idx_property_created_at ON real_estate.real_estate_property_listing(created_at DESC);

-- Offer indexes
CREATE INDEX IF NOT EXISTS idx_offer_key ON real_estate.real_estate_offer(offer_key);
CREATE INDEX IF NOT EXISTS idx_offer_property_uuid ON real_estate.real_estate_offer(property_uuid);
CREATE INDEX IF NOT EXISTS idx_offer_initiator ON real_estate.real_estate_offer(initiator_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_offer_recipient ON real_estate.real_estate_offer(recipient_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_offer_status ON real_estate.real_estate_offer(offer_status);
CREATE INDEX IF NOT EXISTS idx_offer_is_active ON real_estate.real_estate_offer(is_active);
CREATE INDEX IF NOT EXISTS idx_offer_negotiation_round ON real_estate.real_estate_offer(negotiation_round);
CREATE INDEX IF NOT EXISTS idx_offer_last_action_by ON real_estate.real_estate_offer(last_action_by);
CREATE INDEX IF NOT EXISTS idx_offer_last_action_at ON real_estate.real_estate_offer(last_action_at);
CREATE INDEX IF NOT EXISTS idx_offer_status_round ON real_estate.real_estate_offer(offer_status, negotiation_round);
CREATE INDEX IF NOT EXISTS idx_offer_review_window_start ON real_estate.real_estate_offer(review_window_start);
CREATE INDEX IF NOT EXISTS idx_offer_review_window_end ON real_estate.real_estate_offer(review_window_end);
CREATE INDEX IF NOT EXISTS idx_offer_initiator_review_status ON real_estate.real_estate_offer(initiator_review_status);
CREATE INDEX IF NOT EXISTS idx_offer_recipient_review_status ON real_estate.real_estate_offer(recipient_review_status);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_review_uuid ON real_estate.real_estate_review(review_uuid);
CREATE INDEX IF NOT EXISTS idx_review_reviewer ON real_estate.real_estate_review(reviewer_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_review_reviewee ON real_estate.real_estate_review(reviewee_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_review_property_uuid ON real_estate.real_estate_review(property_uuid);
CREATE INDEX IF NOT EXISTS idx_review_offer_id ON real_estate.real_estate_review(offer_id);
CREATE INDEX IF NOT EXISTS idx_review_type ON real_estate.real_estate_review(review_type);
CREATE INDEX IF NOT EXISTS idx_review_rating ON real_estate.real_estate_review(rating);
CREATE INDEX IF NOT EXISTS idx_review_is_verified ON real_estate.real_estate_review(is_verified);
CREATE INDEX IF NOT EXISTS idx_review_is_public ON real_estate.real_estate_review(is_public);
CREATE INDEX IF NOT EXISTS idx_review_created_at ON real_estate.real_estate_review(created_at DESC);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notification_type_key ON real_estate.real_estate_notification_type(type_key);
CREATE INDEX IF NOT EXISTS idx_notification_type_category ON real_estate.real_estate_notification_type(category);
CREATE INDEX IF NOT EXISTS idx_notification_type_active ON real_estate.real_estate_notification_type(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_type_id ON real_estate.real_estate_notification(type_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipient ON real_estate.real_estate_notification(recipient_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_notification_sender ON real_estate.real_estate_notification(sender_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_notification_is_read ON real_estate.real_estate_notification(is_read);
CREATE INDEX IF NOT EXISTS idx_notification_is_archived ON real_estate.real_estate_notification(is_archived);
CREATE INDEX IF NOT EXISTS idx_notification_priority ON real_estate.real_estate_notification(priority);
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON real_estate.real_estate_notification(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_expires_at ON real_estate.real_estate_notification(expires_at);
CREATE INDEX IF NOT EXISTS idx_notification_preference_user ON real_estate.real_estate_notification_preference(user_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_notification_preference_type ON real_estate.real_estate_notification_preference(type_id);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_room_updated_at ON real_estate.chat_room(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_room_last_message_at ON real_estate.chat_room(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_room_type ON real_estate.chat_room(room_type);
CREATE INDEX IF NOT EXISTS idx_chat_room_participant_room_id ON real_estate.chat_room_participant(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_participant_user_firebase_uid ON real_estate.chat_room_participant(user_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_chat_room_participant_active ON real_estate.chat_room_participant(room_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_chat_message_room_id_created_at ON real_estate.chat_message(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_message_sender ON real_estate.chat_message(sender_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_chat_message_status ON real_estate.chat_message(status);
CREATE INDEX IF NOT EXISTS idx_chat_message_type ON real_estate.chat_message(message_type);
CREATE INDEX IF NOT EXISTS idx_chat_presence_user ON real_estate.chat_presence(user_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_chat_presence_room ON real_estate.chat_presence(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_typing_room ON real_estate.chat_typing(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_reaction_message ON real_estate.chat_message_reaction(message_id);

-- ========================================
-- CREATE FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION real_estate.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update chat_room timestamps
CREATE OR REPLACE FUNCTION real_estate.update_chat_room_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE real_estate.chat_room 
    SET 
        updated_at = NOW(),
        last_message_at = NOW()
    WHERE id = NEW.room_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to mark messages as delivered
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

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION real_estate.mark_messages_as_read(room_uuid UUID, user_uid TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE real_estate.chat_message 
    SET status = 'read'
    WHERE room_id = room_uuid 
      AND sender_firebase_uid != user_uid 
      AND status IN ('sent', 'delivered');
    
    UPDATE real_estate.chat_room_participant 
    SET last_read_at = NOW()
    WHERE room_id = room_uuid 
      AND user_firebase_uid = user_uid;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old typing indicators
CREATE OR REPLACE FUNCTION real_estate.cleanup_old_typing_indicators()
RETURNS VOID AS $$
BEGIN
    DELETE FROM real_estate.chat_typing 
    WHERE started_at < NOW() - INTERVAL '30 seconds';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CREATE TRIGGERS
-- ========================================

-- Update timestamps for all tables
CREATE TRIGGER trigger_update_user_updated_at
    BEFORE UPDATE ON real_estate.real_estate_user
    FOR EACH ROW
    EXECUTE FUNCTION real_estate.update_updated_at_column();

CREATE TRIGGER trigger_update_property_updated_at
    BEFORE UPDATE ON real_estate.real_estate_property_listing
    FOR EACH ROW
    EXECUTE FUNCTION real_estate.update_updated_at_column();

CREATE TRIGGER trigger_update_offer_updated_at
    BEFORE UPDATE ON real_estate.real_estate_offer
    FOR EACH ROW
    EXECUTE FUNCTION real_estate.update_updated_at_column();

CREATE TRIGGER trigger_update_review_updated_at
    BEFORE UPDATE ON real_estate.real_estate_review
    FOR EACH ROW
    EXECUTE FUNCTION real_estate.update_updated_at_column();

CREATE TRIGGER trigger_update_notification_type_updated_at
    BEFORE UPDATE ON real_estate.real_estate_notification_type
    FOR EACH ROW
    EXECUTE FUNCTION real_estate.update_updated_at_column();

CREATE TRIGGER trigger_update_notification_preference_updated_at
    BEFORE UPDATE ON real_estate.real_estate_notification_preference
    FOR EACH ROW
    EXECUTE FUNCTION real_estate.update_updated_at_column();

CREATE TRIGGER trigger_update_chat_room_updated_at
    BEFORE UPDATE ON real_estate.chat_room
    FOR EACH ROW
    EXECUTE FUNCTION real_estate.update_updated_at_column();

CREATE TRIGGER trigger_update_chat_message_updated_at
    BEFORE UPDATE ON real_estate.chat_message
    FOR EACH ROW
    EXECUTE FUNCTION real_estate.update_updated_at_column();

CREATE TRIGGER trigger_update_chat_presence_updated_at
    BEFORE UPDATE ON real_estate.chat_presence
    FOR EACH ROW
    EXECUTE FUNCTION real_estate.update_updated_at_column();

-- Chat room timestamp trigger
CREATE TRIGGER trigger_update_chat_room_timestamps
    AFTER INSERT ON real_estate.chat_message
    FOR EACH ROW
    EXECUTE FUNCTION real_estate.update_chat_room_timestamps();

-- ========================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ========================================

-- View for user's chat rooms with last message info
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
    (SELECT content FROM real_estate.chat_message 
     WHERE room_id = cr.id 
     ORDER BY created_at DESC 
     LIMIT 1) as last_message_content,
    (SELECT sender_firebase_uid FROM real_estate.chat_message 
     WHERE room_id = cr.id 
     ORDER BY created_at DESC 
     LIMIT 1) as last_message_sender,
    (SELECT COUNT(*) FROM real_estate.chat_message 
     WHERE room_id = cr.id 
     AND created_at > crp.last_read_at
     AND sender_firebase_uid != crp.user_firebase_uid) as unread_count
FROM real_estate.chat_room_participant crp
JOIN real_estate.chat_room cr ON crp.room_id = cr.id
WHERE crp.is_active = true;

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
-- INSERT DEFAULT DATA
-- ========================================

-- Insert default notification types
INSERT INTO real_estate.real_estate_notification_type (type_key, name, description, category, template) VALUES
('offer_created', 'New Offer Received', 'You have received a new rental offer', 'offer', '{{sender_name}} has made an offer for {{property_title}} at {{rent_price}}'),
('offer_accepted', 'Offer Accepted', 'Your offer has been accepted', 'offer', 'Your offer for {{property_title}} has been accepted!'),
('offer_rejected', 'Offer Rejected', 'Your offer has been rejected', 'offer', 'Your offer for {{property_title}} has been rejected'),
('offer_countered', 'Offer Countered', 'Your offer has been countered', 'offer', '{{sender_name}} has countered your offer for {{property_title}}'),
('offer_withdrawn', 'Offer Withdrawn', 'An offer has been withdrawn', 'offer', '{{sender_name}} has withdrawn their offer for {{property_title}}'),
('property_published', 'Property Published', 'Your property has been published', 'property', 'Your property "{{property_title}}" is now live and visible to tenants'),
('property_updated', 'Property Updated', 'A property you are interested in has been updated', 'property', 'The property "{{property_title}}" has been updated'),
('review_received', 'Review Received', 'You have received a new review', 'user', '{{sender_name}} has left you a {{rating}}-star review'),
('review_window_opened', 'Review Window Opened', 'You can now leave a review', 'user', 'You can now leave a review for {{property_title}}'),
('chat_message', 'New Message', 'You have received a new message', 'user', '{{sender_name}} sent you a message')
ON CONFLICT (type_key) DO NOTHING;

-- Insert a sample support chat room
INSERT INTO real_estate.chat_room (title, room_type) 
VALUES ('Support Chat', 'support') 
ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify all tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'real_estate' 
ORDER BY tablename;

-- Verify all indexes were created
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'real_estate' 
ORDER BY tablename, indexname;

-- Verify all functions were created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'real_estate' 
ORDER BY routine_name;

-- Verify all views were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'real_estate' 
  AND table_type = 'VIEW'
ORDER BY table_name;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

SELECT 'Dropiti database setup completed successfully!' as message,
       'All tables, indexes, functions, triggers, and views have been created.' as details,
       'You can now configure Hasura GraphQL endpoints and start using the platform.' as next_steps;

-- ========================================
-- ROLLBACK SCRIPT (IF NEEDED)
-- ========================================

/*
-- To rollback all changes, run these commands in reverse order:

-- Drop views
DROP VIEW IF EXISTS real_estate.room_participants_info CASCADE;
DROP VIEW IF EXISTS real_estate.user_chat_rooms CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_chat_room_timestamps ON real_estate.chat_message CASCADE;
DROP TRIGGER IF EXISTS trigger_update_chat_presence_updated_at ON real_estate.chat_presence CASCADE;
DROP TRIGGER IF EXISTS trigger_update_chat_message_updated_at ON real_estate.chat_message CASCADE;
DROP TRIGGER IF EXISTS trigger_update_chat_room_updated_at ON real_estate.chat_room CASCADE;
DROP TRIGGER IF EXISTS trigger_update_notification_preference_updated_at ON real_estate.real_estate_notification_preference CASCADE;
DROP TRIGGER IF EXISTS trigger_update_notification_type_updated_at ON real_estate.real_estate_notification_type CASCADE;
DROP TRIGGER IF EXISTS trigger_update_review_updated_at ON real_estate.real_estate_review CASCADE;
DROP TRIGGER IF EXISTS trigger_update_offer_updated_at ON real_estate.real_estate_offer CASCADE;
DROP TRIGGER IF EXISTS trigger_update_property_updated_at ON real_estate.real_estate_property_listing CASCADE;
DROP TRIGGER IF EXISTS trigger_update_user_updated_at ON real_estate.real_estate_user CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS real_estate.cleanup_old_typing_indicators() CASCADE;
DROP FUNCTION IF EXISTS real_estate.mark_messages_as_read(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS real_estate.mark_messages_as_delivered(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS real_estate.update_chat_room_timestamps() CASCADE;
DROP FUNCTION IF EXISTS real_estate.update_updated_at_column() CASCADE;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS real_estate.chat_message_reaction CASCADE;
DROP TABLE IF EXISTS real_estate.chat_typing CASCADE;
DROP TABLE IF EXISTS real_estate.chat_presence CASCADE;
DROP TABLE IF EXISTS real_estate.chat_message CASCADE;
DROP TABLE IF EXISTS real_estate.chat_room_participant CASCADE;
DROP TABLE IF EXISTS real_estate.chat_room CASCADE;
DROP TABLE IF EXISTS real_estate.real_estate_notification_preference CASCADE;
DROP TABLE IF EXISTS real_estate.real_estate_notification CASCADE;
DROP TABLE IF EXISTS real_estate.real_estate_notification_type CASCADE;
DROP TABLE IF EXISTS real_estate.real_estate_review CASCADE;
DROP TABLE IF EXISTS real_estate.real_estate_offer CASCADE;
DROP TABLE IF EXISTS real_estate.real_estate_property_listing CASCADE;
DROP TABLE IF EXISTS real_estate.real_estate_user CASCADE;

-- Drop schema
DROP SCHEMA IF EXISTS real_estate CASCADE;
*/
