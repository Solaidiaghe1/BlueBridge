import React from 'react';
import { MultiStepRequestForm } from '../components/MultiStepRequestForm';

interface CreateRequestScreenProps {
  serviceType: string;
  location?: string;
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export const CreateRequestScreen: React.FC<CreateRequestScreenProps> = ({
  serviceType,
  location,
  onSubmit,
  onBack,
}) => {
  return (
    <MultiStepRequestForm
      visible={true}
      onClose={onBack}
      serviceType={serviceType}
      onSubmit={onSubmit}
    />
  );
};
