/**
 * Supabase Configuration
 * 
 * Handles connection to Supabase database for storing app-specific user data
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file'
  );
}

// Create Supabase client (unauthenticated/anon)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase client that uses a third-party JWT (e.g. Clerk) as Bearer token.
// This is the recommended approach when you are NOT using Supabase Auth sessions.
export const createAuthedSupabaseClient = (accessToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

export type SupabaseClientAuthed = ReturnType<typeof createAuthedSupabaseClient>;

// TypeScript interfaces for database types
export interface SupabaseUser {
  id: string;
  clerk_user_id: string;
  role: 'client' | 'worker';
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
}

// Helper type for creating users
export type CreateUserData = Omit<SupabaseUser, 'id' | 'created_at'>;

// Helper type for updating users
export type UpdateUserData = Partial<Omit<SupabaseUser, 'id' | 'clerk_user_id' | 'created_at'>>;

// Worker-related TypeScript interfaces
export interface SupabaseWorker {
  id: string;
  clerk_id: string;
  years_experience: number;
  bio: string | null;
  is_active: boolean;
  rating_avg: number | null;
  jobs_completed: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseService {
  id: string;
  type: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  estimated_wait: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SupabaseWorkArea {
  id: string;
  type: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SupabaseWorkerService {
  id: string;
  worker_id: string;
  service_id: string;
  years_experience: number | null;
  base_price: number | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseWorkerWorkArea {
  worker_id: string;
  work_area_id: string;
  created_at: string;
}

// Worker onboarding data type
export interface WorkerOnboardingData {
  profile: {
    firstName?: string;
    lastName?: string;
    month?: string;
    day?: string;
    year?: string;
    streetAddress?: string;
    apt?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    yearsOfExperience?: string;
  };
  services: string[];  // Service type strings (e.g., ['plumbing', 'hvac'])
  locations: string[]; // Work area type strings (e.g., ['kitchen', 'bathroom'])
}

// Worker onboarding result type
export interface WorkerOnboardingResult {
  success: boolean;
  worker: SupabaseWorker;
  services: Array<{
    id: string;
    worker_id: string;
    service_id: string;
    service_type: string;
    service_name: string;
  }>;
  work_areas: Array<{
    worker_id: string;
    work_area_id: string;
    work_area_type: string;
    work_area_name: string;
  }>;
}

// Available request for worker feed
export interface WorkerAvailableRequest {
  id: string;
  public_id: string | null;
  title: string;
  description: string;
  service_id: string | null;
  service_type: string;
  work_area_id: string | null;
  work_area_type: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  location_type: string | null;
  available_dates: string[];
  time_windows: Record<string, string[]>;
  pets_on_site: boolean;
  parking_notes: string | null;
  photos: string[];
  videos: string[];
  inspection_fee: number;
  status: string;
  created_at: string;
  client_first_name: string | null;
  client_last_name: string | null;
}

// Result from get_available_requests_for_worker RPC
export interface WorkerAvailableRequestsResult {
  success: boolean;
  error?: string;
  requests: WorkerAvailableRequest[];
}
