// User type definitions
export type UserType = 'client' | 'service_provider';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address: string;
  apt?: string;
  city?: string;
  state?: string;
  zip?: string;
  memberSince: string;
  userType: UserType;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  month: string;
  day: string;
  year: string;
  address: string;
  apt?: string;
  city?: string;
  state?: string;
  zip?: string;
}
