import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { Header } from '../../shared/components/Header';
import { Card } from '../../shared/components/Card';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { ServiceProposalModal } from '../../shared/components/ServiceProposalModal';
import { ReviewServiceModal } from '../../shared/components/ReviewServiceModal';
import { Request } from '../../types/request';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { createAuthedSupabaseClient } from '../../config/supabase';
import { useUserSync } from '../../context/UserSyncContext';

interface RequestsListScreenProps {
  onRequestPress: (requestId: string) => void;
  /** When true, the screen will refetch requests (used by the custom tab navigator). */
  isActive?: boolean;
}

export interface RequestsListScreenHandle {
  refresh: () => void;
}

const CURRENT_STATUSES = new Set([
  'searching_for_worker',
  'inspection_scheduled',
  'awaiting_client_confirmation',
  'waiting_for_offer',
  'job_scheduled',
]);

const isCurrentRequest = (status: string) => CURRENT_STATUSES.has(status);

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const formatAddressSummary = (r: Request) => {
  const line1 = r.street_address;
  const apt = r.apt_suite_unit ? `, ${r.apt_suite_unit}` : '';
  const line2 = `${r.city}, ${r.state} ${r.zip_code}`;
  return `${line1}${apt} • ${line2}`;
};

// Format a single date for display (e.g., "Jan 12")
const formatShortDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

// Build an array of "Jan 12 Morning" style strings from dates + time_windows
const getDateTimeSlots = (r: Request): string[] => {
  const dates = r.available_dates ?? [];
  const timeWindows = (r.time_windows ?? {}) as Record<string, string[]>;
  
  // Convert 24h time to 12h AM/PM format
  const formatTime = (time24: string): string => {
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // Convert 0 to 12, 13 to 1, etc.
    return `${hour}:${minute} ${ampm}`;
  };
  
  // Map time window to friendly format with AM/PM
  const formatTimeWindow = (window: string): string => {
    // Handle named slots (morning, afternoon, evening)
    const lower = window.toLowerCase();
    if (lower === 'morning') return '8:00 AM - 12:00 PM';
    if (lower === 'afternoon') return '12:00 PM - 4:00 PM';
    if (lower === 'evening') return '4:00 PM - 8:00 PM';
    
    // Handle range format like "8:00-12:00"
    if (window.includes('-')) {
      const [start, end] = window.split('-');
      return `${formatTime(start.trim())} - ${formatTime(end.trim())}`;
    }
    
    return window;
  };
  
  const slots: string[] = [];
  
  for (const dateStr of dates) {
    const windows = timeWindows[dateStr] ?? [];
    if (windows.length > 0) {
      for (const window of windows) {
        slots.push(`${formatShortDate(dateStr)} ${formatTimeWindow(window)}`);
      }
    } else {
      slots.push(formatShortDate(dateStr));
    }
  }
  
  return slots;
};

