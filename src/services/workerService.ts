/**
 * Worker Service
 *
 * Handles worker-specific database operations including:
 * - Creating worker profiles
 * - Syncing worker services
 * - Syncing worker work areas
 * - Completing worker onboarding
 */

import {
  createAuthedSupabaseClient,
  SupabaseClientAuthed,
  SupabaseWorker,
  WorkerOnboardingData,
  WorkerOnboardingResult,
  WorkerAvailableRequest,
  WorkerAvailableRequestsResult,
} from '../config/supabase';
import { OfferData } from '../worker/components/SubmitOfferModal';

// Type for worker's accepted requests (includes accepted_at, scheduled info, etc.)
export interface WorkerAcceptedRequest {
  id: string;
  public_id: string | null;
  title: string;
  description: string;
  service_id: string | null;
  service_type: string;
  work_area_id: string | null;
  work_area_type: string;
  street_address: string;
  apt_suite_unit: string | null;
  city: string;
  state: string;
  zip_code: string;
  location_type: string | null;
  available_dates: string[];
  time_windows: Record<string, string[]>;
  scheduled_date: string | null;
  scheduled_time_window: string | null;
  pets_on_site: boolean;
  parking_notes: string | null;
  photos: string[];
  videos: string[];
  inspection_fee: number;
  status: string;
  is_open: boolean;
  created_at: string;
  accepted_at: string | null;
  updated_at: string;
  client_id: string;
  client_clerk_id: string;
  client_first_name: string | null;
  client_last_name: string | null;
}

// Result from accept_job RPC
export interface AcceptJobResult {
  success: boolean;
  error?: string;
  request?: {
    id: string;
    public_id: string;
    title: string;
    status: string;
    accepted_at: string;
    scheduled_date: string;
    scheduled_time_window: string;
    worker_id: string;
    worker_clerk_id: string;
  };
}

// Result from get_worker_requests RPC
export interface WorkerRequestsResult {
  success: boolean;
  error?: string;
  requests: WorkerAcceptedRequest[];
}

// Result from cancel_worker_job RPC
export interface CancelWorkerJobResult {
  success: boolean;
  error?: string;
  request?: {
    id: string;
    public_id: string;
    title: string;
    status: string;
    is_open: boolean;
  };
}

/**
 * Parse years of experience string to integer
 * Handles formats like "0-1", "1-2", "3-5", "6-10", "11-15", "16-20", "20+"
 */
export const parseYearsOfExperience = (experienceStr: string): number => {
  if (!experienceStr) return 0;

  // Handle "20+" case
  if (experienceStr.includes('+')) {
    return parseInt(experienceStr.replace('+', ''), 10) || 20;
  }

  // Handle range format like "3-5" - take the lower bound
  if (experienceStr.includes('-')) {
    const [lower] = experienceStr.split('-');
    return parseInt(lower, 10) || 0;
  }

  // Try to parse as a plain number
  return parseInt(experienceStr, 10) || 0;
};

/**
 * Complete worker onboarding by creating worker record and syncing services/work areas
 *
 * @param supabaseClient - Authenticated Supabase client
 * @param userId - The user's UUID from the users table
 * @param clerkId - The Clerk user ID
 * @param onboardingData - Worker onboarding data (profile, services, locations)
 * @returns WorkerOnboardingResult with worker, services, and work areas
 */
export const completeWorkerOnboarding = async (
  supabaseClient: SupabaseClientAuthed,
  userId: string,
  clerkId: string,
  onboardingData: WorkerOnboardingData
): Promise<WorkerOnboardingResult> => {
  const yearsExperience = parseYearsOfExperience(
    onboardingData.profile?.yearsOfExperience || ''
  );

  // Build bio from profile data if available
  const bio = onboardingData.profile?.city && onboardingData.profile?.state
    ? `Based in ${onboardingData.profile.city}, ${onboardingData.profile.state}`
    : null;

  console.log('[WorkerService] Completing worker onboarding:', {
    userId,
    clerkId,
    yearsExperience,
    services: onboardingData.services,
    locations: onboardingData.locations,
  });

  // Call the RPC function to complete onboarding atomically
  const { data, error } = await supabaseClient.rpc('complete_worker_onboarding', {
    p_user_id: userId,
    p_clerk_id: clerkId,
    p_years_experience: yearsExperience,
    p_bio: bio,
    p_service_types: onboardingData.services,
    p_work_area_types: onboardingData.locations,
  });

  if (error) {
    console.error('[WorkerService] Onboarding RPC error:', error);
    throw new Error(`Failed to complete worker onboarding: ${error.message}`);
  }

  if (!data || !data.success) {
    console.error('[WorkerService] Onboarding failed:', data);
    throw new Error('Failed to complete worker onboarding: Unknown error');
  }

  console.log('[WorkerService] Onboarding complete:', data);
  return data as WorkerOnboardingResult;
};

