-- BlueBridge Work Areas Table Schema
-- Controlled vocabulary for where work occurs

-- Create work_areas table
CREATE TABLE IF NOT EXISTS work_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE,           -- Internal type identifier (e.g., 'kitchen')
  name TEXT NOT NULL UNIQUE,           -- Display name (e.g., 'Kitchen')
  description TEXT,                    -- Brief description of what work happens here
  icon TEXT,                           -- Icon identifier for UI
  color TEXT,                          -- Hex color for UI theming
  is_active BOOLEAN DEFAULT true,      -- Whether work area is currently available
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups by type
CREATE INDEX IF NOT EXISTS idx_work_areas_type ON work_areas(type);

-- Create index for active work areas
CREATE INDEX IF NOT EXISTS idx_work_areas_active ON work_areas(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE work_areas ENABLE ROW LEVEL SECURITY;

-- Grant permissions to allow all users to read work areas
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE work_areas TO anon, authenticated;

-- Policy: All users can read work areas (public lookup table)
DROP POLICY IF EXISTS "Work areas are viewable by everyone" ON work_areas;
CREATE POLICY "Work areas are viewable by everyone"
  ON work_areas
  FOR SELECT
  TO public
  USING (true);

-- Seed data: Insert all work areas from the app (matching LOCATION_TYPES constants)
INSERT INTO work_areas (type, name, description, icon, color, is_active)
VALUES
  ('kitchen', 'Kitchen', 'Appliances, Plumbing, Electrical', 'chef-hat', '#EC4899', true),
  ('bathroom', 'Bathroom', 'Plumbing, Fixtures, Ventilation', 'droplet', '#3B82F6', true),
  ('bedroom', 'Bedroom', 'Electrical, HVAC, Carpentry', 'bed', '#8B5CF6', true),
  ('living_room', 'Living Room', 'Electrical, HVAC, Flooring', 'sofa', '#14B8A6', true),
  ('attic', 'Attic', 'Insulation, Electrical, Storage', 'home', '#F97316', true),
  ('basement', 'Basement', 'Plumbing, Electrical, Waterproofing', 'archive', '#6B7280', true),
  ('garage', 'Garage', 'Doors, Electrical, Organization', 'car', '#F59E0B', true),
  ('yard', 'Yard', 'Landscaping, Fencing, Outdoor structures', 'tree', '#10B981', true),
  ('doors', 'Doors', 'Installation, Repair, Hardware', 'door-open', '#8B4513', true)
ON CONFLICT (type) DO NOTHING;
