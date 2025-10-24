-- Create tenant profile table for tenant marketplace
-- This table stores tenant marketplace-specific data separate from user authentication data

CREATE TABLE IF NOT EXISTS real_estate.tenant_profile (
    id SERIAL PRIMARY KEY,
    tenant_uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    user_firebase_uid VARCHAR(128) NOT NULL REFERENCES real_estate.user(firebase_uid) ON DELETE CASCADE,

    -- Basic Information
    tenant_listing_title VARCHAR(200),
    tenant_listing_description TEXT,

    -- Budget & Financial
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    budget_currency VARCHAR(10) CHECK (budget_currency IN ('HKD', 'USD', 'EUR', 'GBP', 'SGD')) DEFAULT 'HKD',
    payment_preferences JSONB DEFAULT '[]',
    deposit_capability BOOLEAN DEFAULT false,

    -- Property Preferences
    preferred_property_types JSONB DEFAULT '[]',
    rental_space_preference VARCHAR(30) CHECK (rental_space_preference IN ('entire_place', 'private_room', 'shared_room')) DEFAULT 'entire_place',
    furnishing_preference VARCHAR(20) CHECK (furnishing_preference IN ('fully', 'partially', 'unfurnished')) DEFAULT 'unfurnished',
    pets_allowed BOOLEAN DEFAULT false,

    -- Location Preferences
    preferred_locations JSONB DEFAULT '[]',
    transportation_proximity JSONB DEFAULT '[]',
    neighborhood_preferences JSONB DEFAULT '[]',
    location_flexibility VARCHAR(20) CHECK (location_flexibility IN ('strict', 'moderate', 'flexible')) DEFAULT 'moderate',

    -- Timeline
    preferred_move_in_date DATE,
    preferred_lease_duration INTEGER,
    notice_period VARCHAR(20) CHECK (notice_period IN ('immediate', '1_month', '2_months', '3_months', 'flexible')) DEFAULT 'flexible',
    urgency_level VARCHAR(20) CHECK (urgency_level IN ('immediate', 'within_month', 'flexible')) DEFAULT 'flexible',

    -- Lifestyle & Requirements
    work_location VARCHAR(100),
    lifestyle_preferences JSONB DEFAULT '[]',
    special_requirements JSONB DEFAULT '[]',

    -- Contact Preferences
    contact_preferences JSONB DEFAULT '[]',
    best_contact_times JSONB DEFAULT '[]',
    response_time_expectation VARCHAR(20) CHECK (response_time_expectation IN ('immediate', 'within_hour', 'within_day', 'flexible')) DEFAULT 'flexible',
    privacy_settings JSONB DEFAULT '{}',

    -- Status & Metadata
    tenant_listing_status VARCHAR(20) CHECK (tenant_listing_status IN ('draft', 'active', 'inactive', 'paused')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient discovery
CREATE INDEX IF NOT EXISTS idx_tenant_profile_user ON real_estate.tenant_profile(user_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_tenant_profile_status ON real_estate.tenant_profile(tenant_listing_status);
CREATE INDEX IF NOT EXISTS idx_tenant_profile_budget ON real_estate.tenant_profile(budget_min, budget_max);
CREATE INDEX IF NOT EXISTS idx_tenant_profile_move_in ON real_estate.tenant_profile(preferred_move_in_date);
CREATE INDEX IF NOT EXISTS idx_tenant_profile_locations ON real_estate.tenant_profile USING GIN(preferred_locations);
CREATE INDEX IF NOT EXISTS idx_tenant_profile_types ON real_estate.tenant_profile USING GIN(preferred_property_types);

-- Add unique constraint for user_firebase_uid to prevent duplicate profiles
ALTER TABLE real_estate.tenant_profile 
ADD CONSTRAINT IF NOT EXISTS tenant_profile_user_firebase_uid_key UNIQUE (user_firebase_uid);
