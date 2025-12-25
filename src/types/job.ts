// Job type definitions (for worker side)
export type JobStatus = 
  | 'available' 
  | 'accepted' 
  | 'on_the_way' 
  | 'arrived' 
  | 'completed' 
  | 'cancelled';

export interface Job {
  id: string;
  serviceType: string;
  title: string;
  description: string;
  location: string;
  address: string;
  inspectionFee: number;
  timeWindow: string;
  status: JobStatus;
  clientName?: string;
  clientPhone?: string;
  photos?: string[];
  acceptedAt?: string;
  completedAt?: string;
}

export interface Earnings {
  id: string;
  jobId: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed';
  serviceName: string;
}