/**
 * Get worker profile by Clerk ID
 */
export const getWorkerByClerkId = async (
  supabaseClient: SupabaseClientAuthed,
  clerkId: string
): Promise<SupabaseWorker | null> => {
  const { data, error } = await supabaseClient
    .from('workers')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    console.error('[WorkerService] Error fetching worker:', error);
    throw error;
  }

  return data;
};

/**
 * Get worker's services with service details
 */
export const getWorkerServices = async (
  supabaseClient: SupabaseClientAuthed,
  workerId: string
): Promise<Array<{ service_id: string; service_type: string; service_name: string }>> => {
  const { data, error } = await supabaseClient
    .from('worker_services')
    .select(`
      service_id,
      services:service_id (
        type,
        name
      )
    `)
    .eq('worker_id', workerId);

  if (error) {
    console.error('[WorkerService] Error fetching worker services:', error);
    throw error;
  }

  return (data || []).map((item: any) => ({
    service_id: item.service_id,
    service_type: item.services?.type || '',
    service_name: item.services?.name || '',
  }));
};

/**
 * Get worker's work areas with work area details
 */
export const getWorkerWorkAreas = async (
  supabaseClient: SupabaseClientAuthed,
  workerId: string
): Promise<Array<{ work_area_id: string; work_area_type: string; work_area_name: string }>> => {
  const { data, error } = await supabaseClient
    .from('worker_work_areas')
    .select(`
      work_area_id,
      work_areas:work_area_id (
        type,
        name
      )
    `)
    .eq('worker_id', workerId);

  if (error) {
    console.error('[WorkerService] Error fetching worker work areas:', error);
    throw error;
  }

  return (data || []).map((item: any) => ({
    work_area_id: item.work_area_id,
    work_area_type: item.work_areas?.type || '',
    work_area_name: item.work_areas?.name || '',
  }));
};

/**
 * Fetch all available services from the database
 */
export const fetchServices = async (
  supabaseClient: SupabaseClientAuthed
): Promise<Array<{ id: string; type: string; name: string }>> => {
  const { data, error } = await supabaseClient
    .from('services')
    .select('id, type, name')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('[WorkerService] Error fetching services:', error);
    throw error;
  }

  return data || [];
};

/**
 * Fetch all available work areas from the database
 */
export const fetchWorkAreas = async (
  supabaseClient: SupabaseClientAuthed
): Promise<Array<{ id: string; type: string; name: string }>> => {
  const { data, error } = await supabaseClient
    .from('work_areas')
    .select('id, type, name')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('[WorkerService] Error fetching work areas:', error);
    throw error;
  }

  return data || [];
};

/**
 * Update worker services
 */
export const updateWorkerServices = async (
  supabaseClient: SupabaseClientAuthed,
  workerId: string,
  serviceTypes: string[]
): Promise<void> => {
  const { data, error } = await supabaseClient.rpc('sync_worker_services', {
    p_worker_id: workerId,
    p_service_types: serviceTypes,
  });

  if (error) {
    console.error('[WorkerService] Error updating worker services:', error);
    throw error;
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Failed to update worker services');
  }
};

/**
 * Update worker work areas
 */
export const updateWorkerWorkAreas = async (
  supabaseClient: SupabaseClientAuthed,
  workerId: string,
  workAreaTypes: string[]
): Promise<void> => {
  const { data, error } = await supabaseClient.rpc('sync_worker_work_areas', {
    p_worker_id: workerId,
    p_work_area_types: workAreaTypes,
  });

  if (error) {
    console.error('[WorkerService] Error updating worker work areas:', error);
    throw error;
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Failed to update worker work areas');
  }
};

/**
 * Fetch available requests matching worker's services and work areas
 */
export const getAvailableRequestsForWorker = async (
  supabaseClient: SupabaseClientAuthed,
  clerkId: string
): Promise<WorkerAvailableRequest[]> => {
  console.log('[WorkerService] Fetching available requests for worker:', clerkId);

  const { data, error } = await supabaseClient.rpc('get_available_requests_for_worker', {
    p_clerk_id: clerkId,
  });

  if (error) {
    console.error('[WorkerService] Error fetching available requests:', error);
    throw error;
  }

  const result = data as WorkerAvailableRequestsResult;

  if (!result?.success) {
    console.warn('[WorkerService] Failed to fetch requests:', result?.error);
    return [];
  }

  console.log('[WorkerService] Fetched', result.requests?.length || 0, 'available requests');
  return result.requests || [];
};

