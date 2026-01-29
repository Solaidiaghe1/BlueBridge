import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { Header } from '../../shared/components/Header';
import { Card } from '../../shared/components/Card';
import { getCurrentUser } from '../../services/mockUser';

interface WorkerAccountScreenProps {
  onSwitchToClient?: () => void;
  onSignOut?: () => void;
}

export const WorkerAccountScreen: React.FC<WorkerAccountScreenProps> = ({
  onSwitchToClient,
  onSignOut,
}) => {
  const user = getCurrentUser();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
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
      ]
    );
  };

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
                <Text style={styles.name}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.memberSince}>Service Provider</Text>
                <Text style={styles.memberSince}>Member since {user.memberSince}</Text>
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
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Feather name="phone" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user.phone}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Feather name="map-pin" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>
                    {[
                      user.address,
                      user.apt && `Apt ${user.apt}`,
                      user.city,
                      user.state,
                      user.zip
                    ].filter(Boolean).join(', ')}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Settings */}
          <Card style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>Settings</Text>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Services & Skills</Text>
              <Text style={styles.settingIcon}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Notifications</Text>
              <Text style={styles.settingIcon}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
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

          {/* Switch to Client Mode */}
          {onSwitchToClient && (
            <TouchableOpacity
              style={styles.switchButton}
              onPress={onSwitchToClient}
              activeOpacity={0.8}
            >
              <View style={styles.switchContent}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>🏠</Text>
                </View>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchTitle}>Switch to Client Mode</Text>
                  <Text style={styles.switchSubtitle}>
                    Find and hire service providers for your home
                  </Text>
                </View>
                <Feather name="arrow-right" size={24} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}
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
  switchButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  switchContent: {
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
  switchTextContainer: {
    flex: 1,
  },
  switchTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  switchSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
