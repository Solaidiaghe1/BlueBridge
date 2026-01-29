-- BlueBridge Saved Addresses Schema
-- Creates the `addresses` table used by clients to store reusable addresses.

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Client relationship
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_clerk_id TEXT NOT NULL,

  -- Required label for multi-property support
  label TEXT NOT NULL,

  -- Address fields
  street_address TEXT NOT NULL,
  apt_suite_unit TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,

  -- Default flag
  is_default BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_clerk_id ON addresses(user_clerk_id);

-- Helps enforce/accelerate PRD duplicate detection: (street_address + zip_code) per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_user_street_zip_unique
  ON addresses(user_clerk_id, street_address, zip_code);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE addresses TO anon, authenticated;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;

-- NOTE:
-- In this project we authenticate to Supabase with a Clerk/Supabase JWT where `sub` is the Clerk user id.
-- Therefore, policies compare against `user_clerk_id`.

CREATE POLICY "Users can view own addresses"
  ON addresses
  FOR SELECT
  USING (
    user_clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "Users can insert own addresses"
  ON addresses
  FOR INSERT
  WITH CHECK (
    user_clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "Users can update own addresses"
  ON addresses
  FOR UPDATE
  USING (
    user_clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  WITH CHECK (
    user_clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

COMMENT ON TABLE addresses IS 'Saved addresses for clients, referenced optionally by requests. Requests store immutable address snapshots.';
COMMENT ON COLUMN addresses.label IS 'Human-friendly label required for multi-property support (e.g., Home, Rental Property).';
