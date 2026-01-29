import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { Request } from '../../types/request';

interface SubmitOfferModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (offerData: OfferData) => void;
  request: Request;
}

export interface OfferData {
  laborCost: string;
  materialsCost: string;
  jobDescription: string;
  startDate: string;
  startTimeSlot: string;
  estimatedDuration: string;
}

export const SubmitOfferModal: React.FC<SubmitOfferModalProps> = ({
  visible,
  onClose,
  onSubmit,
  request,
}) => {
  const [laborCost, setLaborCost] = useState('');
  const [materialsCost, setMaterialsCost] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTimeSlot, setStartTimeSlot] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');

  const timeSlots = [
    { label: 'Morning', value: 'morning', timeRange: '8am–12pm' },
    { label: 'Afternoon', value: 'afternoon', timeRange: '12pm–4pm' },
    { label: 'Evening', value: 'evening', timeRange: '4pm–8pm' },
  ];

  const durationOptions = [
    { label: '1-2 hours', value: '1-2' },
    { label: '2-4 hours', value: '2-4' },
    { label: '4-6 hours', value: '4-6' },
    { label: '1 day', value: '1-day' },
    { label: '2-3 days', value: '2-3-days' },
    { label: '1 week', value: '1-week' },
  ];

  const handleSubmit = () => {
    const offerData: OfferData = {
      laborCost,
      materialsCost,
      jobDescription,
      startDate,
      startTimeSlot,
      estimatedDuration,
    };
    onSubmit(offerData);
  };

  const handleDayPress = (day: DateData) => {
    setStartDate(day.dateString);
  };

  const getShortDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  // Get maximum date (3 months from now)
  const maxDateObj = new Date();
  maxDateObj.setMonth(maxDateObj.getMonth() + 3);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  // Create markedDates object for calendar
  const markedDates = startDate ? {
    [startDate]: {
      selected: true,
      selectedColor: colors.primary,
    },
  } : {};

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Submit Job Offer</Text>
              <Text style={styles.headerSubtitle}>
                {(request.service_type || request.serviceType || 'Request').toString()} - Request #{request.public_id || request.id}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Pricing Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="dollar-sign" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Pricing</Text>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Cost of Labor ($)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="200.00"
                    placeholderTextColor={colors.gray400}
                    keyboardType="decimal-pad"
                    value={laborCost}
                    onChangeText={setLaborCost}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Cost of Materials ($)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="150.00"
                    placeholderTextColor={colors.gray400}
                    keyboardType="decimal-pad"
                    value={materialsCost}
                    onChangeText={setMaterialsCost}
                  />
                </View>
              </View>
            </View>

            {/* Job Description Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="file-text" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Job Description</Text>
              </View>

              <TextInput
                style={styles.textArea}
                placeholder="Describe the work to be done, materials needed, and any relevant details..."
                placeholderTextColor={colors.gray400}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={jobDescription}
                onChangeText={setJobDescription}
              />
            </View>

            {/* Schedule Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="clock" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Schedule</Text>
              </View>

              <Text style={styles.inputLabel}>Time to Start Job</Text>
              <Calendar
                style={styles.calendar}
                theme={{
                  backgroundColor: colors.white,
                  calendarBackground: colors.white,
                  textSectionTitleColor: colors.textSecondary,
                  selectedDayBackgroundColor: colors.primary,
                  selectedDayTextColor: colors.white,
                  todayTextColor: colors.primary,
                  dayTextColor: colors.textPrimary,
                  textDisabledColor: colors.gray300,
                  dotColor: colors.primary,
                  selectedDotColor: colors.white,
                  arrowColor: colors.primary,
                  monthTextColor: colors.textPrimary,
                  textDayFontWeight: '400',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600',
                }}
                minDate={minDate}
                maxDate={maxDate}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                hideExtraDays={true}
              />

              {startDate && (
                <View style={styles.selectedDateContainer}>
                  <Text style={styles.selectedDateLabel}>Selected: {getShortDate(startDate)}</Text>
                  
                  <Text style={styles.timeSlotLabel}>Select Time Slot</Text>
                  <View style={styles.timeSlotButtons}>
                    {timeSlots.map((slot) => (
                      <TouchableOpacity
                        key={slot.value}
                        style={[
                          styles.timeSlotButton,
                          startTimeSlot === slot.value && styles.timeSlotButtonSelected,
                        ]}
                        onPress={() => setStartTimeSlot(slot.value)}
                      >
                        <Text
                          style={[
                            styles.timeSlotButtonText,
                            startTimeSlot === slot.value && styles.timeSlotButtonTextSelected,
                          ]}
                        >
                          {slot.label}
                        </Text>
                        <Text
                          style={[
                            styles.timeSlotButtonTime,
                            startTimeSlot === slot.value && styles.timeSlotButtonTimeSelected,
                          ]}
                        >
                          {slot.timeRange}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.durationContainer}>
                <Text style={styles.inputLabel}>Estimated Duration</Text>
                <View style={styles.durationButtons}>
                  {durationOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.durationButton,
                        estimatedDuration === option.value && styles.durationButtonSelected,
                      ]}
                      onPress={() => setEstimatedDuration(option.value)}
                    >
                      <Text
                        style={[
                          styles.durationButtonText,
                          estimatedDuration === option.value && styles.durationButtonTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: '90%',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flexGrow: 1,
    flexShrink: 1,
  },
  section: {
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  textArea: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    minHeight: 120,
  },
  calendar: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  selectedDateContainer: {
    marginTop: spacing.md,
  },
  selectedDateLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  timeSlotLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  timeSlotButtons: {
    gap: spacing.sm,
  },
  timeSlotButton: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSlotButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  timeSlotButtonTextSelected: {
    color: colors.white,
  },
  timeSlotButtonTime: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  timeSlotButtonTimeSelected: {
    color: colors.white,
  },
  durationContainer: {
    marginTop: spacing.lg,
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  durationButton: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  durationButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  durationButtonTextSelected: {
    color: colors.white,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.xl,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  submitButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
});
