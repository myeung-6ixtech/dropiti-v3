-- ============================================================
-- Migration: add_property_transfer_invitation
-- Purpose:   Stores time-limited ownership invitation tokens
--            sent via WhatsApp to external contacts for
--            admin-managed listings.
-- ============================================================

-- 1. Add external_contact column to property_listing
--    (E.164 digits only, no + prefix — e.g. "60123456789")
ALTER TABLE real_estate.property_listing
  ADD COLUMN IF NOT EXISTS external_contact TEXT;

COMMENT ON COLUMN real_estate.property_listing.external_contact IS
  'E.164 phone number (digits only, no + prefix) for the external agent or landlord. Used by admin for WhatsApp outreach.';

-- 2. Create the invitation token table
CREATE TABLE IF NOT EXISTS real_estate.property_transfer_invitation (
    id              SERIAL PRIMARY KEY,
    token_uuid      UUID        UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    property_uuid   UUID        NOT NULL
                        REFERENCES real_estate.property_listing(property_uuid)
                        ON DELETE CASCADE,
    external_contact TEXT       NOT NULL,
    sent_by_admin_id TEXT       NOT NULL,   -- Nhost user ID of the admin who sent the invite
    offer_id        TEXT,                   -- Optional: the offer that triggered this invitation
    status          TEXT        NOT NULL
                        CHECK (status IN ('pending', 'used', 'expired', 'cancelled'))
                        DEFAULT 'pending',
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    used_at         TIMESTAMPTZ,
    claimed_by_user_id TEXT,               -- Nhost user ID of the user who claimed the property
    whatsapp_message_id TEXT,              -- Provider-returned message ID for delivery tracking
    resend_count    INTEGER     NOT NULL DEFAULT 0
);

COMMENT ON TABLE real_estate.property_transfer_invitation IS
  'Time-limited ownership transfer invitation tokens sent to external contacts via WhatsApp.';

CREATE INDEX IF NOT EXISTS idx_pti_token_uuid
    ON real_estate.property_transfer_invitation(token_uuid);

CREATE INDEX IF NOT EXISTS idx_pti_property_status
    ON real_estate.property_transfer_invitation(property_uuid, status);

CREATE INDEX IF NOT EXISTS idx_pti_expires_status
    ON real_estate.property_transfer_invitation(expires_at, status)
    WHERE status = 'pending';

-- ============================================================
-- Hasura permission notes (apply in Hasura Console / metadata)
-- ============================================================
--
-- Table: real_estate.property_transfer_invitation
--
-- admin role:
--   select: all rows
--   insert: all columns
--   update: status, used_at, claimed_by_user_id, whatsapp_message_id, resend_count
--   delete: none (soft-cancel via status update only)
--
-- user role (authenticated):
--   select: rows WHERE claimed_by_user_id = X-Hasura-User-Id
--   insert: none
--   update: none
--   delete: none
--
-- public / anonymous: no access
--
-- Table: real_estate.property_listing (addition)
--   admin role → update external_contact column
--   all other roles → read-only on external_contact
-- ============================================================
