-- BlueBridge Requests Schema
-- Creates the `requests` table used by clients to submit service requests.
-- Primary identity: users.id (UUID). Auth enforcement: Clerk ID in JWT `sub`.

CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Human-friendly request identifier (auto-generated)
  public_id TEXT UNIQUE,

  -- Client references
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  client_clerk_id TEXT NOT NULL,

  -- Worker assignment (optional)
  worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  worker_clerk_id TEXT,

  -- Request details (with foreign keys for matching)
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  work_area_id UUID REFERENCES work_areas(id) ON DELETE SET NULL,
  service_type TEXT,  -- Kept for backward compatibility
  location TEXT,      -- Kept for backward compatibility
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Media URLs (not local file:// URIs)
  photos TEXT[] DEFAULT '{}'::text[],
  videos TEXT[] DEFAULT '{}'::text[],

  -- Immutable address snapshot
  street_address TEXT NOT NULL,
  apt_suite_unit TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  location_type TEXT,

  -- Optional linkage to saved address asset
  address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,

  -- Availability
  available_dates DATE[] NOT NULL DEFAULT '{}'::date[],
  time_windows JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Additional notes
  pets_on_site BOOLEAN DEFAULT false,
  parking_notes TEXT,

  -- Pricing
  inspection_fee NUMERIC(10,2) DEFAULT 75.00,

  -- Status workflow
  status TEXT CHECK (status IN (
    'searching_for_worker',
    'inspection_scheduled',
    'awaiting_client_confirmation',
    'waiting_for_offer',
    'job_scheduled',
    'completed',
    'cancelled'
  )) DEFAULT 'searching_for_worker',
  is_open BOOLEAN DEFAULT true,

  -- Acceptance tracking
  accepted_at TIMESTAMP WITH TIME ZONE,
  scheduled_date DATE,
  scheduled_time_window TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add columns if they don't exist (for existing tables)
DO $$
BEGIN
  -- Add service_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'requests' AND column_name = 'service_id'
  ) THEN
    ALTER TABLE requests ADD COLUMN service_id UUID REFERENCES services(id) ON DELETE SET NULL;
  END IF;
  
  -- Add work_area_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'requests' AND column_name = 'work_area_id'
  ) THEN
    ALTER TABLE requests ADD COLUMN work_area_id UUID REFERENCES work_areas(id) ON DELETE SET NULL;
  END IF;

  -- Add inspection_fee column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'requests' AND column_name = 'inspection_fee'
  ) THEN
    ALTER TABLE requests ADD COLUMN inspection_fee NUMERIC(10,2) DEFAULT 75.00;
  END IF;

  -- Add accepted_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'requests' AND column_name = 'accepted_at'
  ) THEN
    ALTER TABLE requests ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add scheduled_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'requests' AND column_name = 'scheduled_date'
  ) THEN
    ALTER TABLE requests ADD COLUMN scheduled_date DATE;
  END IF;

  -- Add scheduled_time_window column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'requests' AND column_name = 'scheduled_time_window'
  ) THEN
    ALTER TABLE requests ADD COLUMN scheduled_time_window TEXT;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_requests_client_id ON requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_client_clerk_id ON requests(client_clerk_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_service_id ON requests(service_id);
CREATE INDEX IF NOT EXISTS idx_requests_work_area_id ON requests(work_area_id);
CREATE INDEX IF NOT EXISTS idx_requests_open_searching ON requests(is_open, status) 
  WHERE is_open = true AND status = 'searching_for_worker';

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_requests_set_updated_at ON requests;
CREATE TRIGGER trg_requests_set_updated_at
BEFORE UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Auto-generate public_id on insert (BB-XXXXXX format)
CREATE OR REPLACE FUNCTION generate_public_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    -- Generate random 6-character alphanumeric suffix
    new_id := 'BB-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

    -- Check uniqueness
    EXIT WHEN NOT EXISTS (SELECT 1 FROM requests WHERE public_id = new_id);

    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Failed to generate unique public_id after 10 attempts';
    END IF;
  END LOOP;

  NEW.public_id := new_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_requests_generate_public_id ON requests;
CREATE TRIGGER trg_requests_generate_public_id
BEFORE INSERT ON requests
FOR EACH ROW
WHEN (NEW.public_id IS NULL)
EXECUTE FUNCTION generate_public_id();

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE requests TO anon, authenticated;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can view own requests" ON requests;
DROP POLICY IF EXISTS "Clients can insert own requests" ON requests;
DROP POLICY IF EXISTS "Clients can update own requests" ON requests;
DROP POLICY IF EXISTS "Workers can view open requests" ON requests;
DROP POLICY IF EXISTS "Workers can view accepted requests" ON requests;

-- RLS:
-- Clerk/Supabase JWT template uses `sub` as Clerk user id.
-- Enforce per-row access via client_clerk_id, avoiding joins.
-- NOTE: Even when a user is "signed in" to your app (Clerk), Postgres RLS still
-- only trusts the JWT claims it receives. If client_clerk_id doesn't match `sub`,
-- the row will be invisible/unwritable due to RLS.

CREATE POLICY "Clients can view own requests"
  ON requests
  FOR SELECT
  USING (
    client_clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Workers can view open requests that are searching for a worker
-- They can only see requests, not modify them directly
CREATE POLICY "Workers can view open requests"
  ON requests
  FOR SELECT
  USING (
    is_open = true 
    AND status = 'searching_for_worker'
  );

CREATE POLICY "Clients can insert own requests"
  ON requests
  FOR INSERT
  WITH CHECK (
    client_clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Optional: allow clients to update only their own requests.
-- (You may later want to restrict columns via separate RPC.)
CREATE POLICY "Clients can update own requests"
  ON requests
  FOR UPDATE
  USING (
    client_clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  WITH CHECK (
    client_clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

COMMENT ON TABLE requests IS 'Client service requests. Contains immutable snapshots (address/media/availability) plus optional linkages (address_id).';
COMMENT ON COLUMN requests.public_id IS 'Human-friendly request ID in BB-XXXXXX format, auto-generated on insert.';
COMMENT ON COLUMN requests.time_windows IS 'JSONB keyed by date (YYYY-MM-DD) with array of time window strings.';

-- Policy: Workers can view their own accepted requests
CREATE POLICY "Workers can view accepted requests"
  ON requests
  FOR SELECT
  USING (
    worker_clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- RPC Function: accept_job
-- Allows a worker to accept a job by selecting a scheduled date/time from available options
CREATE OR REPLACE FUNCTION accept_job(
    p_request_id UUID,
    p_worker_id UUID,
    p_worker_clerk_id TEXT,
    p_scheduled_date DATE,
    p_scheduled_time_window TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request requests%ROWTYPE;
    v_updated_request requests%ROWTYPE;
BEGIN
    -- First, check if the request exists and is still available
    SELECT * INTO v_request
    FROM requests
    WHERE id = p_request_id
    FOR UPDATE; -- Lock the row
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found');
    END IF;
    
    IF v_request.status != 'searching_for_worker' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request is no longer available');
    END IF;
    
    IF v_request.is_open = false THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request has been closed');
    END IF;
    
    -- Validate that the scheduled date is in the available_dates
    IF NOT (p_scheduled_date = ANY(v_request.available_dates)) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Selected date is not in the available dates');
    END IF;
    
    -- Update the request with worker assignment and scheduled info
    UPDATE requests
    SET 
        worker_id = p_worker_id,
        worker_clerk_id = p_worker_clerk_id,
        status = 'inspection_scheduled',
        is_open = false,
        accepted_at = now(),
        scheduled_date = p_scheduled_date,
        scheduled_time_window = p_scheduled_time_window,
        updated_at = now()
    WHERE id = p_request_id
    RETURNING * INTO v_updated_request;
    
    -- Return success with the updated request
    RETURN jsonb_build_object(
        'success', true,
        'request', jsonb_build_object(
            'id', v_updated_request.id,
            'public_id', v_updated_request.public_id,
            'title', v_updated_request.title,
            'status', v_updated_request.status,
            'accepted_at', v_updated_request.accepted_at,
            'scheduled_date', v_updated_request.scheduled_date,
            'scheduled_time_window', v_updated_request.scheduled_time_window,
            'worker_id', v_updated_request.worker_id,
            'worker_clerk_id', v_updated_request.worker_clerk_id
        )
    );
END;
$$;

-- RPC Function: get_worker_requests
-- Fetches all requests assigned to a worker (current and previous)
CREATE OR REPLACE FUNCTION get_worker_requests(
    p_clerk_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_worker_id UUID;
    v_result JSONB;
BEGIN
    -- Get worker ID from clerk_id
    SELECT id INTO v_worker_id
    FROM workers
    WHERE clerk_id = p_clerk_id;

    IF v_worker_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Worker not found', 'requests', '[]'::jsonb);
    END IF;

    -- Fetch all requests assigned to this worker
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
                'apt_suite_unit', r.apt_suite_unit,
                'city', r.city,
                'state', r.state,
                'zip_code', r.zip_code,
                'location_type', r.location_type,
                'available_dates', r.available_dates,
                'time_windows', r.time_windows,
                'scheduled_date', r.scheduled_date,
                'scheduled_time_window', r.scheduled_time_window,
                'pets_on_site', r.pets_on_site,
                'parking_notes', r.parking_notes,
                'photos', COALESCE(r.photos, ARRAY[]::text[]),
                'videos', COALESCE(r.videos, ARRAY[]::text[]),
                'inspection_fee', COALESCE(r.inspection_fee, 75.00),
                'status', r.status,
                'is_open', r.is_open,
                'created_at', r.created_at,
                'accepted_at', r.accepted_at,
                'updated_at', r.updated_at,
                'client_id', r.client_id,
                'client_clerk_id', r.client_clerk_id,
                'client_first_name', u.first_name,
                'client_last_name', u.last_name
            )
            ORDER BY r.accepted_at DESC NULLS LAST, r.created_at DESC
        ), '[]'::jsonb)
    ) INTO v_result
    FROM requests r
    LEFT JOIN services s ON s.id = r.service_id
    LEFT JOIN work_areas wa ON wa.id = r.work_area_id
    LEFT JOIN users u ON u.id = r.client_id
    WHERE r.worker_clerk_id = p_clerk_id;

    RETURN v_result;
END;
$$;

-- RPC Function: cancel_worker_job
-- Allows a worker to cancel/withdraw from an accepted job
-- Resets the request back to 'searching_for_worker' status and removes worker assignment
CREATE OR REPLACE FUNCTION cancel_worker_job(
    p_request_id UUID,
    p_worker_clerk_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request requests%ROWTYPE;
    v_updated_request requests%ROWTYPE;
BEGIN
    -- First, check if the request exists and belongs to this worker
    SELECT * INTO v_request
    FROM requests
    WHERE id = p_request_id
    FOR UPDATE; -- Lock the row
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found');
    END IF;
    
    -- Verify the worker is assigned to this request
    IF v_request.worker_clerk_id IS NULL OR v_request.worker_clerk_id != p_worker_clerk_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'You are not assigned to this request');
    END IF;
    
    -- Only allow cancellation for certain statuses
    IF v_request.status NOT IN ('inspection_scheduled', 'waiting_for_offer', 'awaiting_client_confirmation') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot cancel a job in this status');
    END IF;
    
    -- Update the request: remove worker assignment and reset status
    UPDATE requests
    SET 
        worker_id = NULL,
        worker_clerk_id = NULL,
        status = 'searching_for_worker',
        is_open = true,
        accepted_at = NULL,
        scheduled_date = NULL,
        scheduled_time_window = NULL,
        updated_at = now()
    WHERE id = p_request_id
    RETURNING * INTO v_updated_request;
    
    -- Return success with the updated request info
    RETURN jsonb_build_object(
        'success', true,
        'request', jsonb_build_object(
            'id', v_updated_request.id,
            'public_id', v_updated_request.public_id,
            'title', v_updated_request.title,
            'status', v_updated_request.status,
            'is_open', v_updated_request.is_open
        )
    );
END;
$$;
