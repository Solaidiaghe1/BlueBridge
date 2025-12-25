/**
 * BlueBridge Mobile App
 * 
 * A marketplace connecting clients with blue-collar service workers
 * This is the MVP frontend-only implementation
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/shared/theme';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <RootNavigator />
    </>
  );
}
