import React, { useState } from 'react';
import { WorkerProfileInfoScreen } from '../screens/WorkerProfileInfoScreen';
import { WorkerServicesScreen } from '../screens/WorkerServicesScreen';
import { WorkerLocationsScreen } from '../screens/WorkerLocationsScreen';

interface WorkerOnboardingData {
  profile?: any;
  services?: string[];
  locations?: string[];
}

interface WorkerOnboardingNavigatorProps {
  onComplete: (data: WorkerOnboardingData) => void;
  onBack: () => void;
}

export const WorkerOnboardingNavigator: React.FC<WorkerOnboardingNavigatorProps> = ({
  onComplete,
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [onboardingData, setOnboardingData] = useState<WorkerOnboardingData>({});

  const handleProfileNext = (profileData: any) => {
    setOnboardingData(prev => ({ ...prev, profile: profileData }));
    setCurrentStep(2);
  };

  const handleServicesNext = (services: string[]) => {
    setOnboardingData(prev => ({ ...prev, services }));
    setCurrentStep(3);
  };

  const handleLocationsComplete = (locations: string[]) => {
    const finalData = { ...onboardingData, locations };
    onComplete(finalData);
  };

  const handleBackFromServices = () => {
    setCurrentStep(1);
  };

  const handleBackFromLocations = () => {
    setCurrentStep(2);
  };

  if (currentStep === 1) {
    return (
      <WorkerProfileInfoScreen
        onNext={handleProfileNext}
        onBack={onBack}
      />
    );
  }

  if (currentStep === 2) {
    return (
      <WorkerServicesScreen
        onNext={handleServicesNext}
        onBack={handleBackFromServices}
      />
    );
  }

  return (
    <WorkerLocationsScreen
      onComplete={handleLocationsComplete}
      onBack={handleBackFromLocations}
    />
  );
};
