import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  showNotification?: boolean;
  notificationCount?: number;
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  rightElement,
  showNotification = false,
  notificationCount = 0,
  onNotificationPress,
}) => {
  const notificationElement = showNotification ? (
    <TouchableOpacity 
      style={styles.notificationButton}
      onPress={onNotificationPress}
      activeOpacity={0.7}
    >
      <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
      {notificationCount > 0 && (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>
            {notificationCount > 9 ? '9+' : notificationCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  ) : null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoDot} />
          <Text style={styles.logoText}>BlueBridge</Text>
        </View>
        {(rightElement || notificationElement) && (
          <View style={styles.rightElement}>{rightElement || notificationElement}</View>
        )}
      </View>
      {(title || subtitle) && (
        <View style={styles.titleContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  logoText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  rightElement: {
    position: 'absolute',
    right: 0,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  notificationBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,


  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