/**
 * Convert 24-hour time string to 12-hour AM/PM format
 * e.g., "8:00" -> "8 AM", "14:00" -> "2 PM", "8:00-12:00" -> "8 AM - 12 PM"
 */
export const formatTimeTo12Hour = (timeStr: string): string => {
  // Handle time range format (e.g., "8:00-12:00")
  if (timeStr.includes('-')) {
    const [start, end] = timeStr.split('-').map(t => t.trim());
    return `${formatSingleTimeTo12Hour(start)} - ${formatSingleTimeTo12Hour(end)}`;
  }
  return formatSingleTimeTo12Hour(timeStr);
};

/**
 * Convert a single 24-hour time to 12-hour format
 * e.g., "8:00" -> "8 AM", "14:00" -> "2 PM", "13:30" -> "1:30 PM"
 */
const formatSingleTimeTo12Hour = (timeStr: string): string => {
  // If already in 12-hour format (contains AM or PM), return as-is
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr;
  }

  // Parse the time
  const parts = timeStr.split(':');
  if (parts.length < 1) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;

  if (isNaN(hours)) return timeStr;

  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  if (minutes === 0) {
    return `${hours} ${period}`;
  }
  return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Format a time window for display with 12-hour format
 * Handles various formats like "8:00-12:00", "Morning (8am-12pm)", etc.
 */
export const formatTimeWindowDisplay = (timeWindow: string): string => {
  // If it already contains descriptive text with AM/PM, return as-is
  if (timeWindow.toLowerCase().includes('morning') || 
      timeWindow.toLowerCase().includes('afternoon') || 
      timeWindow.toLowerCase().includes('evening')) {
    return timeWindow;
  }
  
  // Convert 24-hour format to 12-hour
  return formatTimeTo12Hour(timeWindow);
};

/**
 * Format availability window from dates and time windows
 */
export const formatAvailabilityWindow = (
  availableDates: string[],
  timeWindows: Record<string, string[]>
): string => {
  if (!availableDates || availableDates.length === 0) {
    return 'Flexible';
  }

  // Sort dates
  const sortedDates = [...availableDates].sort();
  const firstDate = new Date(sortedDates[0] + 'T00:00:00');
  const lastDate = new Date(sortedDates[sortedDates.length - 1] + 'T00:00:00');

  // Format date range
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const year = firstDate.getFullYear();
  let dateRange: string;

  if (sortedDates.length === 1) {
    dateRange = `${formatDate(firstDate)}, ${year}`;
  } else {
    dateRange = `${formatDate(firstDate)}-${formatDate(lastDate)}, ${year}`;
  }

  // Get time window for first date (or default)
  const firstDateKey = sortedDates[0];
  const rawTimeWindow = timeWindows?.[firstDateKey]?.[0] || '9 AM - 5 PM';
  const timeWindow = formatTimeWindowDisplay(rawTimeWindow);

  return `${dateRange} (${timeWindow})`;
};

/**
 * Get client full name from first and last name
 */
export const getClientFullName = (
  firstName: string | null,
  lastName: string | null
): string => {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  
  if (first && last) {
    return `${first} ${last}`;
  }
  if (first) {
    return first;
  }
  if (last) {
    return last;
  }
  return 'Anonymous Client';
};

/**
 * Accept a job request
 * 
 * @param supabaseClient - Authenticated Supabase client
 * @param requestId - The UUID of the request to accept
 * @param workerId - The worker's UUID
 * @param workerClerkId - The worker's Clerk ID
 * @param scheduledDate - The selected date (YYYY-MM-DD format)
 * @param scheduledTimeWindow - The selected time window
 * @returns AcceptJobResult with success status and updated request
 */
