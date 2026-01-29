import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { RoleSelectorScreen } from './RoleSelectorScreen';
import { ClientNavigator } from '../client/navigation/ClientNavigator';
import { WorkerOnboardingNavigator } from '../worker/navigation/WorkerOnboardingNavigator';
import { WorkerNavigator } from '../worker/navigation/WorkerNavigator';
import { updateUser } from '../services/mockUser';
import { useUserSync } from '../context/UserSyncContext';
import { WorkerOnboardingData } from '../config/supabase';
import { colors } from '../shared/theme';

type AppState = 
  | 'role-selection' 
  | 'checking-worker'
  | 'worker-onboarding'
  | 'client-app' 
  | 'worker-app';

export const RootNavigator: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('role-selection');
  const [selectedRole, setSelectedRole] = useState<'client' | 'service' | null>(null);
  const { syncWorkerOnboarding, supabaseUser, checkWorkerOnboardingComplete } = useUserSync();

  const handleClientSelect = () => {
    setSelectedRole('client');
    // Skip profile info screen - go directly to client app
    setAppState('client-app');
  };

  const handleServiceSelect = async () => {
    setSelectedRole('service');
    
    // Check if worker has already completed onboarding
    setAppState('checking-worker');
    
    try {
      const existingWorker = await checkWorkerOnboardingComplete();
      
      if (existingWorker) {
        // Worker has already completed onboarding, skip to worker app
        console.log('[RootNavigator] Worker already onboarded, skipping to worker app');
        setAppState('worker-app');
      } else {
        // New worker, needs to complete onboarding
        console.log('[RootNavigator] New worker, starting onboarding');
        setAppState('worker-onboarding');
      }
    } catch (error) {
      console.error('[RootNavigator] Error checking worker status:', error);
      // On error, default to onboarding flow
      setAppState('worker-onboarding');
    }
  };

  const handleWorkerOnboardingComplete = async (data: any) => {
    // Update local mock user profile with worker data (for backward compatibility)
    updateUser({
      firstName: data.profile.firstName,
      lastName: data.profile.lastName,
      dateOfBirth: data.profile.month && data.profile.day && data.profile.year 
        ? `${data.profile.year}-${data.profile.month}-${data.profile.day}` 
        : undefined,
      address: data.profile.streetAddress,
      apt: data.profile.apt,
      city: data.profile.city,
      state: data.profile.state,
      zip: data.profile.zipCode,
      userType: 'service_provider',
    });

    // Sync worker data to Supabase (workers, worker_services, worker_work_areas tables)
    try {
      const onboardingData: WorkerOnboardingData = {
        profile: data.profile,
        services: data.services || [],
        locations: data.locations || [],
      };

      console.log('[RootNavigator] Syncing worker onboarding to Supabase:', onboardingData);
      
      const result = await syncWorkerOnboarding(onboardingData);
      
      if (result) {
        console.log('[RootNavigator] Worker onboarding synced successfully:', {
          workerId: result.worker.id,
          servicesCount: result.services?.length || 0,
          workAreasCount: result.work_areas?.length || 0,
        });
      } else {
        console.warn('[RootNavigator] Worker onboarding sync returned null');
        // Still proceed to worker app - data might sync later
      }
    } catch (error: any) {
      console.error('[RootNavigator] Failed to sync worker onboarding:', error);
      Alert.alert(
        'Sync Warning',
        'Your profile was created but some data may not have synced. Please try again later.',
        [{ text: 'OK' }]
      );
    }

    setAppState('worker-app');
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

  const handleSignOut = () => {
    // Reset to role selection screen after sign out
    setSelectedRole(null);
    setAppState('role-selection');
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
      
      case 'checking-worker':
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        );
      
      case 'worker-onboarding':
        return (
          <WorkerOnboardingNavigator
            onComplete={handleWorkerOnboardingComplete}
            onBack={handleProfileInfoBack}
          />
        );
      
      case 'client-app':
        return <ClientNavigator onSwitchToWorker={handleSwitchToWorker} onSignOut={handleSignOut} />;
      
      case 'worker-app':
        return <WorkerNavigator onSwitchToClient={handleSwitchToClient} onSignOut={handleSignOut} />;
      
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderContainer: {
    flex: 1,
  },
});
