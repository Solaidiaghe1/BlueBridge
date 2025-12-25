import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

const colors = {
  background: '#F9FAFB',
  primary: '#0EA5E9',
  primaryDark: '#0369A1',
  textPrimary: '#0F172A',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
};

const spacing = {
  sm: 8,
  base: 14,
  lg: 16,
  xl: 24,
  xxxl: 48,
};

const borderRadius = {
  xxl: 12,
};

const typography = {
  fontSize: {
    huge: 28,
    xxxl: 32,
    xl: 20,
    xxl: 18,
    base: 14,
  },
  fontWeight: {
    bold: '700',
    semiBold: '600',
  },
} as const;

const shadows = {
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
};

interface RoleSelectorScreenProps {
  onClientSelect: () => void;
  onServiceSelect: () => void;
}

export const RoleSelectorScreen: React.FC<RoleSelectorScreenProps> = ({
  onClientSelect,
  onServiceSelect,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoDot} />
            <Text style={styles.logoText}>BlueBridge</Text>
          </View>
          <Text style={styles.title}>Let's Get Started</Text>
          <Text style={styles.subtitle}>Who Are You?</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.clientButton, shadows.xl]}
            onPress={onClientSelect}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Client</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.serviceButton, shadows.xl]}
            onPress={onServiceSelect}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Service</Text>
          </TouchableOpacity>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Connecting communities with trusted professionals
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  logoText: {
    fontSize: typography.fontSize.huge,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.xl,
    color: colors.textSecondary,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.lg,
  },
  button: {
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientButton: {
    backgroundColor: colors.primary,
  },
  serviceButton: {
    backgroundColor: colors.primaryDark,
  },
  buttonText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  tagline: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
});
