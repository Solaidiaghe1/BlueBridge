// Request type definitions

export type RequestStatus =
  // Supabase / real statuses
  | 'searching_for_worker'
  | 'inspection_scheduled'
  | 'awaiting_client_confirmation'
  | 'waiting_for_offer'
  | 'job_scheduled'
  | 'completed'
  | 'cancelled'
  // Legacy/mock statuses still used by worker-side UI and mock services
  | 'waiting_assignment'
  | 'pending_approval'
  | 'job_ongoing';

// Matches the `requests` table shape used by Supabase reads.
export interface Request {
  id: string;
  public_id?: string | null;

  client_id?: string;
  client_clerk_id?: string;

  service_type?: string | null;
  location?: string | null;
  title: string;
  description: string;

  photos?: string[] | null;
  videos?: string[] | null;

  // Immutable address snapshot
  street_address: string;
  apt_suite_unit?: string | null;
  city: string;
  state: string;
  zip_code: string;
  location_type?: string | null;

  address_id?: string | null;

  // Availability
  available_dates?: string[]; // ISO YYYY-MM-DD
  time_windows?: Record<string, string[]>; // key: YYYY-MM-DD, value: array of time window strings

  pets_on_site?: boolean | null;
  parking_notes?: string | null;

  // Worker assignment and scheduling
  worker_id?: string | null;
  worker_clerk_id?: string | null;
  accepted_at?: string | null;
  scheduled_date?: string | null;
  scheduled_time_window?: string | null;

  // Worker offer/job scheduling fields
  parts_cost?: number | null;
  labor_cost?: number | null;
  total_cost?: number | null;
  job_description?: string | null;
  job_dates?: string[] | null; // ISO YYYY-MM-DD[]
  job_time_windows?: Record<string, string[]> | null; // key: YYYY-MM-DD, value: array of time window strings
  duration?: number | null; // in minutes or hours, as per your convention

  status: RequestStatus;
  is_open?: boolean | null;

  created_at: string;
  updated_at?: string;

  // --- Legacy/mock fields (worker UI & older screens) ---
  serviceType?: string; // alias of service_type
  providerName?: string;
  scheduledDate?: string;
  createdAt?: string; // alias of created_at

  inspectionFee?: number;
  jobPrice?: number;
  availabilityWindow?: string;

  // legacy address aliases
  address?: string;
  apt?: string;
  zip?: string;

  // legacy field aliases
  locationType?: string;
  petsOnSite?: boolean;
  parkingNotes?: string;
  paymentMethod?: string;
}

// Kept for request creation form screens (may be refactored later).
export interface RequestFormData {
  title: string;
  description: string;
  photos: string[];
  address: string;
  apt?: string;
  city?: string;
  state?: string;
  zip?: string;
  availabilityWindow?: string;
  locationType?: string;
  areaInLocation?: string;
  petsOnSite: boolean;
  parkingNotes?: string;
  paymentMethod?: string;
}

export interface StatusTimelineItem {
  id: string;
  status: string;
  timestamp: string;
  description: string;
}
