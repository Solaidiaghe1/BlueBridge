import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { LocationSelectionScreen } from '../screens/LocationSelectionScreen';
import { CreateRequestScreen } from '../screens/CreateRequestScreen';
import { RequestsListScreen } from '../screens/RequestsListScreen';
import { EditRequestScreen } from '../screens/EditRequestScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { ClientTabs } from './ClientTabs';
import { RequestFormData, Request } from '../../types/request';
// (mockRequests import removed; requests are persisted in Supabase)
import { toggleUserType } from '../../services/mockUser';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { createAuthedSupabaseClient } from '../../config/supabase';

type Screen = 
  | 'home' 
  | 'location' 
  | 'create-request' 
  | 'edit-request'
  | 'requests' 
  | 'account' 
  | 'support'
  | 'privacy-policy';

type TabName = 'Services' | 'Requests' | 'Account' | 'Support';

interface ClientNavigatorProps {
  onSwitchToWorker: () => void;
  onSignOut?: () => void;
}

export const ClientNavigator: React.FC<ClientNavigatorProps> = ({ onSwitchToWorker, onSignOut }) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentTab, setCurrentTab] = useState<TabName>('Services');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);

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

  const handleRequestSubmit = async (data: any) => {
    // `MultiStepRequestForm` submits its internal FormData shape (not RequestFormData).
    // Keep this handler tolerant and map what we need.
    const clerkUserId = user?.id;

    try {
      const token = await getToken({ template: 'supabase' });
      if (!token || !clerkUserId) throw new Error('Missing auth token or Clerk user');
      const supabase = createAuthedSupabaseClient(token);

      // 1) Get Supabase user row for FK usage (addresses.user_id / requests.client_id)
      const { data: supaUser, error: userErr } = await supabase
        .from('users')
        .select('id, clerk_user_id')
        .eq('clerk_user_id', clerkUserId)
        .single();
      if (userErr) throw userErr;

      // 2) Look up service_id and work_area_id from the database
      let serviceId: string | null = null;
      let workAreaId: string | null = null;

      if (selectedService) {
        const { data: serviceData } = await supabase
          .from('services')
          .select('id')
          .eq('type', selectedService)
          .single();
        serviceId = serviceData?.id || null;
      }

      if (selectedLocation) {
        const { data: workAreaData } = await supabase
          .from('work_areas')
          .select('id')
          .eq('type', selectedLocation)
          .single();
        workAreaId = workAreaData?.id || null;
      }

      // 3) If user opted to save the address, reuse duplicate or insert new
      let savedAddressId: string | null = data?.selectedSavedAddressId ?? null;

      const shouldSaveAddress = !!data?.saveAddress && !data?.useSavedAddress;
      if (shouldSaveAddress) {
        const label = String(data?.locationType ?? '').trim();
        if (!label) throw new Error('Location type is required to label a saved address');

        const street = String(data?.streetAddress ?? '').trim();
        const zip = String(data?.zipCode ?? '').trim();

        const { data: dup, error: dupErr } = await supabase
          .from('addresses')
          .select('id')
          .eq('user_clerk_id', clerkUserId)
          .eq('street_address', street)
          .eq('zip_code', zip)
          .maybeSingle();
        if (dupErr) throw dupErr;

        if (dup?.id) {
          savedAddressId = dup.id;
        } else {
          const { data: inserted, error: insErr } = await supabase
            .from('addresses')
            .insert([
              {
                user_id: supaUser.id,
                user_clerk_id: clerkUserId,
                label,
                street_address: street,
                apt_suite_unit: String(data?.apt ?? '').trim() || null,
                city: String(data?.city ?? '').trim(),
                state: String(data?.state ?? '').trim(),
                zip_code: zip,
                is_default: false,
              },
            ])
            .select('id')
            .single();
          if (insErr) throw insErr;
          savedAddressId = inserted.id;
        }
      }

      // 4) Insert request snapshot (and optional address_id)
      // Note: this requires a `requests` table in Supabase. If it doesn't exist yet,
      // we fall back to mock behavior below.

      const scheduledDatesObj = (data?.scheduledDates ?? {}) as Record<string, string[]>;
      const availableDates = Object.keys(scheduledDatesObj);

      const SLOT_TO_RANGE: Record<string, string> = {
        morning: '8:00-12:00',
        afternoon: '12:00-16:00',
        evening: '16:00-20:00',
      };

      const timeWindows = Object.fromEntries(
        Object.entries(scheduledDatesObj).map(([date, slots]) => [
          date,
          (slots ?? [])
            .map((s) => SLOT_TO_RANGE[String(s)] ?? String(s))
            .filter(Boolean),
        ])
      );

      const requestPayload = {
        client_id: supaUser.id,
        client_clerk_id: clerkUserId,
        worker_id: null,
        worker_clerk_id: null,
        service_id: serviceId,
        work_area_id: workAreaId,
        service_type: selectedService || null,
        location: selectedLocation || null,
        title: String(data?.title ?? ''),
        description: String(data?.description ?? ''),

        // Media: in the future these should be public URLs after Storage upload.
        photos: (data?.photos ?? []) as string[],
        videos: ((data?.videos ?? []) as any[]).map((v) => (typeof v === 'string' ? v : v?.uri)).filter(Boolean),

        // Address snapshot
        street_address: String(data?.streetAddress ?? ''),
        apt_suite_unit: String(data?.apt ?? '').trim() || null,
        city: String(data?.city ?? ''),
        state: String(data?.state ?? ''),
        zip_code: String(data?.zipCode ?? ''),
        location_type: String(data?.locationType ?? '') || null,

        // Optional saved-address linkage
        address_id: savedAddressId,

        // Availability
        available_dates: availableDates,
        time_windows: timeWindows,

        // Notes
        pets_on_site: !!data?.petsOnSite,
        parking_notes: String(data?.parkingNotes ?? '').trim() || null,

        status: 'searching_for_worker',
        is_open: true,
      };

      const { error: reqErr } = await supabase.from('requests').insert([requestPayload]);
      if (reqErr) throw reqErr;
    } catch (e) {
      console.warn('Supabase request submit failed:', e);
      Alert.alert(
        'Could not submit request',
        'Please try again in a moment. If the problem continues, contact support.'
      );
      return;
    }

    // Navigate to requests tab
    setCurrentTab('Requests');
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
      case 'Requests':
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

  const handleRequestPress = async (requestId: string) => {
    // Fetch the full request data and navigate to edit screen
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('Missing auth token');
      
      const supabase = createAuthedSupabaseClient(token);
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Request not found');
      
      setEditingRequest(data as Request);
      setCurrentScreen('edit-request');
    } catch (e: any) {
      console.error('Failed to load request for editing:', e);
      Alert.alert('Error', 'Could not load request details. Please try again.');
    }
  };

  const handleEditRequestBack = () => {
    setEditingRequest(null);
    setCurrentScreen('requests');
  };

  const handleEditRequestSaveSuccess = () => {
    setEditingRequest(null);
    setCurrentScreen('requests');
  };

  const handlePrivacyPress = () => {
    setCurrentScreen('privacy-policy');
  };

  const handlePrivacyBack = () => {
    setCurrentScreen('account');
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
            onBack={handleLocationBack}
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
      
      case 'edit-request':
        return editingRequest ? (
          <EditRequestScreen
            request={editingRequest}
            onBack={handleEditRequestBack}
            onSaveSuccess={handleEditRequestSaveSuccess}
          />
        ) : null;
      
      case 'requests':
        return (
          <RequestsListScreen
            onRequestPress={handleRequestPress}
            isActive={currentTab === 'Requests'}
          />
        );
      
      case 'account':
        return (
          <AccountScreen
            onToggleServiceProvider={handleToggleServiceProvider}
            onPrivacyPress={handlePrivacyPress}
            onSignOut={onSignOut}
          />
        );
      
      case 'privacy-policy':
        return <PrivacyPolicyScreen onBack={handlePrivacyBack} />;
      
      case 'support':
        return <SupportScreen />;
      
      default:
        return <HomeScreen onServiceSelect={handleServiceSelect} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>
      {/* Only show tabs on main screens, not during request flow or privacy policy */}
      {!['location', 'create-request', 'edit-request', 'privacy-policy'].includes(currentScreen) && (
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
