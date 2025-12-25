// Mock user data
import { User } from '../types/user';

export const mockUser: User = {
  id: 'user-001',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@email.com',
  phone: '(555) 123-4567',
  address: '123 Main Street',
  city: 'Boston',
  state: 'MA',
  zip: '02101',
  memberSince: 'January 2025',
  userType: 'client',
};

export const getCurrentUser = (): User => {
  return mockUser;
};

export const updateUser = (updates: Partial<User>): User => {
  Object.assign(mockUser, updates);
  return mockUser;
};

export const toggleUserType = (): User => {
  mockUser.userType = mockUser.userType === 'client' ? 'service_provider' : 'client';
  return mockUser;
};