export const acceptJob = async (
  supabaseClient: SupabaseClientAuthed,
  requestId: string,
  workerId: string,
  workerClerkId: string,
  scheduledDate: string,
  scheduledTimeWindow: string
): Promise<AcceptJobResult> => {
  console.log('[WorkerService] Accepting job:', {
    requestId,
    workerId,
    scheduledDate,
    scheduledTimeWindow,
  });

  const { data, error } = await supabaseClient.rpc('accept_job', {
    p_request_id: requestId,
    p_worker_id: workerId,
    p_worker_clerk_id: workerClerkId,
    p_scheduled_date: scheduledDate,
    p_scheduled_time_window: scheduledTimeWindow,
  });

  if (error) {
    console.error('[WorkerService] Accept job RPC error:', error);
    throw new Error(`Failed to accept job: ${error.message}`);
  }

  const result = data as AcceptJobResult;
  
  if (!result?.success) {
    console.warn('[WorkerService] Accept job failed:', result?.error);
    return { success: false, error: result?.error || 'Unknown error' };
  }

  console.log('[WorkerService] Job accepted successfully:', result.request);
  return result;
};

/**
 * Get all requests assigned to the worker
 * 
 * @param supabaseClient - Authenticated Supabase client
 * @param clerkId - The worker's Clerk ID
 * @returns Array of WorkerAcceptedRequest
 */
export const getWorkerRequests = async (
  supabaseClient: SupabaseClientAuthed,
  clerkId: string
): Promise<WorkerAcceptedRequest[]> => {
  console.log('[WorkerService] Fetching worker requests for:', clerkId);

  const { data, error } = await supabaseClient.rpc('get_worker_requests', {
    p_clerk_id: clerkId,
  });

  if (error) {
    console.error('[WorkerService] Error fetching worker requests:', error);
    throw error;
  }

  const result = data as WorkerRequestsResult;

  if (!result?.success) {
    console.warn('[WorkerService] Failed to fetch worker requests:', result?.error);
    return [];
  }

  console.log('[WorkerService] Fetched', result.requests?.length || 0, 'worker requests');
  return result.requests || [];
};

/**
 * Format a scheduled date for display
 */
export const formatScheduledDate = (
  date: string | null,
  timeWindow: string | null
): string => {
  if (!date) {
    return 'Not scheduled';
  }

  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (timeWindow) {
    const formattedTimeWindow = formatTimeWindowDisplay(timeWindow);
    return `${formattedDate} (${formattedTimeWindow})`;
  }

  return formattedDate;
};

/**
 * Format accepted_at date for display
 */
export const formatAcceptedDate = (acceptedAt: string | null): string => {
  if (!acceptedAt) {
    return 'N/A';
  }

  const dateObj = new Date(acceptedAt);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Cancel/withdraw from an accepted job
 * This resets the request back to 'searching_for_worker' status
 * and removes the worker assignment, making it available again
 * 
 * @param supabaseClient - Authenticated Supabase client
 * @param requestId - The UUID of the request to cancel
 * @param workerClerkId - The worker's Clerk ID (for verification)
 * @returns CancelWorkerJobResult with success status
 */
export const cancelWorkerJob = async (
  supabaseClient: SupabaseClientAuthed,
  requestId: string,
  workerClerkId: string
): Promise<CancelWorkerJobResult> => {
  console.log('[WorkerService] Cancelling job:', {
    requestId,
    workerClerkId,
  });

  const { data, error } = await supabaseClient.rpc('cancel_worker_job', {
    p_request_id: requestId,
    p_worker_clerk_id: workerClerkId,
  });

  if (error) {
    console.error('[WorkerService] Cancel job RPC error:', error);
    throw new Error(`Failed to cancel job: ${error.message}`);
  }

  const result = data as CancelWorkerJobResult;
  
  if (!result?.success) {
    console.warn('[WorkerService] Cancel job failed:', result?.error);
    return { success: false, error: result?.error || 'Unknown error' };
  }

  console.log('[WorkerService] Job cancelled successfully:', result.request);
  return result;
};

/**
 * Submit a worker offer
 * 
 * @param supabaseClient - Authenticated Supabase client
 * @param requestId - The UUID of the request
 * @param offerData - The offer data including costs, description, and schedule
 */
export const submitWorkerOffer = async (
  supabaseClient: SupabaseClientAuthed,
  requestId: string,
  offerData: OfferData
): Promise<void> => {
  const updatePayload: any = {
    parts_cost: parseFloat(offerData.materialsCost) || 0,
    labor_cost: parseFloat(offerData.laborCost) || 0,
    total_cost: (parseFloat(offerData.materialsCost) || 0) + (parseFloat(offerData.laborCost) || 0),
    job_description: offerData.jobDescription,
    job_dates: [offerData.startDate],
    job_time_windows: { [offerData.startDate]: [offerData.startTimeSlot] },
    duration: offerData.estimatedDuration,
    status: 'job_scheduled',
  };
  const { error } = await supabaseClient
    .from('requests')
    .update(updatePayload)
    .eq('id', requestId);
  if (error) throw error;
};
