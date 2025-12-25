// API stubs for future backend integration
import { Request, RequestFormData } from '../types/request';
import { User, ProfileFormData } from '../types/user';
import { Job } from '../types/job';
import { createRequest as mockCreateRequest } from '../services/mockRequests';
import { updateUser as mockUpdateUser } from '../services/mockUser';

/**
 * Stub function for creating a request
 * In production, this would call the actual backend API
 */
export const createRequest = async (data: RequestFormData): Promise<Request> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Use mock service for now
  return mockCreateRequest({
    serviceType: data.title.toLowerCase().includes('plumbing') ? 'plumbing' : 'general',
    title: data.title,
    description: data.description,
    location: data.locationType,
    address: data.address,
    apt: data.apt,
    city: data.city,
    state: data.state,
    zip: data.zip,
    photos: data.photos,
    availabilityWindow: data.availabilityWindow,
    locationType: data.locationType,
    petsOnSite: data.petsOnSite,
    parkingNotes: data.parkingNotes,
    paymentMethod: data.paymentMethod,
  });
};

/**
 * Stub function for updating user profile
 * In production, this would call the actual backend API
 */
export const updateProfile = async (data: ProfileFormData): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Use mock service for now
  return mockUpdateUser({
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.month && data.day && data.year 
      ? `${data.year}-${data.month}-${data.day}` 
      : undefined,
    address: data.address,
    apt: data.apt,
    city: data.city,
    state: data.state,
    zip: data.zip,
  });
};

/**
 * Stub function for accepting a job (worker side)
 * In production, this would call the actual backend API
 */
export const acceptJob = async (jobId: string): Promise<Job> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // This would be implemented when worker side is active
  throw new Error('Not implemented - worker side coming soon');
};

/**
 * Stub function for updating job status (worker side)
 * In production, this would call the actual backend API
 */
export const updateJobStatus = async (jobId: string, status: string): Promise<Job> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // This would be implemented when worker side is active
  throw new Error('Not implemented - worker side coming soon');
};

/**
 * Stub function for authentication
 * In production, this would integrate with Supabase Auth
 */
export const login = async (email: string, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // This would be implemented with real auth
  throw new Error('Authentication not implemented - MVP uses mock data');
};

/**
 * Stub function for payment processing
 * In production, this would integrate with Stripe
 */
export const processPayment = async (amount: number, method: string): Promise<{ success: boolean }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // This would be implemented with Stripe
  throw new Error('Payment processing not implemented - MVP uses mock data');
};
