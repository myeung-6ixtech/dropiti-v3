-- ============================================================
-- MIGRATION: Firebase → Nhost Auth
-- ============================================================
-- Run this script in the Hasura console (or psql) against your
-- Nhost Postgres database BEFORE deploying the updated app code.
--
-- What this migration does:
--   1. Adds a new `nhost_user_id` column to real_estate.user
--   2. Renames all *_firebase_uid FK columns to the new names
--   3. Updates the auth_provider CHECK constraint
--   4. Adds an index on the new nhost_user_id column
--
-- After running this migration you must:
--   a) Reload/track the renamed columns in Hasura (Settings → Data)
--   b) Configure Google OAuth in Nhost dashboard
--      (Settings → Sign-In Methods → Google)
--   c) Deploy the updated app code
--   d) Once all existing users have been migrated / recreated,
--      run Part 2 (DROP firebase_uid) at the bottom of this file
-- ============================================================


-- ============================================================
-- PART 1: Add nhost_user_id column (nullable during transition)
-- ============================================================

ALTER TABLE real_estate.user
  ADD COLUMN IF NOT EXISTS nhost_user_id uuid UNIQUE;

CREATE INDEX IF NOT EXISTS idx_user_nhost_user_id
  ON real_estate.user(nhost_user_id);


-- ============================================================
-- PART 2: Rename FK columns in all child tables
-- ============================================================

-- property_listing
ALTER TABLE real_estate.property_listing
  RENAME COLUMN landlord_firebase_uid TO landlord_user_id;

-- offer
ALTER TABLE real_estate.offer
  RENAME COLUMN initiator_firebase_uid TO initiator_user_id;

ALTER TABLE real_estate.offer
  RENAME COLUMN recipient_firebase_uid TO recipient_user_id;

-- review
ALTER TABLE real_estate.review
  RENAME COLUMN reviewer_firebase_uid TO reviewer_user_id;

ALTER TABLE real_estate.review
  RENAME COLUMN reviewee_firebase_uid TO reviewee_user_id;

-- notification
ALTER TABLE real_estate.notification
  RENAME COLUMN recipient_firebase_uid TO recipient_user_id;

ALTER TABLE real_estate.notification
  RENAME COLUMN sender_firebase_uid TO sender_user_id;

-- notification_preference
ALTER TABLE real_estate.notification_preference
  RENAME COLUMN user_firebase_uid TO user_id;

-- chat_room_participant
ALTER TABLE real_estate.chat_room_participant
  RENAME COLUMN user_firebase_uid TO user_id;

-- chat_message
ALTER TABLE real_estate.chat_message
  RENAME COLUMN sender_firebase_uid TO sender_user_id;

-- chat_presence
ALTER TABLE real_estate.chat_presence
  RENAME COLUMN user_firebase_uid TO user_id;

-- tenant_profile
ALTER TABLE real_estate.tenant_profile
  RENAME COLUMN user_firebase_uid TO user_id;


-- ============================================================
-- PART 3: Update auth_provider CHECK constraint
--         (allow 'email' instead of 'firebase')
-- ============================================================

ALTER TABLE real_estate.user
  DROP CONSTRAINT IF EXISTS user_auth_provider_check;

ALTER TABLE real_estate.user
  ADD CONSTRAINT user_auth_provider_check
  CHECK (auth_provider IN ('email', 'google', 'facebook', 'apple', 'password'));


-- ============================================================
-- PART 4: Reload all affected tables in Hasura
-- ============================================================
-- After running Parts 1–3, go to Hasura Console → Data →
-- real_estate schema and click "Track" / "Reload" on each
-- modified table so the renamed columns are reflected in the
-- GraphQL schema.


-- ============================================================
-- PART 5 (deferred): Make nhost_user_id NOT NULL and drop firebase_uid
-- Run this ONLY after all existing users have been backfilled
-- with their Nhost UUIDs.
-- ============================================================

-- Step A: Backfill existing users manually if needed:
--   UPDATE real_estate.user
--     SET nhost_user_id = '<nhost-uuid>'
--   WHERE firebase_uid = '<firebase-uid>';

-- Step B: Then enforce NOT NULL and drop the old column:
-- ALTER TABLE real_estate.user
--   ALTER COLUMN nhost_user_id SET NOT NULL;

-- ALTER TABLE real_estate.user
--   DROP COLUMN IF EXISTS firebase_uid;

-- DROP INDEX IF EXISTS real_estate.idx_user_firebase_uid;
