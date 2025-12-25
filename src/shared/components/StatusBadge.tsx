import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RequestStatus } from '../../types/request';
import { JobStatus } from '../../types/job';

interface StatusBadgeProps {
  status: RequestStatus | JobStatus | string;
  size?: 'small' | 'medium' | 'large';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending_approval':
        return {
          label: 'Pending Approval',
          backgroundColor: colors.statusPending,
          textColor: colors.statusPendingText,
        };
      case 'job_ongoing':
      case 'accepted':
      case 'on_the_way':
      case 'arrived':
        return {
          label: status === 'job_ongoing' ? 'Job Ongoing' : 
                 status === 'on_the_way' ? 'On The Way' :
                 status === 'arrived' ? 'Arrived' : 'Accepted',
          backgroundColor: colors.statusOngoing,
          textColor: colors.statusOngoingText,
        };
      case 'completed':
        return {
          label: 'Completed',
          backgroundColor: colors.statusCompleted,
          textColor: colors.statusCompletedText,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          backgroundColor: colors.statusCancelled,
          textColor: colors.statusCancelledText,
        };
      case 'available':
        return {
          label: 'Available',
          backgroundColor: colors.info + '20',
          textColor: colors.info,
        };
      default:
        return {
          label: status,
          backgroundColor: colors.gray200,
          textColor: colors.gray700,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View
      style={[
        styles.badge,
        styles[`badge_${size}`],
        { backgroundColor: config.backgroundColor },
      ]}
    >
      <Text
        style={[
          styles.text,
          styles[`text_${size}`],
          { color: config.textColor },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  badge_small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badge_medium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badge_large: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  text: {
    fontWeight: typography.fontWeight.semiBold,
  },
  text_small: {
    fontSize: typography.fontSize.xs,
  },
  text_medium: {
    fontSize: typography.fontSize.sm,
  },
  text_large: {
    fontSize: typography.fontSize.base,
  },
});
