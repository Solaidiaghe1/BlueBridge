// Mock services data
import { Service, Location } from '../types/service';

export const mockServices: Service[] = [
  {
    id: 'service-1',
    type: 'plumbing',
    name: 'Plumbing',
    description: 'Leaks, clogs, installations',
    icon: 'wrench',
    estimatedWait: '20 Minutes',
    color: '#2563EB',
  },
  {
    id: 'service-2',
    type: 'hvac',
    name: 'HVAC',
    description: 'Heating & cooling services',
    icon: 'wind',
    estimatedWait: '30 Minutes',
    color: '#5B9FAD',
  },
  {
    id: 'service-3',
    type: 'electrical',
    name: 'Electric',
    description: 'Wiring, outlets, fixtures',
    icon: 'zap',
    estimatedWait: '25 Minutes',
    color: '#D97642',
  },
  {
    id: 'service-4',
    type: 'carpentry',
    name: 'Carpentry',
    description: 'Repairs, installations, custom work',
    icon: 'hammer',
    estimatedWait: '35 Minutes',
    color: '#E85D3F',
  },
  {
    id: 'service-5',
    type: 'landscaping',
    name: 'Landscaping',
    description: 'Lawn care, tree trimming, garden work',
    icon: 'tree',
    estimatedWait: '40 Minutes',
    color: '#4CAF50',
  },
  {
    id: 'service-6',
    type: 'painting',
    name: 'Painting',
    description: 'Interior & exterior painting',
    icon: 'paintbrush',
    estimatedWait: '30 Minutes',
    color: '#9C27B0',
  },
  {
    id: 'service-7',
    type: 'walling',
    name: 'Walling',
    description: 'Masonry, brickwork, stone work',
    icon: 'square',
    estimatedWait: '45 Minutes',
    color: '#DC2626',
  },
];

export const mockLocations: Location[] = [
  {
    id: 'location-1',
    type: 'kitchen',
    name: 'Kitchen',
    description: 'Appliances, Plumbing, Electrical',
    icon: 'chef-hat',
    color: '#EC4899',
  },
  {
    id: 'location-2',
    type: 'bathroom',
    name: 'Bathroom',
    description: 'Plumbing, Fixtures, Ventilation',
    icon: 'droplet',
    color: '#3B82F6',
  },
  {
    id: 'location-3',
    type: 'bedroom',
    name: 'Bedroom',
    description: 'Electrical, HVAC, Carpentry',
    icon: 'bed',
    color: '#8B5CF6',
  },
  {
    id: 'location-4',
    type: 'living_room',
    name: 'Living Room',
    description: 'Electrical, HVAC, Flooring',
    icon: 'sofa',
    color: '#14B8A6',
  },
  {
    id: 'location-5',
    type: 'outdoor',
    name: 'Outdoor',
    description: 'Landscaping, Electrical, Structural',
    icon: 'tree',
    color: '#10B981',
  },
  {
    id: 'location-6',
    type: 'basement',
    name: 'Basement',
    description: 'Plumbing, Electrical, Waterproofing',
    icon: 'archive',
    color: '#6B7280',
  },
  {
    id: 'location-7',
    type: 'garage',
    name: 'Garage',
    description: 'Doors, Electrical, Organization',
    icon: 'car',
    color: '#F59E0B',
  },
];

export const getServiceById = (id: string): Service | undefined => {
  return mockServices.find(service => service.id === id);
};

export const getServiceByType = (type: string): Service | undefined => {
  return mockServices.find(service => service.type === type);
};

export const getLocationById = (id: string): Location | undefined => {
  return mockLocations.find(location => location.id === id);
};

export const getLocationByType = (type: string): Location | undefined => {
  return mockLocations.find(location => location.type === type);
};
