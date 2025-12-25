import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { LocationSelectionScreen } from '../screens/LocationSelectionScreen';
import { CreateRequestScreen } from '../screens/CreateRequestScreen';
import { RequestsListScreen } from '../screens/RequestsListScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { ClientTabs } from './ClientTabs';
import { RequestFormData } from '../../types/request';
import { createRequest } from '../../services/mockRequests';
import { toggleUserType } from '../../services/mockUser';

type Screen = 
  | 'home' 
  | 'location' 
  | 'create-request' 
  | 'requests' 
  | 'account' 
  | 'support';

type TabName = 'Services' | 'Request' | 'Account' | 'Support';

interface ClientNavigatorProps {
  onSwitchToWorker: () => void;
}

export const ClientNavigator: React.FC<ClientNavigatorProps> = ({ onSwitchToWorker }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentTab, setCurrentTab] = useState<TabName>('Services');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const handleServiceSelect = (serviceType: string) => {
    setSelectedService(serviceType);
    setCurrentScreen('location');
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setCurrentScreen('create-request');
  };

  const handleSkipLocation = () => {
    setSelectedLocation('');
    setCurrentScreen('create-request');
  };

  const handleRequestSubmit = (data: RequestFormData) => {
    // Create the request using mock service
    createRequest({
      ...data,
      serviceType: selectedService,
      location: selectedLocation,
    });
    
    // Navigate to requests tab
    setCurrentTab('Request');
    setCurrentScreen('requests');
    
    // Reset selection
    setSelectedService('');
    setSelectedLocation('');
  };

  const handleRequestBack = () => {
    if (selectedLocation) {
      setCurrentScreen('location');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleLocationBack = () => {
    setCurrentScreen('home');
    setSelectedService('');
  };

  const handleTabChange = (tab: TabName) => {
    setCurrentTab(tab);
    
    switch (tab) {
      case 'Services':
        setCurrentScreen('home');
        break;
      case 'Request':
        setCurrentScreen('requests');
        break;
      case 'Account':
        setCurrentScreen('account');
        break;
      case 'Support':
        setCurrentScreen('support');
        break;
    }
  };

  const handleToggleServiceProvider = () => {
    toggleUserType();
    onSwitchToWorker();
  };

  const handleRequestPress = (requestId: string) => {
    // In a real app, this would navigate to request detail screen
    console.log('View request:', requestId);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onServiceSelect={handleServiceSelect} />;
      
      case 'location':
        return (
          <LocationSelectionScreen
            serviceType={selectedService}
            onLocationSelect={handleLocationSelect}
            onSkip={handleSkipLocation}
          />
        );
      
      case 'create-request':
        return (
          <CreateRequestScreen
            serviceType={selectedService}
            location={selectedLocation}
            onSubmit={handleRequestSubmit}
            onBack={handleRequestBack}
          />
        );
      
      case 'requests':
        return <RequestsListScreen onRequestPress={handleRequestPress} />;
      
      case 'account':
        return (
          <AccountScreen
            onToggleServiceProvider={handleToggleServiceProvider}
            isServiceProvider={false}
          />
        );
      
      case 'support':
        return <SupportScreen />;
      
      default:
        return <HomeScreen onServiceSelect={handleServiceSelect} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>
      {/* Only show tabs on main screens, not during request flow */}
      {!['location', 'create-request'].includes(currentScreen) && (
        <ClientTabs currentTab={currentTab} onTabChange={handleTabChange} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
