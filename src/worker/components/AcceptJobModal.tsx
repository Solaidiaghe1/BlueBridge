import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { formatTimeWindowDisplay } from '../../services/workerService';

interface AcceptJobModalProps {
  visible: boolean;
  availableDates: string[];
  timeWindows: Record<string, string[]>;
  onClose: () => void;
  onAccept: (selectedDate: string, selectedTimeWindow: string) => void;
  isSubmitting?: boolean;
}

export const AcceptJobModal: React.FC<AcceptJobModalProps> = ({
  visible,
  availableDates,
  timeWindows,
  onClose,
  onAccept,
  isSubmitting = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<string | null>(null);

  // Sort dates chronologically
  const sortedDates = useMemo(() => {
    return [...availableDates].sort();
  }, [availableDates]);

  // Get time windows for selected date
  const availableTimeWindows = useMemo(() => {
    if (!selectedDate) return [];
    const windows = timeWindows?.[selectedDate] || [];
    // If no specific time windows, provide defaults
    if (windows.length === 0) {
      return ['Morning (8am-12pm)', 'Afternoon (12pm-4pm)', 'Evening (4pm-8pm)'];
    }
    return windows;
  }, [selectedDate, timeWindows]);

  const formatDateForDisplay = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeWindow(null); // Reset time window when date changes
  };

  const handleTimeWindowSelect = (timeWindow: string) => {
    setSelectedTimeWindow(timeWindow);
  };

  const handleAccept = () => {
    if (selectedDate && selectedTimeWindow) {
      onAccept(selectedDate, selectedTimeWindow);
    }
  };

  const canAccept = selectedDate && selectedTimeWindow && !isSubmitting;

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
          <Text style={styles.headerTitle}>Schedule Inspection</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Feather name="info" size={20} color={colors.primary} />
            <Text style={styles.instructionsText}>
              Select a date and time from the client's available windows to schedule your inspection.
            </Text>
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Dates</Text>
            <View style={styles.optionsGrid}>
              {sortedDates.map((date) => (
                <TouchableOpacity
                  key={date}
                  style={[
                    styles.dateOption,
                    selectedDate === date && styles.dateOptionSelected,
                  ]}
                  onPress={() => handleDateSelect(date)}
                >
                  <Text
                    style={[
                      styles.dateOptionText,
                      selectedDate === date && styles.dateOptionTextSelected,
                    ]}
                  >
                    {formatDateForDisplay(date)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time Window Selection */}
          {selectedDate && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Time Windows</Text>
              <View style={styles.timeWindowsList}>
                {availableTimeWindows.map((timeWindow) => (
                  <TouchableOpacity
                    key={timeWindow}
                    style={[
                      styles.timeWindowOption,
                      selectedTimeWindow === timeWindow && styles.timeWindowOptionSelected,
                    ]}
                    onPress={() => handleTimeWindowSelect(timeWindow)}
                  >
                    <View style={styles.radioCircle}>
                      {selectedTimeWindow === timeWindow && (
                        <View style={styles.radioCircleFilled} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.timeWindowText,
                        selectedTimeWindow === timeWindow && styles.timeWindowTextSelected,
                      ]}
                    >
                      {formatTimeWindowDisplay(timeWindow)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Summary */}
          {selectedDate && selectedTimeWindow && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Scheduled Inspection</Text>
              <View style={styles.summaryRow}>
                <Feather name="calendar" size={18} color={colors.primary} />
                <Text style={styles.summaryValue}>{formatDateForDisplay(selectedDate)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Feather name="clock" size={18} color={colors.primary} />
                <Text style={styles.summaryValue}>{formatTimeWindowDisplay(selectedTimeWindow)}</Text>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acceptButton, !canAccept && styles.acceptButtonDisabled]}
            onPress={handleAccept}
            disabled={!canAccept}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.acceptButtonText}>Confirm & Accept</Text>
            )}
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  instructionsText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  section: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dateOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  dateOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  dateOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  dateOptionTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  timeWindowsList: {
    gap: spacing.sm,
  },
  timeWindowOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    gap: spacing.md,
  },
  timeWindowOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.gray400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleFilled: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  timeWindowText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  timeWindowTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  summaryCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: colors.gray400,
  },
  acceptButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
});
