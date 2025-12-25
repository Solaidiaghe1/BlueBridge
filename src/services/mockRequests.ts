// Mock requests data
import { Request } from '../types/request';

export const mockRequests: Request[] = [
  {
    id: 'REQ-001',
    serviceType: 'plumbing',
    title: 'Leaking kitchen sink',
    description: 'The pipe under the kitchen sink has been leaking for 3 days. Water pools under the cabinet.',
    location: 'kitchen',
    address: '123 Main St',
    apt: '4B',
    city: 'Boston',
    state: 'MA',
    zip: '02101',
    status: 'job_ongoing',
    providerName: 'John Martinez',
    scheduledDate: '2025-12-18T14:30:00',
    createdAt: '2025-12-15T10:00:00',
    inspectionFee: 19,
    photos: [],
  },
  {
    id: 'REQ-002',
    serviceType: 'hvac',
    title: 'HVAC not heating',
    description: 'Heating system stopped working yesterday. House is getting cold.',
    location: 'basement',
    address: '123 Main St',
    apt: '4B',
    city: 'Boston',
    state: 'MA',
    zip: '02101',
    status: 'pending_approval',
    providerName: 'Sarah Chen',
    scheduledDate: '2025-12-19T10:00:00',
    createdAt: '2025-12-16T08:00:00',
    inspectionFee: 19,
    photos: [],
  },
  {
    id: 'REQ-003',
    serviceType: 'electrical',
    title: 'Outlet not working',
    description: 'Bedroom outlet stopped working. Need to check wiring.',
    location: 'bedroom',
    address: '123 Main St',
    apt: '4B',
    city: 'Boston',
    state: 'MA',
    zip: '02101',
    status: 'completed',
    providerName: 'Michael Johnson',
    scheduledDate: '2025-12-10T15:00:00',
    createdAt: '2025-12-08T12:00:00',
    inspectionFee: 19,
    photos: [],
  },
  {
    id: 'REQ-004',
    serviceType: 'carpentry',
    title: 'Cabinet door repair',
    description: 'Kitchen cabinet door hinge broken. Door hanging loose.',
    location: 'kitchen',
    address: '123 Main St',
    apt: '4B',
    city: 'Boston',
    state: 'MA',
    zip: '02101',
    status: 'cancelled',
    scheduledDate: '2025-12-05T13:00:00',
    createdAt: '2025-12-03T09:00:00',
    inspectionFee: 19,
    photos: [],
  },
];

export const getCurrentRequests = (): Request[] => {
  return mockRequests.filter(
    request => request.status === 'pending_approval' || request.status === 'job_ongoing'
  );
};

export const getPreviousRequests = (): Request[] => {
  return mockRequests.filter(
    request => request.status === 'completed' || request.status === 'cancelled'
  );
};

export const getRequestById = (id: string): Request | undefined => {
  return mockRequests.find(request => request.id === id);
};

export const createRequest = (requestData: Partial<Request>): Request => {
  const newRequest: Request = {
    id: `REQ-${String(mockRequests.length + 1).padStart(3, '0')}`,
    serviceType: requestData.serviceType || 'plumbing',
    title: requestData.title || '',
    description: requestData.description || '',
    location: requestData.location,
    address: requestData.address || '',
    apt: requestData.apt,
    city: requestData.city,
    state: requestData.state,
    zip: requestData.zip,
    status: 'pending_approval',
    createdAt: new Date().toISOString(),
    inspectionFee: 19,
    photos: requestData.photos || [],
    availabilityWindow: requestData.availabilityWindow,
    locationType: requestData.locationType,
    petsOnSite: requestData.petsOnSite,
    parkingNotes: requestData.parkingNotes,
    paymentMethod: requestData.paymentMethod,
  };
  
  mockRequests.push(newRequest);
  return newRequest;
};

export const updateRequestStatus = (id: string, status: Request['status']): Request | undefined => {
  const request = mockRequests.find(r => r.id === id);
  if (request) {
    request.status = status;
  }
  return request;
};

export const cancelRequest = (id: string): Request | undefined => {
  return updateRequestStatus(id, 'cancelled');
};