export const RequestsListScreen = React.forwardRef<RequestsListScreenHandle, RequestsListScreenProps>(
  ({ onRequestPress, isActive }, ref) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { supabaseUser } = useUserSync();

  const [requests, setRequests] = React.useState<Request[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [expandedRequestId, setExpandedRequestId] = React.useState<string | null>(null);
  const [showProposalModal, setShowProposalModal] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<Request | null>(null);

  // Exact empty-state behavior: show only after a user expands a section.
  const [isCurrentSectionExpanded, setIsCurrentSectionExpanded] = React.useState(false);
  const [isPreviousSectionExpanded, setIsPreviousSectionExpanded] = React.useState(false);

  // Prevents spamming fetches if the user bounces tabs quickly.
  const lastFetchedRef = React.useRef(0);

  const toggleExpand = (requestId: string) => {
    setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
  };

  const fetchRequests = React.useCallback(async () => {
    console.log('[RequestsList] fetchRequests called, user.id=', user?.id, 'supabaseUser.id=', supabaseUser?.id);

    // Need the Clerk user id for RLS and the Supabase user for basic readiness (client FK).
    if (!user?.id || !supabaseUser?.id) {
      console.log('[RequestsList] aborting fetch: missing user or supabaseUser');
      return;
    }

    const now = Date.now();
    if (now - lastFetchedRef.current < 1500) {
      console.log('[RequestsList] debounced, skipping fetch');
      return;
    }
    lastFetchedRef.current = now;

    setIsLoading(true);
    setLoadError(null);

    try {
      let token: string | null | undefined;
      try {
        token = await getToken({ template: 'supabase' });
        console.log('[RequestsList] got supabase template token');
      } catch (templateErr) {
        console.warn('[RequestsList] supabase template failed, falling back:', templateErr);
        token = await getToken();
      }

      if (!token) {
        console.error('[RequestsList] No token available');
        throw new Error('Missing auth token');
      }

      const sb = createAuthedSupabaseClient(token);

      // Clerk user id is the RLS enforcement key on rows (client_clerk_id == jwt.sub)
      const clerkId = user.id;
      console.log('[RequestsList] querying requests for clerkId=', clerkId);

      const { data, error } = await sb
        .from('requests')
        .select(
          'id, public_id, service_type, title, description, status, created_at, updated_at, street_address, apt_suite_unit, city, state, zip_code, location_type, available_dates, time_windows, photos, videos'
        )
        // Important: filter using the same key the RLS policy uses.
        .eq('client_clerk_id', clerkId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[RequestsList] Supabase query error:', error);
        throw error;
      }

      const rows = ((data as any) ?? []) as Request[];
      console.log('[RequestsList] fetched', rows.length, 'requests');
      if (rows.length > 0) {
        console.log('[RequestsList] first row:', JSON.stringify(rows[0], null, 2));
      }
      setRequests(rows);
    } catch (e: any) {
      console.error('[RequestsList] fetchRequests error:', e);
      setLoadError(e?.message || 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  }, [getToken, user?.id, supabaseUser?.id]);

  // Fetch on first mount (once we have supabaseUser)
  React.useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Refetch whenever the tab becomes active (custom navigator; no react-navigation focus events)
  React.useEffect(() => {
    if (isActive) fetchRequests();
  }, [isActive, fetchRequests]);

  // Expose an imperative refresh() for the navigator to call after submit, if desired.
  React.useImperativeHandle(ref, () => ({ refresh: fetchRequests }), [fetchRequests]);

  const currentRequests = React.useMemo(
    () => requests.filter(r => isCurrentRequest(String(r.status))),
    [requests]
  );

  const previousRequests = React.useMemo(
    () => requests.filter(r => !isCurrentRequest(String(r.status))),
    [requests]
  );

  const handleViewProposal = (request: Request) => {
    setSelectedRequest(request);
    setShowProposalModal(true);
  };

  const handleAcceptProposal = () => {
    setShowProposalModal(false);
    Alert.alert('Proposal Accepted', 'The service provider has been notified.', [{ text: 'OK' }]);
  };

  const handleDeclineProposal = () => {
    setShowProposalModal(false);
    Alert.alert('Proposal Declined', 'The service provider has been notified.', [{ text: 'OK' }]);
  };

  const handleCancelRequest = (request: Request) => {
    setSelectedRequest(request);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    Alert.alert('Request Cancelled', 'Your request has been cancelled successfully.', [{ text: 'OK' }]);
  };

  const handleReviewService = (request: Request) => {
    setSelectedRequest(request);
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    setShowReviewModal(false);
    Alert.alert('Review Submitted', 'Thank you for your feedback!', [{ text: 'OK' }]);
  };

  const renderRequestCard = (request: Request) => {
    const isExpanded = expandedRequestId === request.id;

    const displayId = request.public_id ? String(request.public_id) : request.id;

    return (
      <TouchableOpacity
        key={request.id}
        onPress={(e) => {
          e.stopPropagation();
          toggleExpand(request.id);
        }}
        activeOpacity={0.7}
      >
        <Card style={styles.requestCard}>
          {/* Row 1: Title + Status + Arrow */}
          <View style={styles.requestHeader}>
            <Text style={styles.requestTitle}>{(request.service_type || 'REQUEST').toUpperCase()}</Text>
            <View style={styles.headerRight}>
              <StatusBadge status={request.status} size="small" />
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  toggleExpand(request.id);
                }}
                style={styles.expandButtonTop}
              >
                <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Full-width rows for ID and date */}
          <Text style={styles.requestId}>Req #{displayId}</Text>
          <Text style={styles.createdAt}>Created {formatDate(request.created_at)}</Text>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.dividerLine} />

              {/* Address */}
              <Text style={styles.addressText}>{formatAddressSummary(request)}</Text>

              {/* Date/time slots displayed inline with separators */}
              <Text style={styles.dateTimeSlotsText}>
                {getDateTimeSlots(request).join(' | ') || 'No availability set'}
              </Text>

              <View style={styles.actionButtons}>
                {/* Stub actions kept for now (backend workflow pending) */}
                {String(request.status) === 'searching_for_worker' && (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.editButton} onPress={() => onRequestPress(request.id)}>
                      <Feather name="edit-2" size={18} color={colors.white} />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelRequest(request)}
                    >
                      <Feather name="x" size={18} color={colors.white} />
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {String(request.status) === 'completed' || String(request.status) === 'cancelled' ? (
                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => handleReviewService(request)}
                  >
                    <Feather name="star" size={18} color={colors.white} />
                    <Text style={styles.reviewButtonText}>Review Service</Text>
                  </TouchableOpacity>
                ) : null}

                {/* Legacy modals (will be removed when offer/proposal system is implemented) */}
                {String(request.status) === 'pending_approval' && (
                  <TouchableOpacity
                    style={styles.proposalButton}
                    onPress={() => handleViewProposal(request)}
                  >
                    <Text style={styles.proposalButtonText}>View Proposal</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header
          title="Your Requests"
          subtitle="Track and manage your current and previous service requests"
        />

        {loadError ? (
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>{loadError}</Text>
            </Card>
          </View>
        ) : null}

        {/* Current Requests */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setIsCurrentSectionExpanded(!isCurrentSectionExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>Current Requests</Text>
            {currentRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{currentRequests.length}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.collapseButton}
              onPress={() => setIsCurrentSectionExpanded(!isCurrentSectionExpanded)}
            >
              <Feather name={isCurrentSectionExpanded ? 'chevron-up' : 'chevron-down'} size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </TouchableOpacity>

          {isCurrentSectionExpanded && (
            <View style={styles.requestsList}>
              {isLoading ? (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>Loading…</Text>
                </Card>
              ) : currentRequests.length > 0 ? (
                currentRequests.map(renderRequestCard)
              ) : (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No Request Found</Text>
                </Card>
              )}
            </View>
          )}
        </View>

        {/* Previous Requests */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setIsPreviousSectionExpanded(!isPreviousSectionExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>Previous Requests</Text>
            {previousRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{previousRequests.length}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.collapseButton}
              onPress={() => setIsPreviousSectionExpanded(!isPreviousSectionExpanded)}
            >
              <Feather name={isPreviousSectionExpanded ? 'chevron-up' : 'chevron-down'} size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </TouchableOpacity>

          {isPreviousSectionExpanded && (
            <View style={styles.requestsList}>
              {isLoading ? (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>Loading…</Text>
                </Card>
              ) : previousRequests.length > 0 ? (
                previousRequests.map(renderRequestCard)
              ) : (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No Request Found</Text>
                </Card>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Service Proposal Modal */}
      {selectedRequest && (
        <ServiceProposalModal
          visible={showProposalModal}
          onClose={() => setShowProposalModal(false)}
          onAccept={handleAcceptProposal}
          onDecline={handleDeclineProposal}
          proposedPrice={350}
          providerName={'Service Provider'}
          scheduledTime={'Not scheduled'}
          location={formatAddressSummary(selectedRequest)}
          serviceDescription={`Complete ${(selectedRequest.service_type || 'service').toString()} service including inspection and any necessary repairs.`}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContainer}>
            <Text style={styles.cancelModalTitle}>Cancel Request?</Text>
            <Text style={styles.cancelModalMessage}>
              Are you sure you want to cancel this request? There will be no fee.
            </Text>

            <View style={styles.cancelModalButtons}>
              <TouchableOpacity
                style={styles.cancelModalButtonSecondary}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.cancelModalButtonSecondaryText}>Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelModalButtonPrimary}
                onPress={handleConfirmCancel}
              >
                <Text style={styles.cancelModalButtonPrimaryText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Review Service Modal */}
      {selectedRequest && (
        <ReviewServiceModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleSubmitReview}
          serviceType={(selectedRequest.service_type || 'Service') as any}
          providerName={'Service Provider'}
          completedDate={formatDate(selectedRequest.created_at)}
        />
      )}
    </SafeAreaView>
  );
});

RequestsListScreen.displayName = 'RequestsListScreen';

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
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requestTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  requestId: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  createdAt: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  addressText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.md,
  },
  dateTimeSlotsText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  expandButtonTop: {
    padding: spacing.xs,
  },
  expandIcon: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  expandedContent: {
    marginTop: spacing.md,
  },
  dividerLine: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.md,
  },
  actionButtons: {
    gap: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  editButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
  },
  proposalButton: {
    backgroundColor: '#C2410C',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  proposalButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
  },
  reviewButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  reviewButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  cancelModalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  cancelModalTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  cancelModalMessage: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  cancelModalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelModalButtonSecondary: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
  },
  cancelModalButtonSecondaryText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  cancelModalButtonPrimary: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  cancelModalButtonPrimaryText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
});
