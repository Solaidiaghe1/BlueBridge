/**
 * UserSyncContext
 *
 * Provides a **shared** `supabaseUser` state across the entire app.
 * Unlike calling `useUserSync()` in every component (which creates
 * separate hook instances with separate state), wrapping the app in
 * `<UserSyncProvider>` ensures a single source of truth.
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import {
  createAuthedSupabaseClient,
  SupabaseClientAuthed,
  SupabaseUser,
  SupabaseWorker,
  UpdateUserData,
  WorkerOnboardingData,
  WorkerOnboardingResult,
  WorkerAvailableRequest,
} from '../config/supabase';
import { completeWorkerOnboarding, getWorkerByClerkId, getAvailableRequestsForWorker } from '../services/workerService';

export interface UserSyncContextValue {
  supabaseUser: SupabaseUser | null;
  isSyncing: boolean;
  error: string | null;
  syncUser: (role: 'client' | 'worker') => Promise<SupabaseUser | null>;
  updateUser: (updates: UpdateUserData) => Promise<void>;
  clearUser: () => void;
  syncWorkerOnboarding: (onboardingData: WorkerOnboardingData) => Promise<WorkerOnboardingResult | null>;
  checkWorkerOnboardingComplete: () => Promise<SupabaseWorker | null>;
  fetchAvailableRequests: () => Promise<WorkerAvailableRequest[]>;
}

const UserSyncContext = createContext<UserSyncContextValue | null>(null);

export const UserSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authedClientRef = useRef<SupabaseClientAuthed | null>(null);

  // Clear supabaseUser when Clerk user signs out
  useEffect(() => {
    if (isLoaded && !clerkUser) {
      console.log('[UserSyncContext] Clerk user signed out, clearing supabaseUser');
      setSupabaseUser(null);
      setError(null);
      authedClientRef.current = null;
    }
  }, [isLoaded, clerkUser]);

  // Function to manually clear user state (called on sign out)
  const clearUser = useCallback(() => {
    console.log('[UserSyncContext] clearUser() called');
    setSupabaseUser(null);
    setError(null);
    setIsSyncing(false);
    authedClientRef.current = null;
  }, []);

  const authenticateSupabase = useCallback(async (): Promise<SupabaseClientAuthed | null> => {
    try {
      let token: string | null | undefined;
      try {
        token = await getToken({ template: 'supabase' });
      } catch {
        token = await getToken();
      }
      if (!token) return null;
      const client = createAuthedSupabaseClient(token);
      authedClientRef.current = client;
      return client;
    } catch {
      return null;
    }
  }, [getToken]);

  const syncUser = useCallback(
    async (role: 'client' | 'worker'): Promise<SupabaseUser | null> => {
      console.log('[UserSyncContext] syncUser() called, role=', role);

      if (supabaseUser) {
        console.log('[UserSyncContext] already have supabaseUser, returning');
        return supabaseUser;
      }
      if (isSyncing) {
        console.log('[UserSyncContext] sync in progress, skipping');
        return null;
      }
      if (!clerkUser) {
        console.error('[UserSyncContext] no clerkUser');
        setError('No Clerk user found');
        return null;
      }

      setIsSyncing(true);
      setError(null);

      try {
        const sb = await authenticateSupabase();
        if (!sb) throw new Error('Could not authenticate Supabase');

        // Try RPC first
        const { data: syncedUser, error: rpcError } = await sb.rpc('sync_user_profile', {
          p_clerk_id: clerkUser.id,
          p_email: clerkUser.primaryEmailAddress?.emailAddress || '',
          p_role: role,
          p_first_name: clerkUser.firstName || null,
          p_last_name: clerkUser.lastName || null,
        });

        if (!rpcError && syncedUser) {
          console.log('[UserSyncContext] synced via RPC:', (syncedUser as any).id);
          setSupabaseUser(syncedUser as SupabaseUser);
          return syncedUser as SupabaseUser;
        }

        if (rpcError) {
          console.warn('[UserSyncContext] RPC sync_user_profile failed:', rpcError.message);
        }

        // Fallback: check if user exists
        const { data: existing, error: fetchErr } = await sb
          .from('users')
          .select('*')
          .eq('clerk_user_id', clerkUser.id)
          .single();

        if (existing && !fetchErr) {
          console.log('[UserSyncContext] found existing user:', existing.id);
          setSupabaseUser(existing);
          return existing;
        }

        // Create new user
        const newUser = {
          clerk_user_id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          first_name: clerkUser.firstName || null,
          last_name: clerkUser.lastName || null,
          role,
          phone: null,
        };

        const { data: createdUser, error: createError } = await sb
          .from('users')
          .insert([newUser])
          .select()
          .single();

        if (createError) throw createError;
        if (!createdUser) throw new Error('No user data returned after insert');

        console.log('[UserSyncContext] created new user:', createdUser.id);
        setSupabaseUser(createdUser);
        return createdUser;
      } catch (err: any) {
        console.error('[UserSyncContext] syncUser error:', err);
        setError(err.message || 'Failed to sync user');
        return null;
      } finally {
        setIsSyncing(false);
      }
    },
    [clerkUser, isSyncing, supabaseUser, authenticateSupabase]
  );

  const updateUser = useCallback(
    async (updates: UpdateUserData): Promise<void> => {
      if (!supabaseUser) throw new Error('No Supabase user to update');

      setError(null);
      const sb = await authenticateSupabase();
      if (!sb) throw new Error('Could not authenticate Supabase');

      const { data, error: updateError } = await sb
        .from('users')
        .update(updates)
        .eq('id', supabaseUser.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setSupabaseUser(data);
    },
    [supabaseUser, authenticateSupabase]
  );

  const syncWorkerOnboarding = useCallback(
    async (onboardingData: WorkerOnboardingData): Promise<WorkerOnboardingResult | null> => {
      console.log('[UserSyncContext] syncWorkerOnboarding() called');

      if (!clerkUser) {
        console.error('[UserSyncContext] no clerkUser for worker onboarding');
        setError('No Clerk user found');
        return null;
      }

      if (!supabaseUser) {
        console.error('[UserSyncContext] no supabaseUser for worker onboarding');
        setError('User must be synced before worker onboarding');
        return null;
      }

      setIsSyncing(true);
      setError(null);

      try {
        const sb = await authenticateSupabase();
        if (!sb) throw new Error('Could not authenticate Supabase');

        const result = await completeWorkerOnboarding(
          sb,
          supabaseUser.id,
          clerkUser.id,
          onboardingData
        );

        console.log('[UserSyncContext] Worker onboarding complete:', result);
        return result;
      } catch (err: any) {
        console.error('[UserSyncContext] syncWorkerOnboarding error:', err);
        setError(err.message || 'Failed to complete worker onboarding');
        return null;
      } finally {
        setIsSyncing(false);
      }
    },
    [clerkUser, supabaseUser, authenticateSupabase]
  );

  const checkWorkerOnboardingComplete = useCallback(
    async (): Promise<SupabaseWorker | null> => {
      console.log('[UserSyncContext] checkWorkerOnboardingComplete() called');

      if (!clerkUser) {
        console.log('[UserSyncContext] No clerkUser, cannot check worker onboarding');
        return null;
      }

      try {
        const sb = await authenticateSupabase();
        if (!sb) {
          console.error('[UserSyncContext] Could not authenticate Supabase');
          return null;
        }

        const worker = await getWorkerByClerkId(sb, clerkUser.id);
        
        if (worker) {
          console.log('[UserSyncContext] Found existing worker profile:', worker.id);
        } else {
          console.log('[UserSyncContext] No worker profile found, onboarding needed');
        }

        return worker;
      } catch (err: any) {
        console.error('[UserSyncContext] checkWorkerOnboardingComplete error:', err);
        return null;
      }
    },
    [clerkUser, authenticateSupabase]
  );

  const fetchAvailableRequests = useCallback(
    async (): Promise<WorkerAvailableRequest[]> => {
      console.log('[UserSyncContext] fetchAvailableRequests() called');

      if (!clerkUser) {
        console.warn('[UserSyncContext] No clerkUser, cannot fetch available requests');
        return [];
      }

      try {
        const sb = await authenticateSupabase();
        if (!sb) {
          console.error('[UserSyncContext] Could not authenticate Supabase');
          return [];
        }

        const requests = await getAvailableRequestsForWorker(sb, clerkUser.id);
        return requests || [];
      } catch (err: any) {
        console.error('[UserSyncContext] fetchAvailableRequests error:', err);
        return [];
      }
    },
    [clerkUser, authenticateSupabase]
  );

  const value: UserSyncContextValue = {
    supabaseUser,
    isSyncing,
    error,
    syncUser,
    updateUser,
    clearUser,
    syncWorkerOnboarding,
    checkWorkerOnboardingComplete,
    fetchAvailableRequests,
  };

  return <UserSyncContext.Provider value={value}>{children}</UserSyncContext.Provider>;
};

/**
 * Hook to access the shared UserSync context.
 * Must be used inside a <UserSyncProvider>.
 */
export const useUserSync = (): UserSyncContextValue => {
  const ctx = useContext(UserSyncContext);
  if (!ctx) {
    throw new Error('useUserSync must be used within a <UserSyncProvider>');
  }
  return ctx;
};
