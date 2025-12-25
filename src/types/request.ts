// Request type definitions
export type RequestStatus = 
  | 'pending_approval' 
  | 'job_ongoing' 
  | 'completed' 
  | 'cancelled';

export interface Request {
  id: string;
  serviceType: string;
  title: string;
  description: string;
  location?: string;
  address: string;
  apt?: string;
  city?: string;
  state?: string;
  zip?: string;
  photos?: string[];
  status: RequestStatus;
  providerName?: string;
  scheduledDate?: string;
  createdAt: string;
  inspectionFee: number;
  availabilityWindow?: string;
  locationType?: string;
  petsOnSite?: boolean;
  parkingNotes?: string;
  paymentMethod?: string;
}

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
