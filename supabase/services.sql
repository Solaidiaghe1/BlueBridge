-- BlueBridge Services Table Schema
-- Canonical list of supported services for workers

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE,           -- Internal type identifier (e.g., 'plumbing')
  name TEXT NOT NULL UNIQUE,           -- Display name (e.g., 'Plumbing')
  description TEXT,                    -- Brief description of the service
  icon TEXT,                           -- Icon identifier for UI
  color TEXT,                          -- Hex color for UI theming
  estimated_wait TEXT,                 -- Estimated wait time display string
  is_active BOOLEAN DEFAULT true,      -- Whether service is currently available
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups by type
CREATE INDEX IF NOT EXISTS idx_services_type ON services(type);

-- Create index for active services
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Grant permissions to allow all users to read services
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE services TO anon, authenticated;

-- Policy: All users can read services (public lookup table)
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Services are viewable by everyone"
  ON services
  FOR SELECT
  TO public
  USING (true);

-- Clean up any existing services to avoid conflicts between type and name unique constraints
-- This ensures we can always seed fresh data
DELETE FROM services WHERE type IN ('plumbing', 'hvac', 'electric', 'electrical', 'carpentry', 'landscaping', 'painting', 'walling');

-- Seed data: Insert all services from the app
INSERT INTO services (type, name, description, icon, color, estimated_wait, is_active)
VALUES
  ('plumbing', 'Plumbing', 'Leaks, clogs, installations', 'wrench', '#2563EB', '20 Minutes', true),
  ('hvac', 'HVAC', 'Heating & cooling services', 'wind', '#5B9FAD', '30 Minutes', true),
  ('electric', 'Electric', 'Wiring, outlets, fixtures', 'zap', '#D97642', '25 Minutes', true),
  ('carpentry', 'Carpentry', 'Repairs, installations, custom work', 'hammer', '#E85D3F', '35 Minutes', true),
  ('landscaping', 'Landscaping', 'Lawn care, tree trimming, garden work', 'tree', '#4CAF50', '40 Minutes', true),
  ('painting', 'Painting', 'Interior & exterior painting', 'paintbrush', '#9C27B0', '30 Minutes', true),
  ('walling', 'Walling', 'Masonry, brickwork, stone work', 'square', '#DC2626', '45 Minutes', true)
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  estimated_wait = EXCLUDED.estimated_wait,
  is_active = EXCLUDED.is_active;
