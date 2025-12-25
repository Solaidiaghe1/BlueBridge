import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { PrimaryButton } from '../../shared/components/PrimaryButton';
import { ProfileFormData } from '../../types/user';

interface ProfileInfoScreenProps {
  onNext: (data: ProfileFormData) => void;
  onBack: () => void;
}

export const ProfileInfoScreen: React.FC<ProfileInfoScreenProps> = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    month: '',
    day: '',
    year: '',
    address: '',
    apt: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleNext = () => {
    // Basic validation
    if (formData.firstName && formData.lastName && formData.address) {
      onNext(formData);
    }
  };

  const isNextEnabled = Boolean(
    formData.firstName && 
    formData.lastName && 
    formData.address &&
    formData.city &&
    formData.state &&
    formData.zip
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <Text style={styles.title}>Tell Us About Yourself</Text>

            {/* Form Card */}
            <View style={styles.formCard}>
              {/* Name */}
              <View style={styles.formSection}>
                <Text style={styles.label}>Name</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="First"
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    placeholderTextColor={colors.gray400}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Last"
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                    placeholderTextColor={colors.gray400}
                  />
                </View>
              </View>

              {/* Age */}
              <View style={styles.formSection}>
                <Text style={styles.label}>Age</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.thirdInput]}
                    placeholder="MM"
                    value={formData.month}
                    onChangeText={(text) => setFormData({ ...formData, month: text })}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholderTextColor={colors.gray400}
                  />
                  <TextInput
                    style={[styles.input, styles.thirdInput]}
                    placeholder="DD"
                    value={formData.day}
                    onChangeText={(text) => setFormData({ ...formData, day: text })}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholderTextColor={colors.gray400}
                  />
                  <TextInput
                    style={[styles.input, styles.thirdInput]}
                    placeholder="YYYY"
                    value={formData.year}
                    onChangeText={(text) => setFormData({ ...formData, year: text })}
                    keyboardType="number-pad"
                    maxLength={4}
                    placeholderTextColor={colors.gray400}
                  />
                </View>
              </View>

              {/* Address */}
              <View style={styles.formSection}>
                <Text style={styles.label}>Address</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 2 }]}
                    placeholder="Street Address"
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                    placeholderTextColor={colors.gray400}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Apt. #"
                    value={formData.apt}
                    onChangeText={(text) => setFormData({ ...formData, apt: text })}
                    placeholderTextColor={colors.gray400}
                  />
                </View>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 2 }]}
                    placeholder="City"
                    value={formData.city}
                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                    placeholderTextColor={colors.gray400}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="State"
                    value={formData.state}
                    onChangeText={(text) => setFormData({ ...formData, state: text })}
                    placeholderTextColor={colors.gray400}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Zip"
                    value={formData.zip}
                    onChangeText={(text) => setFormData({ ...formData, zip: text })}
                    keyboardType="number-pad"
                    placeholderTextColor={colors.gray400}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Back"
            onPress={onBack}
            variant="outline"
            size="large"
            style={styles.backButton}
          />
          <PrimaryButton
            title="Next"
            onPress={handleNext}
            disabled={!isNextEnabled}
            size="large"
            style={styles.nextButton}
          />
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
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
