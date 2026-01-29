import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { SERVICE_TYPES, LOCATION_TYPES } from '../../shared/constants';

export interface FilterOptions {
  serviceTypes: string[];
  workAreaTypes: string[];
  maxDistance: number | null; // in miles, null means no limit
}

const DISTANCE_OPTIONS = [
  { label: 'Any distance', value: null },
  { label: 'Within 5 miles', value: 5 },
  { label: 'Within 10 miles', value: 10 },
  { label: 'Within 20 miles', value: 20 },
  { label: 'Within 30 miles', value: 30 },
  { label: 'Within 50 miles', value: 50 },
];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
}) => {
  const [selectedServices, setSelectedServices] = useState<string[]>(currentFilters.serviceTypes);
  const [selectedWorkAreas, setSelectedWorkAreas] = useState<string[]>(currentFilters.workAreaTypes);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(currentFilters.maxDistance);

  // Reset to current filters when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedServices(currentFilters.serviceTypes);
      setSelectedWorkAreas(currentFilters.workAreaTypes);
      setSelectedDistance(currentFilters.maxDistance);
    }
  }, [visible, currentFilters]);

  const toggleService = (value: string) => {
    setSelectedServices(prev =>
      prev.includes(value)
        ? prev.filter(s => s !== value)
        : [...prev, value]
    );
  };

  const toggleWorkArea = (value: string) => {
    setSelectedWorkAreas(prev =>
      prev.includes(value)
        ? prev.filter(a => a !== value)
        : [...prev, value]
    );
  };

  const handleApply = () => {
    onApply({
      serviceTypes: selectedServices,
      workAreaTypes: selectedWorkAreas,
      maxDistance: selectedDistance,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedServices([]);
    setSelectedWorkAreas([]);
    setSelectedDistance(null);
  };

  const activeFilterCount = selectedServices.length + selectedWorkAreas.length + (selectedDistance !== null ? 1 : 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filter Requests</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Service Types Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Type</Text>
            <Text style={styles.sectionSubtitle}>
              Show requests for these services
            </Text>
            <View style={styles.optionsGrid}>
              {SERVICE_TYPES.map(service => (
                <TouchableOpacity
                  key={service.value}
                  style={[
                    styles.optionChip,
                    selectedServices.includes(service.value) && styles.optionChipSelected,
                  ]}
                  onPress={() => toggleService(service.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      selectedServices.includes(service.value) && styles.optionChipTextSelected,
                    ]}
                  >
                    {service.label}
                  </Text>
                  {selectedServices.includes(service.value) && (
                    <Feather name="check" size={16} color={colors.white} style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Work Areas Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Area</Text>
            <Text style={styles.sectionSubtitle}>
              Show requests for these areas
            </Text>
            <View style={styles.optionsGrid}>
              {LOCATION_TYPES.map(area => (
                <TouchableOpacity
                  key={area.value}
                  style={[
                    styles.optionChip,
                    selectedWorkAreas.includes(area.value) && styles.optionChipSelected,
                  ]}
                  onPress={() => toggleWorkArea(area.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      selectedWorkAreas.includes(area.value) && styles.optionChipTextSelected,
                    ]}
                  >
                    {area.label}
                  </Text>
                  {selectedWorkAreas.includes(area.value) && (
                    <Feather name="check" size={16} color={colors.white} style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distance</Text>
            <Text style={styles.sectionSubtitle}>
              Show requests within a certain range
            </Text>
            <View style={styles.distanceOptions}>
              {DISTANCE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value ?? 'any'}
                  style={[
                    styles.distanceOption,
                    selectedDistance === option.value && styles.distanceOptionSelected,
                  ]}
                  onPress={() => setSelectedDistance(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioOuter}>
                    {selectedDistance === option.value && <View style={styles.radioInner} />}
                  </View>
                  <Text
                    style={[
                      styles.distanceOptionText,
                      selectedDistance === option.value && styles.distanceOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>
              Apply Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
    marginBottom: spacing.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  optionChipTextSelected: {
    color: colors.white,
  },
  checkIcon: {
    marginLeft: spacing.xs,
  },
  distanceOptions: {
    gap: spacing.sm,
  },
  distanceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  distanceOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight || '#E8F4FD',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray400,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  distanceOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  distanceOptionTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
