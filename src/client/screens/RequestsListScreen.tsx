import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../shared/theme';
import { Header } from '../../shared/components/Header';
import { Card } from '../../shared/components/Card';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { getCurrentRequests, getPreviousRequests } from '../../services/mockRequests';
import { Request } from '../../types/request';

interface RequestsListScreenProps {
  onRequestPress: (requestId: string) => void;
}

export const RequestsListScreen: React.FC<RequestsListScreenProps> = ({
  onRequestPress,
}) => {
  const currentRequests = getCurrentRequests();
  const previousRequests = getPreviousRequests();

  const renderRequestCard = (request: Request) => (
    <TouchableOpacity
      key={request.id}
      onPress={() => onRequestPress(request.id)}
      activeOpacity={0.7}
    >
      <Card style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestTitle}>{request.serviceType.toUpperCase()}</Text>
          <StatusBadge status={request.status} size="small" />
        </View>

        <Text style={styles.requestId}>Request #{request.id}</Text>

        <View style={styles.requestDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👤</Text>
            <Text style={styles.detailText}>
              {request.providerName || 'Waiting for assignment'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>
              {request.scheduledDate
                ? new Date(request.scheduledDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : 'Not scheduled'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>
              {request.address}
              {request.apt ? `, Apt ${request.apt}` : ''}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.expandButton}>
          <Text style={styles.expandIcon}>∨</Text>
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header
          title="Your Requests"
          subtitle="Track and manage your current and previous service requests"
        />

        {/* Current Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Requests</Text>
            {currentRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{currentRequests.length}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.collapseButton}>
              <Text style={styles.collapseIcon}>∧</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.requestsList}>
            {currentRequests.length > 0 ? (
              currentRequests.map(renderRequestCard)
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No current requests</Text>
              </Card>
            )}
          </View>
        </View>

        {/* Previous Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Previous Requests</Text>
            {previousRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{previousRequests.length}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.collapseButton}>
              <Text style={styles.collapseIcon}>∧</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.requestsList}>
            {previousRequests.length > 0 ? (
              previousRequests.map(renderRequestCard)
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No previous requests</Text>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  collapseButton: {
    marginLeft: 'auto',
    padding: spacing.sm,
  },
  collapseIcon: {
    fontSize: typography.fontSize.xl,
    color: colors.textSecondary,
  },
  requestsList: {
    gap: spacing.md,
  },
  requestCard: {
    padding: spacing.lg,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  requestTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  requestId: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  requestDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailIcon: {
    fontSize: typography.fontSize.base,
  },
  detailText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  expandButton: {
    alignSelf: 'center',
    padding: spacing.sm,
  },
  expandIcon: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
});
