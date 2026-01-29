/**
 * BlueBridge Mobile App
 * 
 * A marketplace connecting clients with blue-collar service workers
 * This is the MVP frontend-only implementation with Clerk authentication
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/shared/theme';
import { UserSyncProvider } from './src/context/UserSyncContext';

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Get Clerk publishable key from environment variable
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

if (!publishableKey) {
  throw new Error(
    'Missing Clerk Publishable Key. Please add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file'
  );
}

export default function App() {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <UserSyncProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <RootNavigator />
      </UserSyncProvider>
    </ClerkProvider>
  );
}
