import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { PrimaryButton } from '../../shared/components/PrimaryButton';
import { RequestFormData } from '../../types/request';

interface CreateRequestScreenProps {
  serviceType: string;
  location?: string;
  onSubmit: (data: RequestFormData) => void;
  onBack: () => void;
}

export const CreateRequestScreen: React.FC<CreateRequestScreenProps> = ({
  serviceType,
  location,
  onSubmit,
  onBack,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RequestFormData>({
    title: '',
    description: '',
    photos: [],
    address: '',
    apt: '',
    city: '',
    state: '',
    zip: '',
    availabilityWindow: '',
    locationType: location || '',
    areaInLocation: '',
    petsOnSite: false,
    parkingNotes: '',
    paymentMethod: 'Apple Pay',
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.title && formData.description;
    }
    if (step === 2) {
      return formData.address && formData.city && formData.state && formData.zip;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Request
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Step 1: Title & Description */}
            {step === 1 && (
              <>
                <View style={styles.formSection}>
                  <Text style={styles.stepLabel}>1. Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex. Leaking kitchen sink"
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    placeholderTextColor={colors.gray400}
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.stepLabel}>2. Add Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Ex. The pipe under the kitchen sink has been leaking for 3 days. Water pools under the cabinet. I turned off the water supply temporarily."
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    placeholderTextColor={colors.gray400}
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.stepLabel}>3. Add Photos/Videos</Text>
                  <TouchableOpacity style={styles.uploadButton}>
                    <Text style={styles.uploadIcon}>↑</Text>
                    <Text style={styles.uploadText}>Upload media</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <>
                <View style={styles.formSection}>
                  <View style={styles.addressHeader}>
                    <Text style={styles.stepLabel}>4. Address</Text>
                    <View style={styles.checkboxRow}>
                      <View style={styles.checkbox} />
                      <Text style={styles.checkboxLabel}>Same as saved</Text>
                    </View>
                  </View>
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

                <View style={styles.formSection}>
                  <Text style={styles.stepLabel}>5. Availability Window</Text>
                  <TouchableOpacity style={styles.input}>
                    <Text style={styles.inputPlaceholder}>Pick a Window</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.stepLabel}>6. Type and Location</Text>
                  <View style={styles.row}>
                    <TouchableOpacity style={[styles.input, { flex: 1 }]}>
                      <Text style={styles.inputPlaceholder}>Location Type</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.input, { flex: 1 }]}>
                      <Text style={styles.inputPlaceholder}>Area in Location</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* Step 3: Misc & Payment */}
            {step === 3 && (
              <>
                <View style={styles.formSection}>
                  <Text style={styles.stepLabel}>7. Misc</Text>
                  <Text style={styles.subLabel}>Pets on site</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={styles.radioButton}
                      onPress={() => setFormData({ ...formData, petsOnSite: true })}
                    >
                      <View style={[styles.radio, formData.petsOnSite && styles.radioSelected]} />
                      <Text style={styles.radioLabel}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.radioButton}
                      onPress={() => setFormData({ ...formData, petsOnSite: false })}
                    >
                      <View style={[styles.radio, !formData.petsOnSite && styles.radioSelected]} />
                      <Text style={styles.radioLabel}>No</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Parking Notes"
                    value={formData.parkingNotes}
                    onChangeText={(text) => setFormData({ ...formData, parkingNotes: text })}
                    placeholderTextColor={colors.gray400}
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.stepLabel}>8. Price & Payment</Text>
                  <View style={styles.priceCard}>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Inspection Fee</Text>
                      <Text style={styles.priceAmount}>$19</Text>
                    </View>
                    <Text style={styles.paymentLabel}>Select Payment Method</Text>
                    <View style={styles.paymentMethod}>
                      <Text style={styles.paymentMethodText}>Apple Pay</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Back"
            onPress={handleBack}
            variant="outline"
            size="large"
            style={styles.backButton}
          />
          <PrimaryButton
            title={step === 3 ? 'Review' : 'Next'}
            onPress={handleNext}
            disabled={!isStepValid()}
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
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 32,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textAlign: 'center',
    marginRight: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  formSection: {
    gap: spacing.md,
  },
  stepLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  subLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    marginTop: spacing.sm,
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
  textArea: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  uploadButton: {
    height: 100,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray300,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray50,
  },
  uploadIcon: {
    fontSize: 32,
    color: colors.gray400,
    marginBottom: spacing.xs,
  },
  uploadText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray400,
  },
  checkboxLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  inputPlaceholder: {
    color: colors.gray400,
    fontSize: typography.fontSize.base,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginVertical: spacing.sm,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray400,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  priceCard: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  priceLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
  },
  priceAmount: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  paymentLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  paymentMethod: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  paymentMethodText: {
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    textAlign: 'center',
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
