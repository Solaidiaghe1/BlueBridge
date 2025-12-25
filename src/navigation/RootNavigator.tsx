import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { RoleSelectorScreen } from './RoleSelectorScreen';
import { ProfileInfoScreen } from '../client/screens/ProfileInfoScreen';
import { ClientNavigator } from '../client/navigation/ClientNavigator';
import { ProfileFormData } from '../types/user';
import { updateUser } from '../services/mockUser';

type AppState = 
  | 'role-selection' 
  | 'profile-info' 
  | 'client-app' 
  | 'worker-app';

export const RootNavigator: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('role-selection');
  const [selectedRole, setSelectedRole] = useState<'client' | 'service' | null>(null);

  const handleClientSelect = () => {
    setSelectedRole('client');
    setAppState('profile-info');
  };

  const handleServiceSelect = () => {
    setSelectedRole('service');
    setAppState('profile-info');
  };

  const handleProfileInfoNext = (data: ProfileFormData) => {
    // Update user profile
    updateUser({
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.month && data.day && data.year 
        ? `${data.year}-${data.month}-${data.day}` 
        : undefined,
      address: data.address,
      apt: data.apt,
      city: data.city,
      state: data.state,
      zip: data.zip,
      userType: selectedRole === 'client' ? 'client' : 'service_provider',
    });

    // Navigate to appropriate app
    if (selectedRole === 'client') {
      setAppState('client-app');
    } else {
      setAppState('worker-app');
    }
  };

  const handleProfileInfoBack = () => {
    setAppState('role-selection');
    setSelectedRole(null);
  };

  const handleSwitchToWorker = () => {
    setAppState('worker-app');
  };

  const handleSwitchToClient = () => {
    setAppState('client-app');
  };

  const renderContent = () => {
    switch (appState) {
      case 'role-selection':
        return (
          <RoleSelectorScreen
            onClientSelect={handleClientSelect}
            onServiceSelect={handleServiceSelect}
          />
        );
      
      case 'profile-info':
        return (
          <ProfileInfoScreen
            onNext={handleProfileInfoNext}
            onBack={handleProfileInfoBack}
          />
        );
      
      case 'client-app':
        return <ClientNavigator onSwitchToWorker={handleSwitchToWorker} />;
      
      case 'worker-app':
        // Worker app will be implemented next
        return (
          <View style={styles.placeholderContainer}>
            {/* TODO: Implement WorkerNavigator */}
            <ClientNavigator onSwitchToWorker={handleSwitchToClient} />
          </View>
        );
      
      default:
        return (
          <RoleSelectorScreen
            onClientSelect={handleClientSelect}
            onServiceSelect={handleServiceSelect}
          />
        );
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
  },
});
