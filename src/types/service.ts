// Service type definitions
export type ServiceType = 'plumbing' | 'hvac' | 'electrical' | 'carpentry' | 'landscaping' | 'painting' | 'walling';

export interface Service {
  id: string;
  type: ServiceType;
  name: string;
  description: string;
  icon: string;
  estimatedWait: string;
  color: string;
}

export type LocationType = 
  | 'kitchen' 
  | 'bathroom' 
  | 'bedroom' 
  | 'living_room' 
  | 'outdoor' 
  | 'basement'
  | 'garage'
  | 'other';

export interface Location {
  id: string;
  type: LocationType;
  name: string;
  description: string;
  icon: string;
  color: string;
}
