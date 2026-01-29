/**
 * useUserSync Hook
 * 
 * Handles syncing Clerk authenticated users with Supabase database
 * ✅ FIXED: Now properly authenticates Supabase with Clerk JWT
 * ✅ FIXED: Idempotent - only syncs once per user
 * ✅ FIXED: Separate loading states
 */

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { createAuthedSupabaseClient, SupabaseClientAuthed, SupabaseUser, UpdateUserData } from '../config/supabase';

export interface UserSyncResult {
  supabaseUser: SupabaseUser | null;
  isSyncing: boolean;
  error: string | null;
  syncUser: (role: 'client' | 'worker') => Promise<SupabaseUser | null>;
  updateUser: (updates: UpdateUserData) => Promise<void>;
}

export const useUserSync = (): UserSyncResult => {
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false);
  const [authedClient, setAuthedClient] = useState<SupabaseClientAuthed | null>(null);

  /**
   * 🔥 CRITICAL: Create an authed Supabase client using the Clerk JWT as Bearer token.
   * We intentionally DO NOT call `supabase.auth.setSession()` here because Clerk tokens
   * are not Supabase Auth sessions.
   */
  const authenticateSupabase = async (): Promise<boolean> => {
    try {
      console.log('🔐 Getting Clerk JWT token...');

      let token: string | null | undefined;
      try {
        token = await getToken({ template: 'supabase' });
      } catch (e) {
        console.warn('⚠️ Standard supabase template failed, trying default...', e);
      }

      if (!token) {
        console.log('⚠️ No supabase template token, trying default...');
        token = await getToken();
      }

      if (!token) {
        console.error('❌ No Clerk token received');
        return false;
      }

      console.log('✅ Clerk token received');
      console.log('🔐 Creating authed Supabase client with Bearer token...');

      setAuthedClient(createAuthedSupabaseClient(token));
      return true;
    } catch (err) {
      console.error('❌ Failed to authenticate Supabase:', err);
      return false;
    }
  };

  /**
   * Sync user to Supabase (create or fetch)
   * ✅ Now idempotent - safe to call multiple times
   * ✅ Authenticates Supabase first
   */
  const syncUser = async (role: 'client' | 'worker'): Promise<SupabaseUser | null> => {
    console.log('🔹 syncUser() called with role:', role);
    
    // Guard: Already synced
    if (supabaseUser) {
      console.log('ℹ️ User already synced, returning existing user');
      return supabaseUser;
    }

    // Guard: Already attempting sync
    if (isSyncing) {
      console.log('⚠️ Sync already in progress, skipping');
      return null;
    }

    // Guard: No Clerk user
    if (!clerkUser) {
      console.error('❌ No Clerk user found in syncUser');
      setError('No Clerk user found');
      return null;
    }

    setIsSyncing(true);
    setHasAttemptedSync(true);
    setError(null);

    try {
      // 🔥 STEP 1: Authenticate Supabase with Clerk JWT
      const authenticated = await authenticateSupabase();
      if (!authenticated) {
        throw new Error(
          "Supabase auth bridge failed (no Clerk JWT available). Ensure Clerk has a 'supabase' JWT template."
        );
      }

      const sb = authedClient ?? createAuthedSupabaseClient((await getToken({ template: 'supabase' })) || (await getToken()) || '');

      console.log('🔹 Clerk user ID:', clerkUser.id);
      console.log('🔹 Clerk user email:', clerkUser.primaryEmailAddress?.emailAddress);
      console.log('🔹 Checking if user exists in Supabase...');

      // STEP 2: Use RPC function for idempotent sync
      console.log('📝 Syncing user via RPC...');
      
      const { data: syncedUser, error: rpcError } = await sb.rpc('sync_user_profile', {
          p_clerk_id: clerkUser.id,
          p_email: clerkUser.primaryEmailAddress?.emailAddress || '',
          p_role: role,
          p_first_name: clerkUser.firstName || null,
          p_last_name: clerkUser.lastName || null,
      });

      if (rpcError) {
        // PGRST202 == function not found in schema cache
        if ((rpcError as any).code === 'PGRST202') {
          console.error(
            '❌ RPC sync failed: sync_user_profile not found. ' +
              'This indicates the database migration/schema.sql has not been applied to your Supabase project (or PostgREST schema cache is stale).',
            rpcError
          );
        } else {
          console.error('❌ RPC sync failed:', rpcError);
        }
        // Continue to fallback logic
      } else if (syncedUser) {
          console.log('✅ User synced via RPC:', (syncedUser as any).id);
          setSupabaseUser(syncedUser as SupabaseUser);
          return syncedUser as SupabaseUser;
      }

      // ... existing fallback code (Check if user exists) ...
      const { data: existingUser, error: fetchError } = await sb
        .from('users')
        .select('*')
        .eq('clerk_user_id', clerkUser.id)
        .single();

      console.log('🔹 Supabase query completed');
      
      if (fetchError) {
        console.log('🔹 Fetch error code:', fetchError.code);
        console.log('🔹 Fetch error message:', fetchError.message);
      }

      // PGRST116 = no rows returned (expected for new users)
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Unexpected error fetching user:', fetchError);
        console.error('❌ Details:', fetchError.details);
        console.error('❌ Hint:', fetchError.hint);
        throw fetchError;
      }

      // User exists - return it
      if (existingUser) {
        console.log('✅ User already exists in Supabase:', existingUser.id);
        setSupabaseUser(existingUser);
        return existingUser;
      }

      // STEP 3: Create new user
      console.log('📝 User not found, creating new user in Supabase...');
      
      const newUser = {
        clerk_user_id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        first_name: clerkUser.firstName || null,
        last_name: clerkUser.lastName || null,
        role,
        phone: null,
      };

      console.log('📝 New user data:', JSON.stringify(newUser, null, 2));

      const { data: createdUser, error: createError } = await sb
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user:', createError);
        console.error('❌ Message:', createError.message);
        console.error('❌ Details:', createError.details);
        console.error('❌ Hint:', createError.hint);
        console.error('❌ Code:', createError.code);
        throw createError;
      }

      if (!createdUser) {
        throw new Error('No user data returned after insert');
      }

      console.log('✅ User created in Supabase:', createdUser.id);
      setSupabaseUser(createdUser);
      return createdUser;

    } catch (err: any) {
      console.error('❌ User sync error:', err);
      console.error('❌ Error type:', typeof err);
      console.error('❌ Error message:', err.message);
      
      if (err.details) console.error('❌ Error details:', err.details);
      if (err.hint) console.error('❌ Error hint:', err.hint);
      
      setError(err.message || 'Failed to sync user');
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Update user in Supabase
   * Used for progressive onboarding (adding phone, etc.)
   */
  const updateUser = async (updates: UpdateUserData): Promise<void> => {
    if (!supabaseUser) {
      throw new Error('No Supabase user to update');
    }

    try {
      setError(null);

      // Ensure we have an authed client
      const authenticated = await authenticateSupabase();
      if (!authenticated) {
        throw new Error("Supabase auth bridge failed (no Clerk JWT available). Ensure Clerk has a 'supabase' JWT template.");
      }

      if (!authedClient) {
        throw new Error('Missing authed Supabase client');
      }

      console.log('🔄 Updating user in Supabase:', supabaseUser.id);

      const { data, error: updateError } = await authedClient
        .from('users')
        .update(updates)
        .eq('id', supabaseUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating user:', updateError);
        throw updateError;
      }

      console.log('✅ User updated in Supabase');
      setSupabaseUser(data);
    } catch (err: any) {
      console.error('❌ User update error:', err);
      setError(err.message || 'Failed to update user');
      throw err;
    }
  };

  /**
   * ⚠️ NO AUTO-FETCH on mount
   * This prevents race conditions and duplicate syncs
   * Users are only synced when explicitly called via syncUser()
   */

  return {
    supabaseUser,
    isSyncing,
    error,
    syncUser,
    updateUser,
  };
};
