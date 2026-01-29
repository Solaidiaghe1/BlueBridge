import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WorkerTabs } from './WorkerTabs';
import { WorkerSearchScreen } from '../screens/WorkerSearchScreen';
import { WorkerRequestsScreen } from '../screens/WorkerRequestsScreen';
import { WorkerAccountScreen } from '../screens/WorkerAccountScreen';
import { WorkerSupportScreen } from '../screens/WorkerSupportScreen';

type TabName = 'Search' | 'Request' | 'Account' | 'Support';

interface WorkerNavigatorProps {
  onSwitchToClient?: () => void;
  onSignOut?: () => void;
}

export const WorkerNavigator: React.FC<WorkerNavigatorProps> = ({ onSwitchToClient, onSignOut }) => {
  const [currentTab, setCurrentTab] = useState<TabName>('Search');

  const renderScreen = () => {
    switch (currentTab) {
      case 'Search':
        return <WorkerSearchScreen />;
      case 'Request':
        return <WorkerRequestsScreen />;
      case 'Account':
        return <WorkerAccountScreen onSwitchToClient={onSwitchToClient} onSignOut={onSignOut} />;
      case 'Support':
        return <WorkerSupportScreen />;
      default:
        return <WorkerSearchScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <WorkerTabs currentTab={currentTab} onTabChange={setCurrentTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
