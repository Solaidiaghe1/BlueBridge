import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { Header } from '../../shared/components/Header';
import { WorkerAvailableRequest, createAuthedSupabaseClient } from '../../config/supabase';
import { 
  getAvailableRequestsForWorker, 
  formatAvailabilityWindow, 
  getClientFullName 
} from '../../services/workerService';
import { RequestDetailModal } from '../components/RequestDetailModal';
import { FilterModal, FilterOptions } from '../components/FilterModal';
import { Request } from '../../types/request';

export const WorkerSearchScreen: React.FC = () => {
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [requests, setRequests] = useState<WorkerAvailableRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    serviceTypes: [],
    workAreaTypes: [],
    maxDistance: null,
  });

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
      const availableRequests = await getAvailableRequestsForWorker(supabase, clerkUser.id);
      
      setRequests(availableRequests);
      setError(null);
    } catch (err: any) {
      console.error('[WorkerSearchScreen] Error fetching requests:', err);
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

  const handleRequestPress = (request: WorkerAvailableRequest) => {
    // Convert WorkerAvailableRequest to Request format for modal
    const requestForModal: Request = {
      id: request.id,
      public_id: request.public_id,
      title: request.title,
      description: request.description,
      serviceType: request.service_type,
      service_type: request.service_type,
      location: request.work_area_type,
      location_type: request.location_type,
      street_address: request.street_address,
      city: request.city,
      state: request.state,
      zip_code: request.zip_code,
      available_dates: request.available_dates,
      time_windows: request.time_windows,
      pets_on_site: request.pets_on_site,
      parking_notes: request.parking_notes,
      photos: request.photos,
      videos: request.videos,
      inspectionFee: request.inspection_fee,
      status: request.status as any,
      created_at: request.created_at,
      providerName: getClientFullName(request.client_first_name, request.client_last_name),
      availabilityWindow: formatAvailabilityWindow(request.available_dates, request.time_windows),
    };
    setSelectedRequest(requestForModal);
    setShowDetailModal(true);
  };

  const handleAcceptRequest = (requestId: string) => {
    // Close the detail modal first
    setShowDetailModal(false);
    setSelectedRequest(null);
    
    // Remove the accepted request from the list
    setRequests(prev => prev.filter(req => req.id !== requestId));
    console.log('Accepted request:', requestId);
  };

  const handleApplyFilters = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  // Filter requests based on selected filters (client-side filtering)
  const filteredRequests = useMemo(() => {
    const hasServiceFilter = filters.serviceTypes.length > 0;
    const hasWorkAreaFilter = filters.workAreaTypes.length > 0;
    const hasDistanceFilter = filters.maxDistance !== null;

    // If no filters, show all requests
    if (!hasServiceFilter && !hasWorkAreaFilter && !hasDistanceFilter) {
      return requests;
    }

    return requests.filter(request => {
      // Get the service type from the request (could be from service_type text or service name)
      const requestServiceType = request.service_type?.toLowerCase() || '';
      // Get the work area type from the request
      const requestWorkAreaType = request.work_area_type?.toLowerCase() || '';

      // Check if matches service filter
      const matchesService = !hasServiceFilter || filters.serviceTypes.some(
        serviceType => requestServiceType.toLowerCase().includes(serviceType.toLowerCase()) ||
                       serviceType.toLowerCase().includes(requestServiceType.toLowerCase())
      );

      // Check if matches work area filter
      const matchesWorkArea = !hasWorkAreaFilter || filters.workAreaTypes.some(
        areaType => requestWorkAreaType.toLowerCase().includes(areaType.toLowerCase()) ||
                    areaType.toLowerCase().includes(requestWorkAreaType.toLowerCase())
      );

      // Distance filter (placeholder - requires geolocation implementation)
      // For now, we'll pass all requests through the distance filter
      // TODO: Implement actual distance calculation when worker location is available
      const matchesDistance = !hasDistanceFilter || true;

      // Use OR logic: show if matches either filter (when both are active)
      // Or matches the active filter (when only one is active)
      if (hasServiceFilter && hasWorkAreaFilter) {
        return (matchesService || matchesWorkArea) && matchesDistance;
      }
      return matchesService && matchesWorkArea && matchesDistance;
    });
  }, [requests, filters]);

  const activeFilterCount = filters.serviceTypes.length + filters.workAreaTypes.length + (filters.maxDistance !== null ? 1 : 0);

  const renderRequestCard = (request: WorkerAvailableRequest) => {
    const clientName = getClientFullName(request.client_first_name, request.client_last_name);
    const availabilityWindow = formatAvailabilityWindow(request.available_dates, request.time_windows);

    return (
      <TouchableOpacity
        key={request.id}
        style={styles.requestCard}
        onPress={() => handleRequestPress(request)}
        activeOpacity={0.7}
      >
        {/* Header Row */}
        <View style={styles.cardHeader}>
          <Text style={styles.serviceType}>{request.service_type}</Text>
          <Text style={styles.distance}>N/A</Text>
        </View>

        {/* Issue Title */}
        <Text style={styles.issueTitle}>{request.title}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Info Rows */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{clientName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Availability Window:</Text>
          <Text style={styles.infoValue}>{availabilityWindow}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rating:</Text>
          <View style={styles.ratingContainer}>
            <Feather name="star" size={16} color="#FFD700" style={{ marginRight: 4 }} />
            <Text style={styles.ratingValue}>N/A</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Find a Client" showNotification notificationCount={2} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading available requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Find a Client" showNotification notificationCount={2} />

      <View style={styles.content}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Available Requests</Text>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Feather 
              name="sliders" 
              size={20} 
              color={activeFilterCount > 0 ? colors.white : colors.textPrimary} 
            />
            <Text style={[
              styles.filterButtonText,
              activeFilterCount > 0 && styles.filterButtonTextActive
            ]}>
              Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider under header */}
        <View style={styles.headerDivider} />

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={24} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Requests List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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
          {filteredRequests.length > 0 ? (
            filteredRequests.map(renderRequestCard)
          ) : !error ? (
            <View style={styles.emptyState}>
              <Feather name="search" size={48} color={colors.gray400} />
              <Text style={styles.emptyStateText}>
                {activeFilterCount > 0 
                  ? 'No requests match your filters'
                  : 'No available requests at the moment'
                }
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {activeFilterCount > 0
                  ? 'Try adjusting your filter criteria'
                  : 'Requests matching your services and work areas will appear here'
                }
              </Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={() => setFilters({ serviceTypes: [], workAreaTypes: [], maxDistance: null })}
                >
                  <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </ScrollView>
      </View>

      {/* Request Detail Modal */}
      <RequestDetailModal
        visible={showDetailModal}
        request={selectedRequest}
        distance={0}
        rating={0}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRequest(null);
        }}
        onAccept={handleAcceptRequest}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginBottom: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  requestCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  serviceType: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  distance: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  issueTitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray600,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.gray600,
    flex: 1,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
    textAlign: 'right',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  ratingValue: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.base,
    color: colors.gray600,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.gray600,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  retryButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
  },
  clearFiltersButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  clearFiltersButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
  },
});
