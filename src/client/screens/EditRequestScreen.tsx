import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { Request } from '../../types/request';
import { useAuth } from '@clerk/clerk-expo';
import { createAuthedSupabaseClient } from '../../config/supabase';

// US States list
const US_STATES = [
  { label: 'Select State', value: '' },
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
];

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (AM)', time: '8:00 AM - 12:00 PM' },
  { id: 'afternoon', label: 'Afternoon (PM)', time: '12:00 PM - 4:00 PM' },
  { id: 'evening', label: 'Evening (PM)', time: '4:00 PM - 8:00 PM' },
];

interface EditRequestScreenProps {
  request: Request;
  onBack: () => void;
  onSaveSuccess: () => void;
}

export const EditRequestScreen: React.FC<EditRequestScreenProps> = ({
  request,
  onBack,
  onSaveSuccess,
}) => {
  const { getToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  // Form state initialized from request
  const [title, setTitle] = useState(request.title || '');
  const [description, setDescription] = useState(request.description || '');
  const [streetAddress, setStreetAddress] = useState(request.street_address || '');
  const [apt, setApt] = useState(request.apt_suite_unit || '');
  const [city, setCity] = useState(request.city || '');
  const [state, setState] = useState(request.state || '');
  const [zipCode, setZipCode] = useState(request.zip_code || '');
  const [locationType, setLocationType] = useState(request.location_type || '');
  const [parkingNotes, setParkingNotes] = useState(request.parking_notes || '');
  const [petsOnSite, setPetsOnSite] = useState(request.pets_on_site || false);

  // Availability state
  const [selectedDates, setSelectedDates] = useState<string[]>(request.available_dates || []);
  const [timeWindows, setTimeWindows] = useState<Record<string, string[]>>(
    request.time_windows || {}
  );

  const displayId = request.public_id || request.id;

  const handleDateSelect = (day: DateData) => {
    const dateStr = day.dateString;
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      const newTimeWindows = { ...timeWindows };
      delete newTimeWindows[dateStr];
      setTimeWindows(newTimeWindows);
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const toggleTimeSlot = (dateStr: string, slotId: string) => {
    const currentSlots = timeWindows[dateStr] || [];
    let newSlots: string[];
    if (currentSlots.includes(slotId)) {
      newSlots = currentSlots.filter((s) => s !== slotId);
    } else {
      newSlots = [...currentSlots, slotId];
    }
    setTimeWindows({ ...timeWindows, [dateStr]: newSlots });
  };

  const getMarkedDates = () => {
    const marked: Record<string, any> = {};
    for (const date of selectedDates) {
      marked[date] = {
        selected: true,
        selectedColor: colors.primary,
      };
    }
    return marked;
  };

  const formatShortDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your request.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description.');
      return;
    }
    if (!streetAddress.trim() || !city.trim() || !state || !zipCode.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required address fields.');
      return;
    }
    if (selectedDates.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one available date.');
      return;
    }

    // Check each selected date has at least one time slot
    const datesWithoutSlots = selectedDates.filter(
      (d) => !timeWindows[d] || timeWindows[d].length === 0
    );
    if (datesWithoutSlots.length > 0) {
      Alert.alert('Validation Error', 'Please select at least one time slot for each date.');
      return;
    }

    setIsSaving(true);

    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('Missing auth token');

      const supabase = createAuthedSupabaseClient(token);

      // Convert time slot IDs to display format for storage
      const SLOT_TO_RANGE: Record<string, string> = {
        morning: '8:00-12:00',
        afternoon: '12:00-16:00',
        evening: '16:00-20:00',
      };

      const formattedTimeWindows = Object.fromEntries(
        Object.entries(timeWindows).map(([date, slots]) => [
          date,
          slots.map((s) => SLOT_TO_RANGE[s] || s).filter(Boolean),
        ])
      );

      const updatePayload = {
        title: title.trim(),
        description: description.trim(),
        street_address: streetAddress.trim(),
        apt_suite_unit: apt.trim() || null,
        city: city.trim(),
        state,
        zip_code: zipCode.trim(),
        location_type: locationType.trim() || null,
        parking_notes: parkingNotes.trim() || null,
        pets_on_site: petsOnSite,
        available_dates: selectedDates,
        time_windows: formattedTimeWindows,
      };

      const { error } = await supabase
        .from('requests')
        .update(updatePayload)
        .eq('id', request.id);

      if (error) throw error;

      Alert.alert('Success', 'Your request has been updated.', [
        { text: 'OK', onPress: onSaveSuccess },
      ]);
    } catch (e: any) {
      console.error('Failed to update request:', e);
      Alert.alert('Error', e?.message || 'Failed to update request. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Edit Request</Text>
            <Text style={styles.headerSubtitle}>#{displayId}</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Service Type (read-only) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Type</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>
                {(request.service_type || 'Service').toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Title & Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Request Details</Text>
            
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Brief title for your request"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the work needed..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>

            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={styles.input}
              value={streetAddress}
              onChangeText={setStreetAddress}
              placeholder="123 Main St"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Apt / Suite / Unit</Text>
            <TextInput
              style={styles.input}
              value={apt}
              onChangeText={setApt}
              placeholder="Apt 4B"
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={styles.stateContainer}>
                <Text style={styles.label}>State *</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowStatePicker(true)}
                >
                  <Text style={state ? styles.selectText : styles.selectPlaceholder}>
                    {state || 'State'}
                  </Text>
                  <Feather name="chevron-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>ZIP Code *</Text>
                <TextInput
                  style={styles.input}
                  value={zipCode}
                  onChangeText={setZipCode}
                  placeholder="12345"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.label}>Location Type</Text>
                <TextInput
                  style={styles.input}
                  value={locationType}
                  onChangeText={setLocationType}
                  placeholder="Home, Office, etc."
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <Text style={styles.sectionSubtitle}>
              Select dates and time slots when you're available
            </Text>

            <Calendar
              onDayPress={handleDateSelect}
              markedDates={getMarkedDates()}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                backgroundColor: colors.white,
                calendarBackground: colors.white,
                textSectionTitleColor: colors.textSecondary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.white,
                todayTextColor: colors.primary,
                dayTextColor: colors.textPrimary,
                textDisabledColor: colors.gray300,
                arrowColor: colors.primary,
                monthTextColor: colors.textPrimary,
              }}
              style={styles.calendar}
            />

            {/* Time slots for selected dates */}
            {selectedDates.sort().map((dateStr) => (
              <View key={dateStr} style={styles.dateTimeBlock}>
                <Text style={styles.dateLabel}>{formatShortDate(dateStr)}</Text>
                <View style={styles.timeSlotsRow}>
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = (timeWindows[dateStr] || []).includes(slot.id);
                    return (
                      <TouchableOpacity
                        key={slot.id}
                        style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
                        onPress={() => toggleTimeSlot(dateStr, slot.id)}
                      >
                        <Text
                          style={[styles.timeSlotLabel, isSelected && styles.timeSlotLabelSelected]}
                        >
                          {slot.label}
                        </Text>
                        <Text
                          style={[styles.timeSlotTime, isSelected && styles.timeSlotTimeSelected]}
                        >
                          {slot.time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          {/* Additional Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setPetsOnSite(!petsOnSite)}
            >
              <View style={[styles.checkbox, petsOnSite && styles.checkboxChecked]}>
                {petsOnSite && <Feather name="check" size={14} color={colors.white} />}
              </View>
              <Text style={styles.checkboxLabel}>Pets on site</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Parking Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={parkingNotes}
              onChangeText={setParkingNotes}
              placeholder="Any parking instructions..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Bottom padding */}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* State Picker Modal */}
        {showStatePicker && (
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select State</Text>
                <TouchableOpacity onPress={() => setShowStatePicker(false)}>
                  <Feather name="x" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerScroll}>
                {US_STATES.filter((s) => s.value).map((s) => (
                  <TouchableOpacity
                    key={s.value}
                    style={[styles.pickerItem, state === s.value && styles.pickerItemSelected]}
                    onPress={() => {
                      setState(s.value);
                      setShowStatePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        state === s.value && styles.pickerItemTextSelected,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.sm,
  },
  readOnlyField: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  readOnlyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  stateContainer: {
    width: 100,
  },
  selectInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  selectPlaceholder: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  calendar: {
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  dateTimeBlock: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
  },
  dateLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  timeSlotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    minWidth: 100,
  },
  timeSlotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  timeSlotLabelSelected: {
    color: colors.white,
  },
  timeSlotTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timeSlotTimeSelected: {
    color: colors.white,
    opacity: 0.8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.gray300,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  pickerModal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  pickerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  pickerScroll: {
    maxHeight: 400,
  },
  pickerItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  pickerItemSelected: {
    backgroundColor: colors.primaryLight + '20',
  },
  pickerItemText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  pickerItemTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});
