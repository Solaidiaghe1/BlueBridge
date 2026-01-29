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
} from 'react-native';
import { z } from 'zod';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

// Zod validation schema
const profileSchema = z.object({
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

interface ProfileInfoScreenProps {
  onNext: (profileData: any) => void;
  onBack: () => void;
}

export const ProfileInfoScreen: React.FC<ProfileInfoScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    try {
      const fieldSchema = profileSchema.shape[field as keyof typeof profileSchema.shape];
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

  const isFormValid = () => {
    return (
      month.trim() &&
      day.trim() &&
      year.trim() &&
      Object.keys(errors).length === 0
    );
  };

  const handleContinue = () => {
    try {
      const validatedData = profileSchema.parse({
        month,
        day,
        year,
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
          </View>

          {/* Extra space for keyboard */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Footer with Next button */}
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
              <Text style={[styles.nextButtonText, !isFormValid() && styles.nextButtonTextDisabled]}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  content: {
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  formContainer: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  formSection: {
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
  largeInput: {
    flex: 3,
  },
  smallInput: {
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
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
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
