import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius, typography, shadows } from '../../shared/theme';
import { Header } from '../../shared/components/Header';
import { Card } from '../../shared/components/Card';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { ServiceProposalModal } from '../../shared/components/ServiceProposalModal';
import { ReviewServiceModal } from '../../shared/components/ReviewServiceModal';
import { SubmitOfferModal, OfferData } from '../components/SubmitOfferModal';
import { RequestDetailModal } from '../components/RequestDetailModal';
import { Request } from '../../types/request';
import { createAuthedSupabaseClient } from '../../config/supabase';
import {
  getWorkerRequests,
  WorkerAcceptedRequest,
  getClientFullName,
  formatAcceptedDate,
  formatScheduledDate,
  cancelWorkerJob,
  formatAvailabilityWindow,
  submitWorkerOffer,
} from '../../services/workerService';

export const WorkerRequestsScreen: React.FC = () => {
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  
  const [requests, setRequests] = useState<WorkerAcceptedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSubmitOfferModal, setShowSubmitOfferModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isCurrentSectionExpanded, setIsCurrentSectionExpanded] = useState(true);
  const [isPreviousSectionExpanded, setIsPreviousSectionExpanded] = useState(true);

  // Fetch requests from Supabase
  const fetchRequests = useCallback(async () => {
    if (!clerkUser) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      let token: string | null = null;
      try {
        token = await getToken({ template: 'supabase' });
      } catch {
        token = await getToken();
      }

      if (!token) {
        setError('Could not get auth token');
        setIsLoading(false);
        return;
      }

      const supabase = createAuthedSupabaseClient(token);
      const workerRequests = await getWorkerRequests(supabase, clerkUser.id);
      
      setRequests(workerRequests);
      setError(null);
    } catch (err: any) {
      console.error('[WorkerRequestsScreen] Error fetching requests:', err);
      setError(err.message || 'Failed to load requests');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [clerkUser, getToken]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);

  // Separate requests into current and previous
  const currentStatuses = ['inspection_scheduled', 'awaiting_client_confirmation', 'waiting_for_offer', 'job_scheduled', 'job_ongoing'];
  const previousStatuses = ['completed', 'cancelled'];
  
  const currentRequests = requests.filter(r => currentStatuses.includes(r.status));
  const previousRequests = requests.filter(r => previousStatuses.includes(r.status));

  // Convert WorkerAcceptedRequest to Request format for modals
  const convertToRequest = (req: WorkerAcceptedRequest): Request => ({
    id: req.id,
    public_id: req.public_id,
    title: req.title,
    description: req.description,
    serviceType: req.service_type,
    service_type: req.service_type,
    location: req.work_area_type,
    street_address: req.street_address,
    apt_suite_unit: req.apt_suite_unit,
    city: req.city,
    state: req.state,
    zip_code: req.zip_code,
    location_type: req.location_type,
    locationType: req.location_type || undefined,
    status: req.status as any,
    created_at: req.created_at,
    inspectionFee: req.inspection_fee,
    providerName: getClientFullName(req.client_first_name, req.client_last_name),
    scheduledDate: req.scheduled_date || undefined,
    scheduled_date: req.scheduled_date,
    scheduled_time_window: req.scheduled_time_window,
    address: req.street_address,
    apt: req.apt_suite_unit || undefined,
    // Include photos, videos, and availability data
    photos: req.photos || [],
    videos: req.videos || [],
    available_dates: req.available_dates || [],
    time_windows: req.time_windows || {},
    availabilityWindow: formatAvailabilityWindow(req.available_dates, req.time_windows),
    pets_on_site: req.pets_on_site,
    petsOnSite: req.pets_on_site,
    parking_notes: req.parking_notes,
    parkingNotes: req.parking_notes || undefined,
  });

  const toggleExpand = (requestId: string) => {
    setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
  };

  const handleViewProposal = (request: Request) => {
    setSelectedRequest(request);
    setShowProposalModal(true);
  };

  const handleAcceptProposal = () => {
    setShowProposalModal(false);
    Alert.alert(
      'Proposal Accepted',
      'The client has been notified. Your job is now in progress.',
      [{ text: 'OK' }]
    );
  };

  const handleDeclineProposal = () => {
    setShowProposalModal(false);
    Alert.alert(
      'Proposal Declined',
      'The client has been notified.',
      [{ text: 'OK' }]
    );
  };

  const handleCancelRequest = (request: Request) => {
    setSelectedRequest(request);
    setSelectedRequestId(request.id);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!clerkUser || !selectedRequestId) {
      setShowCancelModal(false);
      return;
    }

    setIsCancelling(true);

    try {
      let token: string | null = null;
      try {
        token = await getToken({ template: 'supabase' });
      } catch {
        token = await getToken();
      }

      if (!token) {
        Alert.alert('Error', 'Could not get auth token');
        setIsCancelling(false);
        setShowCancelModal(false);
        return;
      }

      const supabase = createAuthedSupabaseClient(token);
      const result = await cancelWorkerJob(supabase, selectedRequestId, clerkUser.id);

      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to cancel job');
        setIsCancelling(false);
        setShowCancelModal(false);
        return;
      }

      // Remove the cancelled request from the local state
      setRequests(prev => prev.filter(req => req.id !== selectedRequestId));
      
      setIsCancelling(false);
      setShowCancelModal(false);
      setSelectedRequest(null);
      setSelectedRequestId(null);

      Alert.alert(
        'Job Cancelled',
        'You have withdrawn from this job. The request is now available for other workers.',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('[WorkerRequestsScreen] Error cancelling job:', err);
      Alert.alert('Error', err.message || 'Failed to cancel job');
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

  const handleReviewService = (request: Request) => {
    setSelectedRequest(request);
    setShowReviewModal(true);
  };

  const handleViewRequest = (request: Request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleAcceptFromDetail = (requestId: string) => {
    // This is called when accepting from the detail modal
    // For already accepted requests, we just close the modal
    setShowDetailModal(false);
  };

  const handleSubmitReview = (rating: number, feedback: string) => {
    setShowReviewModal(false);
    Alert.alert(
      'Review Submitted',
      'Thank you for your feedback! Your review has been submitted successfully.',
      [{ text: 'OK' }]
    );
  };

  const handleSubmitOffer = (request: Request) => {
    setSelectedRequest(request);
    setShowSubmitOfferModal(true);
  };

  const handleOfferSubmit = async (offerData: OfferData) => {
    setShowSubmitOfferModal(false);
    if (!selectedRequest) return;
    try {
      const token = await getToken();
      const supabase = createAuthedSupabaseClient(token!);
      await submitWorkerOffer(supabase, selectedRequest.id, offerData);
      await fetchRequests(); // Refresh list
      Alert.alert(
        'Offer Submitted',
        'Your offer has been submitted successfully! The client will be notified.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to submit offer. Please try again.');
    }
  };

  const handleCompleteJob = (request: Request) => {
    Alert.alert(
      'Job Completed',
      'You have successfully completed the job.',
      [{ text: 'OK' }]
    );
  };

  const renderRequestCard = (req: WorkerAcceptedRequest) => {
    const isExpanded = expandedRequestId === req.id;
    const clientName = getClientFullName(req.client_first_name, req.client_last_name);
    const acceptedDate = formatAcceptedDate(req.accepted_at);
    const scheduledInfo = formatScheduledDate(req.scheduled_date, req.scheduled_time_window);
    const request = convertToRequest(req);
    
    return (
      <TouchableOpacity
        key={req.id}
        onPress={(e) => {
          e.stopPropagation();
          toggleExpand(req.id);
        }}
        activeOpacity={0.7}
      >
        <Card style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.requestTitle}>{req.title}</Text>
              <Text style={styles.requestId}>Req #{req.public_id || req.id.slice(0, 8)}</Text>
            </View>
            <View style={styles.headerRight}>
              <StatusBadge status={req.status as any} size="small" />
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  toggleExpand(req.id);
                }}
                style={styles.expandButtonTop}
              >
                <Text style={styles.expandIcon}>{isExpanded ? '∧' : '∨'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.requestDetails}>
            <View style={styles.detailRowTop}>
              <Feather name="briefcase" size={16} color={colors.primary} style={styles.detailIcon} />
              <Text style={styles.detailLabelInline}>Service: </Text>
              <Text style={styles.detailValueInline}>{req.service_type}</Text>
            </View>

            <View style={styles.detailRowTop}>
              <Feather name="calendar" size={16} color={colors.primary} style={styles.detailIcon} />
              <Text style={styles.detailLabelInline}>Accepted: </Text>
              <Text style={styles.detailValueInline}>{acceptedDate}</Text>
            </View>

            <View style={styles.detailRowTop}>
              <Feather name="user" size={16} color={colors.primary} style={styles.detailIcon} />
              <Text style={styles.detailLabelInline}>Client: </Text>
              <Text style={styles.detailValueInline}>{clientName}</Text>
            </View>
          </View>

          {/* Expanded Content */}
          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.dividerLine} />
              
              {/* Scheduled Info - No labels, just icons */}
              <View style={styles.scheduledSection}>
                <View style={styles.detailRowBottom}>
                  <View style={styles.iconContainer}>
                    <Feather name="clock" size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.detailTextExpanded}>{scheduledInfo}</Text>
                </View>
                <View style={styles.detailRowBottom}>
                  <View style={styles.iconContainer}>
                    <Feather name="map-pin" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.addressContainer}>
                    <Text style={styles.detailTextExpanded}>{req.street_address}</Text>
                    <Text style={styles.detailTextExpanded}>{req.city}, {req.state} {req.zip_code}</Text>
                  </View>
                </View>
              </View>
              
              {/* Pricing Details */}
              <View style={styles.pricingSection}>
                <View style={styles.pricingHeader}>
                  <Feather name="dollar-sign" size={20} color={colors.primary} />
                  <Text style={styles.pricingTitle}>Pricing Details</Text>
                </View>
                
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Inspection Fee</Text>
                  <Text style={styles.pricingValue}>${req.inspection_fee || 75}</Text>
                </View>
              </View>

              {/* Action Buttons - 2x2 Grid */}
              <View style={styles.actionButtonsGrid}>
                {req.status === 'inspection_scheduled' ? (
                  <>
                    <View style={styles.buttonGridRow}>
                      <TouchableOpacity 
                        style={styles.viewButton}
                        onPress={() => handleViewRequest(request)}
                      >
                        <Text style={styles.viewButtonText}>View</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.chatButtonOutline}>
                        <Text style={styles.chatButtonOutlineText}>Chat</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.buttonGridRow}>
                      <TouchableOpacity 
                        style={styles.cancelButtonGrid}
                        onPress={() => handleCancelRequest(request)}
                      >
                        <Text style={styles.cancelButtonGridText}>Cancel</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.offerButton}
                        onPress={() => handleSubmitOffer(request)}
                      >
                        <Text style={styles.offerButtonText}>Offer</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : req.status === 'waiting_for_offer' ? (
                  <>
                    <View style={styles.buttonGridRow}>
                      <TouchableOpacity 
                        style={styles.viewButton}
                        onPress={() => handleViewRequest(request)}
                      >
                        <Text style={styles.viewButtonText}>View</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.chatButtonOutline}>
                        <Text style={styles.chatButtonOutlineText}>Chat</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.buttonGridRow}>
                      <TouchableOpacity 
                        style={styles.cancelButtonGrid}
                        onPress={() => handleCancelRequest(request)}
                      >
                        <Text style={styles.cancelButtonGridText}>Cancel</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.offerButton}
                        onPress={() => handleSubmitOffer(request)}
                      >
                        <Text style={styles.offerButtonText}>Offer</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : req.status === 'job_scheduled' ? (
                  <TouchableOpacity 
                    style={styles.completeButton}
                    onPress={() => handleCompleteJob(request)}
                  >
                    <Feather name="check-circle" size={18} color={colors.white} />
                    <Text style={styles.completeButtonText}>Complete</Text>
                  </TouchableOpacity>
                ) : req.status === 'completed' ? (
                  <TouchableOpacity 
                    style={styles.reviewButton}
                    onPress={() => handleReviewService(request)}
                  >
                    <Feather name="star" size={18} color={colors.white} />
                    <Text style={styles.reviewButtonText}>Review Client</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Your Requests"
          subtitle="Track and manage your current and previous service requests"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Your Requests"
          subtitle="Track and manage your current and previous service requests"
        />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <Header
          title="Your Requests"
          subtitle="Track and manage your current and previous service requests"
        />

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
              <Text style={styles.collapseIcon}>{isCurrentSectionExpanded ? '∧' : '∨'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {isCurrentSectionExpanded && (
            <View style={styles.requestsList}>
              {currentRequests.length > 0 ? (
                currentRequests.map(renderRequestCard)
              ) : (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No current requests</Text>
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
              <Text style={styles.collapseIcon}>{isPreviousSectionExpanded ? '∧' : '∨'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {isPreviousSectionExpanded && (
            <View style={styles.requestsList}>
              {previousRequests.length > 0 ? (
                previousRequests.map(renderRequestCard)
              ) : (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No previous requests</Text>
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
          proposedPrice={selectedRequest.jobPrice || 350}
          providerName={selectedRequest.providerName || 'Client'}
          scheduledTime={
            selectedRequest.scheduledDate
              ? new Date(selectedRequest.scheduledDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : 'Not scheduled'
          }
          location={`${selectedRequest.address}${selectedRequest.apt ? `, Apt ${selectedRequest.apt}` : ''}`}
          serviceDescription={`Complete ${selectedRequest.serviceType} service including inspection, repairs, and any necessary replacements. All work will be performed by certified professionals using quality materials.`}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !isCancelling && setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContainer}>
            <Feather name="alert-triangle" size={48} color={colors.warning} style={styles.cancelModalIcon} />
            <Text style={styles.cancelModalTitle}>Withdraw from Job?</Text>
            <Text style={styles.cancelModalMessage}>
              Are you sure you want to withdraw from this job? The request will be made available for other workers to accept.
            </Text>
            
            <View style={styles.cancelModalButtons}>
              <TouchableOpacity
                style={styles.cancelModalButtonSecondary}
                onPress={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                <Text style={styles.cancelModalButtonSecondaryText}>Go Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.cancelModalButtonPrimary, isCancelling && styles.cancelModalButtonDisabled]}
                onPress={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.cancelModalButtonPrimaryText}>Yes, Withdraw</Text>
                )}
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
          serviceType={selectedRequest.serviceType ?? 'Not specified'}
          providerName={selectedRequest.providerName || 'Client'}
          completedDate={
            selectedRequest.scheduledDate
              ? new Date(selectedRequest.scheduledDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Not specified'
          }
        />
      )}

      {/* Submit Offer Modal */}
      {selectedRequest && (
        <SubmitOfferModal
          visible={showSubmitOfferModal}
          onClose={() => setShowSubmitOfferModal(false)}
          onSubmit={handleOfferSubmit}
          request={selectedRequest}
        />
      )}

      {/* Request Detail Modal - View full job details */}
      {selectedRequest && (
        <RequestDetailModal
          visible={showDetailModal}
          request={selectedRequest}
          distance={0}
          rating={0}
          onClose={() => setShowDetailModal(false)}
          onAccept={handleAcceptFromDetail}
          viewOnly={true}
        />
      )}
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
    alignItems: 'flex-start',
    marginBottom: spacing.md,
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
  },
  requestId: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  requestDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
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
  pricingSection: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pricingTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pricingLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  pricingValue: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  pricingDivider: {
    height: 1,
    backgroundColor: colors.gray300,
    marginVertical: spacing.sm,
  },
  pricingRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pricingLabelTotal: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  pricingValueTotal: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  actionButtons: {
    gap: spacing.md,
  },
  chatButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  chatButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  submitOfferButton: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  submitOfferButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
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
  deleteButton: {
    flex: 1,
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  deleteButtonText: {
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
  completeButton: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
  },
  estimatedCompletion: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
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
    justifyContent: 'center',
  },
  cancelModalButtonSecondaryText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cancelModalButtonPrimary: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalButtonPrimaryText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
  },
  headerLeft: {
    flex: 1,
  },
  scheduledSection: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    minWidth: 70,
  },
  detailLabelCompact: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    marginRight: spacing.xs,
  },
  detailRowIconOnly: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  detailTextExpanded: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  cancelModalIcon: {
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  cancelModalButtonDisabled: {
    backgroundColor: colors.gray400,
  },
  // New top section styles
  detailRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailIcon: {
    width: 24,
    marginRight: spacing.sm,
  },
  detailLabelInline: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  detailValueInline: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semiBold,
  },
  // New bottom section styles
  detailRowBottom: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: spacing.md,
    paddingTop: 2,
  },
  addressContainer: {
    flex: 1,
  },
  // 2x2 Button Grid styles
  actionButtonsGrid: {
    gap: spacing.md,
  },
  buttonGridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  viewButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    textAlign: 'center',
  },
  chatButtonOutline: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonOutlineText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    textAlign: 'center',
  },
  cancelButtonGrid: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonGridText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    textAlign: 'center',
  },
  offerButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    textAlign: 'center',
  },
});
