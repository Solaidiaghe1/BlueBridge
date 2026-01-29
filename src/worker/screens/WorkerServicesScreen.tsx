import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { SERVICE_TYPES } from '../../shared/constants';

interface WorkerServicesScreenProps {
  onNext: (services: string[]) => void;
  onBack: () => void;
}

export const WorkerServicesScreen: React.FC<WorkerServicesScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (serviceValue: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceValue)) {
        return prev.filter((s) => s !== serviceValue);
      } else {
        return [...prev, serviceValue];
      }
    });
  };

  const isServiceSelected = (serviceValue: string) => {
    return selectedServices.includes(serviceValue);
  };

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      Alert.alert(
        'Selection Required',
        'Please select at least one service to continue.'
      );
      return;
    }

    onNext(selectedServices);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>What Service(s) Do You Provide?</Text>
          <Text style={styles.subtitle}>Select all that apply</Text>

          <View style={styles.checkboxContainer}>
            {SERVICE_TYPES.map((service) => (
              <TouchableOpacity
                key={service.value}
                style={[
                  styles.checkboxItem,
                  isServiceSelected(service.value) && styles.checkboxItemSelected
                ]}
                onPress={() => toggleService(service.value)}
              >
                <View style={styles.checkboxContent}>
                  <View style={[
                    styles.checkbox,
                    isServiceSelected(service.value) && styles.checkboxChecked
                  ]}>
                    {isServiceSelected(service.value) && (
                      <Feather name="check" size={18} color={colors.white} />
                    )}
                  </View>
                  <Text style={[
                    styles.checkboxLabel,
                    isServiceSelected(service.value) && styles.checkboxLabelSelected
                  ]}>
                    {service.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Extra space for footer */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer with buttons */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.nextButton,
                selectedServices.length === 0 && styles.nextButtonDisabled
              ]}
              onPress={handleContinue}
              disabled={selectedServices.length === 0}
            >
              <Text style={[
                styles.nextButtonText,
                selectedServices.length === 0 && styles.nextButtonTextDisabled
              ]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  checkboxContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  checkboxItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    overflow: 'hidden',
  },
  checkboxItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  checkboxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  checkboxLabelSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  nextButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  nextButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  nextButtonTextDisabled: {
    color: colors.gray500,
  },
});
