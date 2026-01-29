-- BlueBridge Worker Work Areas Table Schema
-- Many-to-many: declares where a worker is willing to work

-- Create worker_work_areas table
CREATE TABLE IF NOT EXISTS worker_work_areas (
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  work_area_id UUID NOT NULL REFERENCES work_areas(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Composite primary key ensures unique worker-work_area combinations
  PRIMARY KEY (worker_id, work_area_id)
);

-- Create index for faster lookups by worker_id
CREATE INDEX IF NOT EXISTS idx_worker_work_areas_worker_id ON worker_work_areas(worker_id);

-- Create index for faster lookups by work_area_id
CREATE INDEX IF NOT EXISTS idx_worker_work_areas_work_area_id ON worker_work_areas(work_area_id);

-- Enable Row Level Security
ALTER TABLE worker_work_areas ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE worker_work_areas TO anon, authenticated;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Workers can view own work areas" ON worker_work_areas;
DROP POLICY IF EXISTS "Workers can manage own work areas" ON worker_work_areas;
DROP POLICY IF EXISTS "Public can view worker work areas" ON worker_work_areas;
DROP POLICY IF EXISTS "Workers can insert own work areas" ON worker_work_areas;
DROP POLICY IF EXISTS "Workers can delete own work areas" ON worker_work_areas;

-- Policy: Workers can view their own work areas
CREATE POLICY "Workers can view own work areas"
  ON worker_work_areas
  FOR SELECT
  USING (
    worker_id IN (
      SELECT id FROM workers 
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Policy: Public can view all worker work areas (for matching)
CREATE POLICY "Public can view worker work areas"
  ON worker_work_areas
  FOR SELECT
  USING (true);

-- Policy: Workers can insert their own work areas
CREATE POLICY "Workers can insert own work areas"
  ON worker_work_areas
  FOR INSERT
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers 
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Policy: Workers can delete their own work areas
CREATE POLICY "Workers can delete own work areas"
  ON worker_work_areas
  FOR DELETE
  USING (
    worker_id IN (
      SELECT id FROM workers 
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );
