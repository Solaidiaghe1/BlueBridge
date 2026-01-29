import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { z } from 'zod';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { US_STATES, YEARS_OF_EXPERIENCE } from '../../shared/constants';

// Zod validation schema for worker profile
const workerProfileSchema = z.object({
  month: z.string()
    .regex(/^(0?[1-9]|1[0-2])$/, 'Month must be between 01 and 12')
    .transform(val => val.padStart(2, '0')),

  day: z.string()
    .regex(/^(0?[1-9]|[12][0-9]|3[01])$/, 'Day must be between 01 and 31')
    .transform(val => val.padStart(2, '0')),

  year: z.string()
    .regex(/^\d{4}$/, 'Year must be 4 digits')
    .refine((year) => {
      const yearNum = parseInt(year);
      const currentYear = new Date().getFullYear();
      return yearNum >= 1900 && yearNum <= currentYear;
    }, 'Year must be between 1900 and current year')
    .refine((year) => {
      const yearNum = parseInt(year);
      const currentYear = new Date().getFullYear();
      const age = currentYear - yearNum;
      return age >= 18;
    }, 'You must be at least 18 years old'),

  streetAddress: z.string()
    .min(1, 'Street address is required')
    .min(5, 'Street address must be at least 5 characters')
    .max(100, 'Street address must be less than 100 characters'),

  apt: z.string().optional().or(z.literal('')),

  city: z.string()
    .min(1, 'City is required')
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'City can only contain letters, spaces, hyphens, and apostrophes'),

  state: z.string()
    .min(1, 'Please select a state')
    .refine((val) => val !== '', 'Please select a state'),

  zipCode: z.string()
    .regex(/^\d{5}$/, 'ZIP code must be exactly 5 digits'),

  yearsOfExperience: z.string()
    .min(1, 'Please select your years of experience')
    .refine((val) => val !== '', 'Please select your years of experience'),
}).refine((data) => {
  // Validate the complete date
  const month = parseInt(data.month);
  const day = parseInt(data.day);
  const year = parseInt(data.year);

  const date = new Date(year, month - 1, day);
  const isValidDate = date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  if (!isValidDate) {
    return false;
  }

  return date <= new Date();
}, {
  message: 'Please enter a valid date of birth',
  path: ['day'],
});

interface WorkerProfileInfoScreenProps {
  onNext: (profileData: any) => void;
  onBack: () => void;
}

export const WorkerProfileInfoScreen: React.FC<WorkerProfileInfoScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showExperiencePicker, setShowExperiencePicker] = useState(false);

  const validateField = (field: string, value: string) => {
    try {
      const fieldSchema = workerProfileSchema.shape[field as keyof typeof workerProfileSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.issues[0]?.message || 'Invalid value'
        }));
      }
    }
  };

  const handleStateSelect = (stateValue: string) => {
    setState(stateValue);
    setShowStatePicker(false);
    validateField('state', stateValue);
  };

  const handleExperienceSelect = (experienceValue: string) => {
    setYearsOfExperience(experienceValue);
    setShowExperiencePicker(false);
    validateField('yearsOfExperience', experienceValue);
  };

  const isFormValid = () => {
    return (
      month.trim() &&
      day.trim() &&
      year.trim() &&
      streetAddress.trim() &&
      city.trim() &&
      state.trim() &&
      zipCode.trim() &&
      yearsOfExperience.trim() &&
      Object.keys(errors).length === 0
    );
  };

  const handleContinue = () => {
    try {
      const validatedData = workerProfileSchema.parse({
        month,
        day,
        year,
        streetAddress: streetAddress.trim(),
        apt: apt.trim(),
        city: city.trim(),
        state,
        zipCode,
        yearsOfExperience,
      });

      onNext(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          const field = err.path[0] as string;
          formattedErrors[field] = err.message;
        });
        setErrors(formattedErrors);

        // Show alert with first error
        Alert.alert(
          'Validation Error',
          error.issues[0]?.message || 'Please check your input and try again'
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Tell Us About Yourself</Text>

          <View style={styles.formContainer}>
            {/* Date of Birth Section */}
            <View style={styles.section}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.row}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.thirdInput,
                      errors.month && styles.inputError
                    ]}
                    placeholder="MM"
                    placeholderTextColor={colors.gray400}
                    value={month}
                    onChangeText={setMonth}
                    onBlur={() => month && validateField('month', month)}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  {errors.month && (
                    <Text style={styles.errorText}>{errors.month}</Text>
                  )}
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.thirdInput,
                      errors.day && styles.inputError
                    ]}
                    placeholder="DD"
                    placeholderTextColor={colors.gray400}
                    value={day}
                    onChangeText={setDay}
                    onBlur={() => day && validateField('day', day)}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  {errors.day && (
                    <Text style={styles.errorText}>{errors.day}</Text>
                  )}
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.thirdInput,
                      errors.year && styles.inputError
                    ]}
                    placeholder="YYYY"
                    placeholderTextColor={colors.gray400}
                    value={year}
                    onChangeText={setYear}
                    onBlur={() => year && validateField('year', year)}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                  {errors.year && (
                    <Text style={styles.errorText}>{errors.year}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Address Section */}
            <View style={styles.section}>
              <Text style={styles.label}>Address</Text>
              
              {/* Street Address */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, errors.streetAddress && styles.inputError]}
                  placeholder="Street Address"
                  placeholderTextColor={colors.gray400}
                  value={streetAddress}
                  onChangeText={setStreetAddress}
                  onBlur={() => streetAddress && validateField('streetAddress', streetAddress.trim())}
                />
                {errors.streetAddress && (
                  <Text style={styles.errorText}>{errors.streetAddress}</Text>
                )}
              </View>

              {/* Apt/Unit */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Apt/Unit (Optional)"
                  placeholderTextColor={colors.gray400}
                  value={apt}
                  onChangeText={setApt}
                />
              </View>

              {/* City */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, errors.city && styles.inputError]}
                  placeholder="City"
                  placeholderTextColor={colors.gray400}
                  value={city}
                  onChangeText={setCity}
                  onBlur={() => city && validateField('city', city.trim())}
                />
                {errors.city && (
                  <Text style={styles.errorText}>{errors.city}</Text>
                )}
              </View>

              {/* State and ZIP */}
              <View style={styles.row}>
                <View style={styles.inputWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.input,
                      styles.statePickerButton,
                      errors.state && styles.inputError
                    ]}
                    onPress={() => setShowStatePicker(true)}
                  >
                    <Text style={[styles.pickerButtonText, !state && styles.placeholderText]}>
                      {state ? US_STATES.find(s => s.value === state)?.label : 'State'}
                    </Text>
                    <Feather name="chevron-down" size={20} color={colors.gray400} />
                  </TouchableOpacity>
                  {errors.state && (
                    <Text style={styles.errorText}>{errors.state}</Text>
                  )}
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, errors.zipCode && styles.inputError]}
                    placeholder="ZIP"
                    placeholderTextColor={colors.gray400}
                    value={zipCode}
                    onChangeText={setZipCode}
                    onBlur={() => zipCode && validateField('zipCode', zipCode)}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                  {errors.zipCode && (
                    <Text style={styles.errorText}>{errors.zipCode}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Years of Experience Section */}
            <View style={styles.section}>
              <Text style={styles.label}>Years of Experience</Text>
              <View style={styles.inputWrapper}>
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.statePickerButton,
                    errors.yearsOfExperience && styles.inputError
                  ]}
                  onPress={() => setShowExperiencePicker(true)}
                >
                  <Text style={[styles.pickerButtonText, !yearsOfExperience && styles.placeholderText]}>
                    {yearsOfExperience 
                      ? YEARS_OF_EXPERIENCE.find(e => e.value === yearsOfExperience)?.label 
                      : 'Select Experience'}
                  </Text>
                  <Feather name="chevron-down" size={20} color={colors.gray400} />
                </TouchableOpacity>
                {errors.yearsOfExperience && (
                  <Text style={styles.errorText}>{errors.yearsOfExperience}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Extra space for keyboard */}
          <View style={{ height: 120 }} />
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
              style={[styles.nextButton, !isFormValid() && styles.nextButtonDisabled]}
              onPress={handleContinue}
              disabled={!isFormValid()}
            >
              <Text style={[styles.nextButtonText, !isFormValid() && styles.nextButtonTextDisabled]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* State Picker Modal */}
      <Modal
        visible={showStatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatePicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity
                onPress={() => setShowStatePicker(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {US_STATES.filter(s => s.value !== '').map((stateOption) => (
                <TouchableOpacity
                  key={stateOption.value}
                  style={[
                    styles.modalOption,
                    state === stateOption.value && styles.modalOptionSelected
                  ]}
                  onPress={() => handleStateSelect(stateOption.value)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    state === stateOption.value && styles.modalOptionTextSelected
                  ]}>
                    {stateOption.label}
                  </Text>
                  {state === stateOption.value && (
                    <Feather name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Years of Experience Picker Modal */}
      <Modal
        visible={showExperiencePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExperiencePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowExperiencePicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Years of Experience</Text>
              <TouchableOpacity
                onPress={() => setShowExperiencePicker(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {YEARS_OF_EXPERIENCE.filter(e => e.value !== '').map((experience) => (
                <TouchableOpacity
                  key={experience.value}
                  style={[
                    styles.modalOption,
                    yearsOfExperience === experience.value && styles.modalOptionSelected
                  ]}
                  onPress={() => handleExperienceSelect(experience.value)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    yearsOfExperience === experience.value && styles.modalOptionTextSelected
                  ]}>
                    {experience.label}
                  </Text>
                  {yearsOfExperience === experience.value && (
                    <Feather name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  formContainer: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  halfInput: {
    flex: 1,
  },
  thirdInput: {
    flex: 1,
  },
  inputWrapper: {
    flex: 1,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  statePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  placeholderText: {
    color: colors.gray400,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  modalOptionSelected: {
    backgroundColor: colors.primary + '10',
  },
  modalOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  modalOptionTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});
