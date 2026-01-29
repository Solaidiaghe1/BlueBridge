-- BlueBridge Worker Services Table Schema
-- Many-to-many: declares which services a worker provides

-- Create worker_services table
CREATE TABLE IF NOT EXISTS worker_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  
  -- Service-specific details
  years_experience INTEGER,                       -- Experience in this specific service (nullable)
  base_price NUMERIC(10,2),                       -- Worker's base price for this service
  verified BOOLEAN DEFAULT false,                 -- Whether worker is verified for this service
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique worker-service combinations
  UNIQUE (worker_id, service_id)
);

-- Create index for faster lookups by worker_id
CREATE INDEX IF NOT EXISTS idx_worker_services_worker_id ON worker_services(worker_id);

-- Create index for faster lookups by service_id
CREATE INDEX IF NOT EXISTS idx_worker_services_service_id ON worker_services(service_id);

-- Create index for verified workers
CREATE INDEX IF NOT EXISTS idx_worker_services_verified ON worker_services(verified) WHERE verified = true;

-- Enable Row Level Security
ALTER TABLE worker_services ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE worker_services TO anon, authenticated;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Workers can view own services" ON worker_services;
DROP POLICY IF EXISTS "Workers can manage own services" ON worker_services;
DROP POLICY IF EXISTS "Public can view worker services" ON worker_services;
DROP POLICY IF EXISTS "Workers can insert own services" ON worker_services;
DROP POLICY IF EXISTS "Workers can update own services" ON worker_services;
DROP POLICY IF EXISTS "Workers can delete own services" ON worker_services;

-- Policy: Workers can view their own services
CREATE POLICY "Workers can view own services"
  ON worker_services
  FOR SELECT
  USING (
    worker_id IN (
      SELECT id FROM workers 
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Policy: Public can view all worker services (for matching)
CREATE POLICY "Public can view worker services"
  ON worker_services
  FOR SELECT
  USING (true);

-- Policy: Workers can insert their own services
CREATE POLICY "Workers can insert own services"
  ON worker_services
  FOR INSERT
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers 
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Policy: Workers can update their own services
CREATE POLICY "Workers can update own services"
  ON worker_services
  FOR UPDATE
  USING (
    worker_id IN (
      SELECT id FROM workers 
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers 
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Policy: Workers can delete their own services
CREATE POLICY "Workers can delete own services"
  ON worker_services
  FOR DELETE
  USING (
    worker_id IN (
      SELECT id FROM workers 
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS trg_worker_services_set_updated_at ON worker_services;
CREATE TRIGGER trg_worker_services_set_updated_at
BEFORE UPDATE ON worker_services
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
