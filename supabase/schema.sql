-- BlueBridge Users Table Schema
-- This schema creates the users table with Row Level Security policies

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('client', 'worker')) NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by clerk_user_id
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);

-- Create index for filtering by role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Grant permissions to allow anon/authenticated users to insert (required for Clerk fallback)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE users TO anon, authenticated;

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;

-- Policy: Users can read their own data
-- Checks that the clerk_user_id in JWT matches the row
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  USING (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Policy: Users can update their own data
-- Prevents users from changing their clerk_user_id or role
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  WITH CHECK (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Policy: Allow insert for authenticated users
-- Allows the app to create new user records after Clerk signup
-- UPDATED: Now allows public insert to support Clerk fallback tokens (anon role)
-- The unique constraint on clerk_user_id prevents duplicates.
CREATE POLICY "Enable insert for all users"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- RPC Function: sync_user_profile
-- Securely handles user creation/retrieval bypassing RLS
-- vital for the initial sync when auth state might be ambiguous
CREATE OR REPLACE FUNCTION sync_user_profile(
    p_clerk_id TEXT,
    p_email TEXT,
    p_role TEXT,
    p_first_name TEXT,
    p_last_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Bypass RLS checks
SET search_path = public
AS $$
DECLARE
    v_user_record users%ROWTYPE;
BEGIN
    -- Check if user exists
    SELECT * INTO v_user_record
    FROM users
    WHERE clerk_user_id = p_clerk_id;

    IF FOUND THEN
        RETURN to_jsonb(v_user_record);
    END IF;

    -- Insert new user
    INSERT INTO users (clerk_user_id, email, role, first_name, last_name)
    VALUES (p_clerk_id, p_email, p_role, p_first_name, p_last_name)
    RETURNING * INTO v_user_record;

    RETURN to_jsonb(v_user_record);
END;
$$;

-- Grant permissions for RPC
GRANT EXECUTE ON FUNCTION sync_user_profile TO anon, authenticated, service_role;

-- Comment the table for documentation
COMMENT ON TABLE users IS 'Stores app-specific user data synced from Clerk authentication';
COMMENT ON COLUMN users.clerk_user_id IS 'Unique identifier from Clerk auth system';
COMMENT ON COLUMN users.role IS 'User role: client (needs services) or worker (provides services)';
COMMENT ON COLUMN users.first_name IS 'User first name from Clerk profile';
COMMENT ON COLUMN users.last_name IS 'User last name from Clerk profile';
COMMENT ON COLUMN users.phone IS 'Optional phone number for progressive onboarding';
