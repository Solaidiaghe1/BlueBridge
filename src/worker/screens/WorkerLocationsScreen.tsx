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
import { LOCATION_TYPES } from '../../shared/constants';

interface WorkerLocationsScreenProps {
  onComplete: (locations: string[]) => void;
  onBack: () => void;
}

export const WorkerLocationsScreen: React.FC<WorkerLocationsScreenProps> = ({
  onComplete,
  onBack,
}) => {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const toggleLocation = (locationValue: string) => {
    setSelectedLocations((prev) => {
      if (prev.includes(locationValue)) {
        return prev.filter((l) => l !== locationValue);
      } else {
        return [...prev, locationValue];
      }
    });
  };

  const isLocationSelected = (locationValue: string) => {
    return selectedLocations.includes(locationValue);
  };

  const handleComplete = () => {
    if (selectedLocations.length === 0) {
      Alert.alert(
        'Selection Required',
        'Please select at least one location to continue.'
      );
      return;
    }

    onComplete(selectedLocations);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>What Locations Do You Focus On?</Text>
          <Text style={styles.subtitle}>Select all that apply</Text>

          <View style={styles.checkboxContainer}>
            {LOCATION_TYPES.map((location) => (
              <TouchableOpacity
                key={location.value}
                style={[
                  styles.checkboxItem,
                  isLocationSelected(location.value) && styles.checkboxItemSelected
                ]}
                onPress={() => toggleLocation(location.value)}
              >
                <View style={styles.checkboxContent}>
                  <View style={[
                    styles.checkbox,
                    isLocationSelected(location.value) && styles.checkboxChecked
                  ]}>
                    {isLocationSelected(location.value) && (
                      <Feather name="check" size={18} color={colors.white} />
                    )}
                  </View>
                  <Text style={[
                    styles.checkboxLabel,
                    isLocationSelected(location.value) && styles.checkboxLabelSelected
                  ]}>
                    {location.label}
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
                styles.completeButton,
                selectedLocations.length === 0 && styles.completeButtonDisabled
              ]}
              onPress={handleComplete}
              disabled={selectedLocations.length === 0}
            >
              <Text style={[
                styles.completeButtonText,
                selectedLocations.length === 0 && styles.completeButtonTextDisabled
              ]}>
                Complete
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
  completeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  completeButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  completeButtonTextDisabled: {
    color: colors.gray500,
  },
});
