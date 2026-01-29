import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

interface ServiceProposalModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  proposedPrice: number;
  providerName: string;
  scheduledTime: string;
  location: string;
  serviceDescription: string;
}

export const ServiceProposalModal: React.FC<ServiceProposalModalProps> = ({
  visible,
  onClose,
  onAccept,
  onDecline,
  proposedPrice,
  providerName,
  scheduledTime,
  location,
  serviceDescription,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Service Proposal</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Proposed Price Section */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Proposed Price</Text>
              <Text style={styles.priceAmount}>${proposedPrice}</Text>
              <Text style={styles.priceSubtext}>One-time service fee</Text>
            </View>

            {/* Service Details Section */}
            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Service Details</Text>

              <View style={styles.detailRow}>
                <Feather name="user" size={20} color={colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Service Provider</Text>
                  <Text style={styles.detailValue}>{providerName}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Feather name="calendar" size={20} color={colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Scheduled Time</Text>
                  <Text style={styles.detailValue}>{scheduledTime}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Feather name="map-pin" size={20} color={colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{location}</Text>
                </View>
              </View>
            </View>

            {/* What's Included Section */}
            <View style={styles.includedContainer}>
              <Text style={styles.sectionTitle}>What's Included</Text>
              <Text style={styles.includedText}>{serviceDescription}</Text>
            </View>

            {/* Info Message */}
            <View style={styles.infoContainer}>
              <Feather name="info" size={18} color={colors.primary} />
              <Text style={styles.infoText}>
                You won't be charged until the service is completed. You can cancel anytime before the scheduled appointment.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
              <Feather name="x-circle" size={20} color={colors.white} />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Feather name="check-circle" size={20} color={colors.white} />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
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
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  priceContainer: {
    backgroundColor: '#E0F2FE', // Light blue background
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: '#0EA5E9', // Blue border
  },
  priceLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  priceAmount: {
    fontSize: 56,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: -2,
  },
  priceSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  detailsContainer: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  includedContainer: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  includedText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  infoContainer: {
    backgroundColor: '#E0F2FE', // Light blue background
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  declineButton: {
    flex: 1,
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.full,
  },
  declineButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#16A34A', // Green color
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.full,
  },
  acceptButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
});
