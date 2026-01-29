import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius, typography, shadows } from '../../shared/theme';
import { Header } from '../../shared/components/Header';
import { Card } from '../../shared/components/Card';
import { createAuthedSupabaseClient, SupabaseUser } from '../../config/supabase';

interface AccountScreenProps {
  onToggleServiceProvider: () => void;
  onPrivacyPress?: () => void;
  onSignOut?: () => void;
}

const formatMemberSince = (createdAtIso?: string | null) => {
  if (!createdAtIso) return '';
  const d = new Date(createdAtIso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

export const AccountScreen: React.FC<AccountScreenProps> = ({
  onToggleServiceProvider,
  onPrivacyPress,
  onSignOut,
}) => {
  const { signOut, getToken, isSignedIn } = useAuth();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  const [profile, setProfile] = useState<SupabaseUser | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [lastLoadedClerkId, setLastLoadedClerkId] = useState<string | null>(null);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            // Navigate back to role selection screen
            if (onSignOut) {
              onSignOut();
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  const clerkEmail = useMemo(() => {
    return clerkUser?.primaryEmailAddress?.emailAddress ?? '';
  }, [clerkUser?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const clerkId = clerkUser?.id;
      if (!clerkLoaded || !isSignedIn || !clerkId) return;

      // Avoid refetch loops / flicker if we already loaded this user.
      if (lastLoadedClerkId === clerkId) return;

      if (isMounted) {
        setIsLoadingProfile(true);
        setProfileError(null);
      }

      try {
        // Get a Clerk token. Prefer the 'supabase' template if available.
        let token: string | null | undefined;
        try {
          token = await getToken({ template: 'supabase' });
        } catch {
          token = null;
        }
        if (!token) token = await getToken();
        if (!token) throw new Error('Missing auth token');

        const sb = createAuthedSupabaseClient(token);

        const { data, error } = await sb
          .from('users')
          .select('*')
          .eq('clerk_user_id', clerkId)
          .maybeSingle();

        if (error) throw error;

        if (!isMounted) return;
        setProfile((data as SupabaseUser) ?? null);
        setLastLoadedClerkId(clerkId);
      } catch (err: any) {
        if (!isMounted) return;
        setProfile(null);
        setProfileError(err?.message ?? 'Failed to load profile');
        setLastLoadedClerkId(clerkId);
      } finally {
        if (!isMounted) return;
        setIsLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
    // Intentionally depend on stable primitives only to prevent refetch loops.
  }, [clerkLoaded, isSignedIn, clerkUser?.id, lastLoadedClerkId]);

  const fullName = useMemo(() => {
    const fromDb = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
    return fromDb || clerkUser?.fullName || 'Your Account';
  }, [profile?.first_name, profile?.last_name, clerkUser?.fullName]);

  const memberSince = useMemo(() => formatMemberSince(profile?.created_at), [profile?.created_at]);

  // Requested behavior: email from Supabase (fallback to Clerk), phone/address blank
  const emailToShow = profile?.email || clerkEmail;
  const phoneToShow = '';
  const addressToShow = '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header title="Your Account" subtitle="Manage your profile and account settings" />

        <View style={styles.content}>
          {/* Profile Card */}
          <Card style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Feather name="user" size={40} color={colors.white} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{fullName}</Text>

                {isLoadingProfile ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.memberSince}>Loading profile…</Text>
                  </View>
                ) : profileError ? (
                  <Text style={[styles.memberSince, { color: colors.error }]}>{profileError}</Text>
                ) : (
                  <Text style={styles.memberSince}>
                    {memberSince ? `Member since ${memberSince}` : ''}
                  </Text>
                )}
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Feather name="mail" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{emailToShow}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Feather name="phone" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{phoneToShow}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Feather name="map-pin" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{addressToShow}</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Settings */}
          <Card style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>Settings</Text>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Notifications</Text>
              <Text style={styles.settingIcon}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow} onPress={onPrivacyPress}>
              <Text style={styles.settingText}>Privacy</Text>
              <Text style={styles.settingIcon}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Payment Methods</Text>
              <Text style={styles.settingIcon}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
              <Text style={[styles.settingText, styles.logoutText]}>Log Out</Text>
            </TouchableOpacity>
          </Card>

          {/* Service Provider Mode Toggle */}
          <TouchableOpacity
            style={styles.toggleCard}
            onPress={onToggleServiceProvider}
            activeOpacity={0.8}
          >
            <View style={styles.toggleContent}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>💼</Text>
              </View>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>Switch to Worker Mode</Text>
                <Text style={styles.toggleSubtitle}>
                  Offer your services and accept job requests
                </Text>
              </View>
              <Feather name="arrow-right" size={24} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  toggleCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  toggleSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  profileCard: {
    padding: spacing.xl,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  memberSince: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  infoSection: {
    gap: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  settingsCard: {
    padding: spacing.lg,
  },
  settingsTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  settingIcon: {
    fontSize: typography.fontSize.xl,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
  },
  logoutText: {
    color: colors.error,
  },
});
