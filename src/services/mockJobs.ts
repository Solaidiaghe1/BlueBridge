// Mock jobs data (for worker side)
import { Job, Earnings } from '../types/job';

export const mockJobs: Job[] = [
  {
    id: 'JOB-001',
    serviceType: 'plumbing',
    title: 'Kitchen sink leak repair',
    description: 'Pipe under sink leaking for several days. Water pooling in cabinet.',
    location: 'Kitchen',
    address: '456 Oak Avenue, Apt 2A',
    inspectionFee: 19,
    timeWindow: 'Today 2-4 PM',
    status: 'available',
    photos: [],
  },
  {
    id: 'JOB-002',
    serviceType: 'electrical',
    title: 'Outlet replacement',
    description: 'Bedroom outlet not working. Possibly faulty wiring.',
    location: 'Bedroom',
    address: '789 Pine Street',
    inspectionFee: 19,
    timeWindow: 'Tomorrow 10-12 AM',
    status: 'available',
    photos: [],
  },
  {
    id: 'JOB-003',
    serviceType: 'hvac',
    title: 'Heating system inspection',
    description: 'Furnace making unusual noise. Not heating properly.',
    location: 'Basement',
    address: '321 Maple Drive',
    inspectionFee: 19,
    timeWindow: 'Tomorrow 3-5 PM',
    status: 'accepted',
    clientName: 'Jane Smith',
    clientPhone: '(555) 234-5678',
    acceptedAt: '2025-12-24T09:00:00',
    photos: [],
  },
];

export const mockEarnings: Earnings[] = [
  {
    id: 'EARN-001',
    jobId: 'JOB-010',
    amount: 19,
    date: '2025-12-20T14:00:00',
    status: 'completed',
    serviceName: 'Plumbing Inspection',
  },
  {
    id: 'EARN-002',
    jobId: 'JOB-011',
    amount: 19,
    date: '2025-12-21T10:30:00',
    status: 'completed',
    serviceName: 'Electrical Inspection',
  },
  {
    id: 'EARN-003',
    jobId: 'JOB-012',
    amount: 19,
    date: '2025-12-22T16:00:00',
    status: 'completed',
    serviceName: 'HVAC Inspection',
  },
  {
    id: 'EARN-004',
    jobId: 'JOB-003',
    amount: 19,
    date: '2025-12-24T15:00:00',
    status: 'pending',
    serviceName: 'HVAC Inspection',
  },
];

export const getAvailableJobs = (): Job[] => {
  return mockJobs.filter(job => job.status === 'available');
};

export const getActiveJobs = (): Job[] => {
  return mockJobs.filter(
    job => job.status === 'accepted' || job.status === 'on_the_way' || job.status === 'arrived'
  );
};

export const getJobHistory = (): Job[] => {
  return mockJobs.filter(job => job.status === 'completed');
};

export const getJobById = (id: string): Job | undefined => {
  return mockJobs.find(job => job.id === id);
};

export const acceptJob = (jobId: string): Job | undefined => {
  const job = mockJobs.find(j => j.id === jobId);
  if (job && job.status === 'available') {
    job.status = 'accepted';
    job.acceptedAt = new Date().toISOString();
  }
  return job;
};

export const updateJobStatus = (jobId: string, status: Job['status']): Job | undefined => {
  const job = mockJobs.find(j => j.id === jobId);
  if (job) {
    job.status = status;
    if (status === 'completed') {
      job.completedAt = new Date().toISOString();
    }
  }
  return job;
};

export const getTotalEarnings = (): { total: number; pending: number; completed: number } => {
  const completed = mockEarnings
    .filter(e => e.status === 'completed')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const pending = mockEarnings
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);
  
  return {
    total: completed + pending,
    pending,
    completed,
  };
};

export const getEarningsByPeriod = (period: 'week' | 'month'): Earnings[] => {
  const now = new Date();
  const startDate = new Date();
  
  if (period === 'week') {
    startDate.setDate(now.getDate() - 7);
  } else {
    startDate.setMonth(now.getMonth() - 1);
  }
  
  return mockEarnings.filter(earning => {
    const earningDate = new Date(earning.date);
    return earningDate >= startDate && earningDate <= now;
  });
};
