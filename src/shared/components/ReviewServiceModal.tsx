import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

interface ReviewServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
  serviceType: string;
  providerName: string;
  completedDate: string;
}

export const ReviewServiceModal: React.FC<ReviewServiceModalProps> = ({
  visible,
  onClose,
  onSubmit,
  serviceType,
  providerName,
  completedDate,
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, feedback);
      // Reset form
      setRating(0);
      setFeedback('');
    }
  };

  const handleCancel = () => {
    setRating(0);
    setFeedback('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Review Service</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <ScrollView 
          style={styles.scrollContent} 
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Service Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>
                {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service Provider</Text>
              <Text style={styles.detailValue}>{providerName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Completed</Text>
              <Text style={styles.detailValue}>{completedDate}</Text>
            </View>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>How was your experience?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Feather
                    name="star"
                    size={48}
                    color={star <= rating ? colors.warning : colors.gray300}
                    style={star <= rating ? styles.starFilled : styles.starEmpty}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Feedback Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>
              Share your feedback <Text style={styles.optional}>(Optional)</Text>
            </Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Tell us about your experience with this service..."
              placeholderTextColor={colors.gray400}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              rating === 0 && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={rating === 0}
          >
            <Text style={[
              styles.submitButtonText,
              rating === 0 && styles.submitButtonTextDisabled,
            ]}>
              Submit Review
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
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.gray300,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailRow: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  ratingSection: {
    marginBottom: spacing.lg,
  },
  ratingTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  starFilled: {
    // Filled stars handled by color prop
  },
  starEmpty: {
    opacity: 1,
  },
  feedbackSection: {
    marginBottom: spacing.lg,
  },
  feedbackTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  optional: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.normal,
  },
  feedbackInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.gray300,
    padding: spacing.lg,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    minHeight: 150,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  submitButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  submitButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  submitButtonTextDisabled: {
    color: colors.gray500,
  },
});
