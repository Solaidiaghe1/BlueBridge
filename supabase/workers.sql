-- BlueBridge Workers Table Schema
-- Represents a user who can accept jobs (1:1 with users table for role='worker')

-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  clerk_id TEXT UNIQUE NOT NULL,
  
  -- Worker profile
  years_experience INTEGER NOT NULL DEFAULT 0,    -- Overall years of experience (required)
  bio TEXT,                                       -- Worker's professional bio
  
  -- Status & metrics
  is_active BOOLEAN DEFAULT true,                 -- Whether worker is accepting jobs
  rating_avg NUMERIC(2,1),                        -- Average rating (e.g., 4.5)
  jobs_completed INTEGER DEFAULT 0,               -- Total jobs completed
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups by clerk_id
CREATE INDEX IF NOT EXISTS idx_workers_clerk_id ON workers(clerk_id);

-- Create index for active workers
CREATE INDEX IF NOT EXISTS idx_workers_active ON workers(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE workers TO anon, authenticated;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Workers can view own data" ON workers;
DROP POLICY IF EXISTS "Workers can update own data" ON workers;
DROP POLICY IF EXISTS "Enable insert for all users" ON workers;
DROP POLICY IF EXISTS "Public can view active workers" ON workers;

-- Policy: Workers can read their own data
CREATE POLICY "Workers can view own data"
  ON workers
  FOR SELECT
  USING (
    clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Policy: Public can view active workers (for client discovery)
CREATE POLICY "Public can view active workers"
  ON workers
  FOR SELECT
  USING (is_active = true);

-- Policy: Workers can update their own data
CREATE POLICY "Workers can update own data"
  ON workers
  FOR UPDATE
  USING (
    clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  WITH CHECK (
    clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Policy: Allow insert for authenticated users
CREATE POLICY "Enable insert for all users"
  ON workers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION set_workers_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_workers_set_updated_at ON workers;
CREATE TRIGGER trg_workers_set_updated_at
BEFORE UPDATE ON workers
FOR EACH ROW
EXECUTE FUNCTION set_workers_updated_at();

-- RPC Function: sync_worker_profile
-- Securely handles worker creation/retrieval bypassing RLS
CREATE OR REPLACE FUNCTION sync_worker_profile(
    p_user_id UUID,
    p_clerk_id TEXT,
    p_years_experience INTEGER DEFAULT 0,
    p_bio TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_worker_record workers%ROWTYPE;
BEGIN
    -- Check if worker exists
    SELECT * INTO v_worker_record
    FROM workers
    WHERE clerk_id = p_clerk_id;

    IF FOUND THEN
        RETURN to_jsonb(v_worker_record);
    END IF;

    -- Insert new worker
    INSERT INTO workers (id, clerk_id, years_experience, bio)
    VALUES (p_user_id, p_clerk_id, COALESCE(p_years_experience, 0), p_bio)
    RETURNING * INTO v_worker_record;

    RETURN to_jsonb(v_worker_record);
END;
$$;

-- RPC Function: sync_worker_services
-- Syncs worker services by replacing existing with new selections
CREATE OR REPLACE FUNCTION sync_worker_services(
    p_worker_id UUID,
    p_service_types TEXT[]  -- Array of service type strings (e.g., ['plumbing', 'hvac'])
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_service_ids UUID[];
    v_result JSONB;
BEGIN
    -- Get service IDs from service types
    SELECT ARRAY_AGG(id) INTO v_service_ids
    FROM services
    WHERE type = ANY(p_service_types) AND is_active = true;

    IF v_service_ids IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No valid services found');
    END IF;

    -- Delete existing worker services
    DELETE FROM worker_services WHERE worker_id = p_worker_id;

    -- Insert new worker services
    INSERT INTO worker_services (worker_id, service_id)
    SELECT p_worker_id, UNNEST(v_service_ids);

    -- Return the inserted services
    SELECT jsonb_build_object(
        'success', true,
        'services', jsonb_agg(jsonb_build_object(
            'id', ws.id,
            'worker_id', ws.worker_id,
            'service_id', ws.service_id,
            'service_type', s.type,
            'service_name', s.name
        ))
    ) INTO v_result
    FROM worker_services ws
    JOIN services s ON s.id = ws.service_id
    WHERE ws.worker_id = p_worker_id;

    RETURN COALESCE(v_result, jsonb_build_object('success', true, 'services', '[]'::jsonb));
END;
$$;

-- RPC Function: sync_worker_work_areas
-- Syncs worker work areas by replacing existing with new selections
CREATE OR REPLACE FUNCTION sync_worker_work_areas(
    p_worker_id UUID,
    p_work_area_types TEXT[]  -- Array of work area type strings (e.g., ['kitchen', 'bathroom'])
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_work_area_ids UUID[];
    v_result JSONB;
BEGIN
    -- Get work area IDs from work area types
    SELECT ARRAY_AGG(id) INTO v_work_area_ids
    FROM work_areas
    WHERE type = ANY(p_work_area_types) AND is_active = true;

    IF v_work_area_ids IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No valid work areas found');
    END IF;

    -- Delete existing worker work areas
    DELETE FROM worker_work_areas WHERE worker_id = p_worker_id;

    -- Insert new worker work areas
    INSERT INTO worker_work_areas (worker_id, work_area_id)
    SELECT p_worker_id, UNNEST(v_work_area_ids);

    -- Return the inserted work areas
    SELECT jsonb_build_object(
        'success', true,
        'work_areas', jsonb_agg(jsonb_build_object(
            'worker_id', wwa.worker_id,
            'work_area_id', wwa.work_area_id,
            'work_area_type', wa.type,
            'work_area_name', wa.name
        ))
    ) INTO v_result
    FROM worker_work_areas wwa
    JOIN work_areas wa ON wa.id = wwa.work_area_id
    WHERE wwa.worker_id = p_worker_id;

    RETURN COALESCE(v_result, jsonb_build_object('success', true, 'work_areas', '[]'::jsonb));
END;
$$;

-- RPC Function: complete_worker_onboarding
-- Single function to create worker record and sync services/work areas atomically
CREATE OR REPLACE FUNCTION complete_worker_onboarding(
    p_user_id UUID,
    p_clerk_id TEXT,
    p_years_experience INTEGER,
    p_bio TEXT,
    p_service_types TEXT[],
    p_work_area_types TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_worker_record workers%ROWTYPE;
    v_services_result JSONB;
    v_work_areas_result JSONB;
BEGIN
    -- Create or get worker record
    SELECT * INTO v_worker_record
    FROM workers
    WHERE clerk_id = p_clerk_id;

    IF NOT FOUND THEN
        INSERT INTO workers (id, clerk_id, years_experience, bio)
        VALUES (p_user_id, p_clerk_id, COALESCE(p_years_experience, 0), p_bio)
        RETURNING * INTO v_worker_record;
    ELSE
        -- Update existing worker
        UPDATE workers
        SET years_experience = COALESCE(p_years_experience, years_experience),
            bio = COALESCE(p_bio, bio),
            updated_at = now()
        WHERE id = v_worker_record.id
        RETURNING * INTO v_worker_record;
    END IF;

    -- Sync services
    SELECT sync_worker_services(v_worker_record.id, p_service_types) INTO v_services_result;

    -- Sync work areas
    SELECT sync_worker_work_areas(v_worker_record.id, p_work_area_types) INTO v_work_areas_result;

    -- Return combined result
    RETURN jsonb_build_object(
        'success', true,
        'worker', to_jsonb(v_worker_record),
        'services', v_services_result->'services',
        'work_areas', v_work_areas_result->'work_areas'
    );
END;
$$;

-- RPC Function: get_available_requests_for_worker
-- Fetches open requests that match worker's services OR work areas
CREATE OR REPLACE FUNCTION get_available_requests_for_worker(
    p_clerk_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_worker_id UUID;
    v_service_ids UUID[];
    v_work_area_ids UUID[];
    v_service_types TEXT[];
    v_work_area_types TEXT[];
    v_result JSONB;
BEGIN
    -- Get worker ID from clerk_id
    SELECT id INTO v_worker_id
    FROM workers
    WHERE clerk_id = p_clerk_id;

    IF v_worker_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Worker not found', 'requests', '[]'::jsonb);
    END IF;

    -- Get worker's service IDs and types
    SELECT ARRAY_AGG(ws.service_id), ARRAY_AGG(s.type) 
    INTO v_service_ids, v_service_types
    FROM worker_services ws
    JOIN services s ON s.id = ws.service_id
    WHERE ws.worker_id = v_worker_id;

    -- Get worker's work area IDs and types
    SELECT ARRAY_AGG(wwa.work_area_id), ARRAY_AGG(wa.type) 
    INTO v_work_area_ids, v_work_area_types
    FROM worker_work_areas wwa
    JOIN work_areas wa ON wa.id = wwa.work_area_id
    WHERE wwa.worker_id = v_worker_id;

    -- If worker has no services AND no work areas, return empty
    IF v_service_ids IS NULL AND v_work_area_ids IS NULL THEN
        RETURN jsonb_build_object('success', true, 'requests', '[]'::jsonb);
    END IF;

    -- Fetch matching requests with client info
    -- Match on service_id OR work_area_id, also fall back to service_type/location text fields
    SELECT jsonb_build_object(
        'success', true,
        'requests', COALESCE(jsonb_agg(
            jsonb_build_object(
                'id', r.id,
                'public_id', r.public_id,
                'title', r.title,
                'description', r.description,
                'service_id', r.service_id,
                'service_type', COALESCE(s.name, r.service_type),
                'work_area_id', r.work_area_id,
                'work_area_type', COALESCE(wa.name, r.location),
                'street_address', r.street_address,
                'city', r.city,
                'state', r.state,
                'zip_code', r.zip_code,
                'location_type', r.location_type,
                'available_dates', r.available_dates,
                'time_windows', r.time_windows,
                'pets_on_site', r.pets_on_site,
                'parking_notes', r.parking_notes,
                'photos', COALESCE(r.photos, ARRAY[]::text[]),
                'videos', COALESCE(r.videos, ARRAY[]::text[]),
                'inspection_fee', COALESCE(r.inspection_fee, 75.00),
                'status', r.status,
                'created_at', r.created_at,
                'client_first_name', u.first_name,
                'client_last_name', u.last_name
            )
        ), '[]'::jsonb)
    ) INTO v_result
    FROM requests r
    LEFT JOIN services s ON s.id = r.service_id
    LEFT JOIN work_areas wa ON wa.id = r.work_area_id
    LEFT JOIN users u ON u.id = r.client_id
    WHERE r.is_open = true
      AND r.status = 'searching_for_worker'
      AND (
          -- Match by service_id (UUID)
          (v_service_ids IS NOT NULL AND r.service_id = ANY(v_service_ids))
          -- OR match by work_area_id (UUID)
          OR (v_work_area_ids IS NOT NULL AND r.work_area_id = ANY(v_work_area_ids))
          -- OR fallback: match by service_type text field
          OR (v_service_types IS NOT NULL AND r.service_type = ANY(v_service_types))
          -- OR fallback: match by location text field (work area type)
          OR (v_work_area_types IS NOT NULL AND r.location = ANY(v_work_area_types))
      );

    RETURN v_result;
END;
$$;
