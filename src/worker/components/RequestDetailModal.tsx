import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { Request } from '../../types/request';
import { MediaViewerModal, MediaItem } from '../../shared/components/MediaViewerModal';
import { AcceptJobModal } from './AcceptJobModal';
import { createAuthedSupabaseClient } from '../../config/supabase';
import { acceptJob, getWorkerByClerkId, formatTimeWindowDisplay } from '../../services/workerService';

interface RequestDetailModalProps {
  visible: boolean;
  request: Request | null;
  distance: number;
  rating: number;
  onClose: () => void;
  onAccept: (requestId: string) => void;
  viewOnly?: boolean; // When true, shows only Back button (for already accepted requests)
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  visible,
  request,
  distance,
  rating,
  onClose,
  onAccept,
  viewOnly = false,
}) => {
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  
  const [message, setMessage] = useState('');
  const [mediaViewerVisible, setMediaViewerVisible] = useState(false);
  const [mediaViewerItems, setMediaViewerItems] = useState<MediaItem[]>([]);
  const [mediaViewerInitialIndex, setMediaViewerInitialIndex] = useState(0);
  const [showAcceptJobModal, setShowAcceptJobModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request) return null;

  const handleAcceptPress = () => {
    // Open the date/time selection modal
    setShowAcceptJobModal(true);
  };

  const handleConfirmAccept = async (selectedDate: string, selectedTimeWindow: string) => {
    if (!clerkUser) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      let token: string | null = null;
      try {
        token = await getToken({ template: 'supabase' });
      } catch {
        token = await getToken();
      }

      if (!token) {
        Alert.alert('Error', 'Could not get auth token');
        setIsSubmitting(false);
        return;
      }

      const supabase = createAuthedSupabaseClient(token);
      
      // Get worker ID
      const worker = await getWorkerByClerkId(supabase, clerkUser.id);
      if (!worker) {
        Alert.alert('Error', 'Worker profile not found');
        setIsSubmitting(false);
        return;
      }

      // Accept the job
      const result = await acceptJob(
        supabase,
        request.id,
        worker.id,
        clerkUser.id,
        selectedDate,
        selectedTimeWindow
      );

      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to accept job');
        setIsSubmitting(false);
        return;
      }

      // Success - close modals and notify parent
      setShowAcceptJobModal(false);
      setIsSubmitting(false);
      onAccept(request.id);
      setMessage('');
      onClose();

      // Format the time window for display
      const formattedTimeWindow = formatTimeWindowDisplay(selectedTimeWindow);

      Alert.alert(
        'Job Accepted!',
        `You've scheduled an inspection for ${selectedDate} (${formattedTimeWindow}). The client has been notified.`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('[RequestDetailModal] Error accepting job:', err);
      Alert.alert('Error', err.message || 'Failed to accept job');
      setIsSubmitting(false);
    }
  };

  // Prepare all media items for the viewer
  const getAllMedia = (): MediaItem[] => {
    const items: MediaItem[] = [];
    
    if (request.photos && request.photos.length > 0) {
      request.photos.forEach(photo => {
        items.push({ uri: photo, type: 'image' });
      });
    }
    
    if (request.videos && request.videos.length > 0) {
      request.videos.forEach(video => {
        items.push({ uri: video, type: 'video' });
      });
    }
    
    return items;
  };

  const openMediaViewer = (type: 'image' | 'video', index: number) => {
    const allMedia = getAllMedia();
    
    // Calculate the correct index based on type
    let actualIndex = index;
    if (type === 'video') {
      // Videos come after images
      const imageCount = request.photos?.length || 0;
      actualIndex = imageCount + index;
    }
    
    setMediaViewerItems(allMedia);
    setMediaViewerInitialIndex(actualIndex);
    setMediaViewerVisible(true);
  };

  const openImageViewer = (index: number) => {
    openMediaViewer('image', index);
  };

  const openVideoViewer = (index: number) => {
    openMediaViewer('video', index);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>{(request.service_type || request.serviceType || 'Request').toString()}</Text>
              <Text style={styles.headerSubtitle}>{(request.providerName || 'Client').toString()}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={28} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Description Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.description}>{request.description}</Text>
          </View>

          {/* Inspection Fee Card */}
          <View style={[styles.card, styles.feeCard]}>
            <View style={styles.feeHeader}>
              <Feather name="dollar-sign" size={20} color={colors.primary} />
              <Text style={styles.feeLabel}>Inspection Fee</Text>
            </View>
            <Text style={styles.feeAmount}>${request.inspectionFee ?? 75}</Text>
          </View>

          {/* Type Card */}
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Feather name="home" size={20} color={colors.textSecondary} />
              <Text style={styles.iconLabel}>Type</Text>
            </View>
            <Text style={styles.cardValue}>{request.location_type || request.locationType || 'Residential'}</Text>
          </View>

          {/* Distance Card */}
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Feather name="map-pin" size={20} color={colors.textSecondary} />
              <Text style={styles.iconLabel}>{viewOnly ? 'Address' : 'Distance'}</Text>
            </View>
            {viewOnly ? (
              <>
                <Text style={styles.cardValue}>{request.street_address || request.address}</Text>
                {request.apt_suite_unit && (
                  <Text style={styles.cardSubtext}>Unit {request.apt_suite_unit}</Text>
                )}
                <Text style={styles.cardSubtext}>
                  {request.city}, {request.state} {request.zip_code}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.cardValue}>{distance} miles away</Text>
                <Text style={styles.cardSubtext}>Full address shared after acceptance</Text>
              </>
            )}
          </View>

          {/* Availability Window Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Availability Window</Text>
            <Text style={styles.cardValue}>{request.availabilityWindow || 'Not provided'}</Text>
          </View>

          {/* Location in House Card */}
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Feather name="map-pin" size={20} color={colors.textSecondary} />
              <Text style={styles.iconLabel}>Location in House</Text>
            </View>
            <Text style={styles.cardValue}>{request.location || 'Not specified'}</Text>
          </View>

          {/* House Type Card */}
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Feather name="home" size={20} color={colors.textSecondary} />
              <Text style={styles.iconLabel}>House Type</Text>
            </View>
            <Text style={styles.cardValue}>{request.locationType || 'Residential'}</Text>
          </View>

          {/* Parking Card */}
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Feather name="key" size={20} color={colors.textSecondary} />
              <Text style={styles.iconLabel}>Parking</Text>
            </View>
            <Text style={styles.cardValue}>
              {request.parking_notes || request.parkingNotes || 'Street parking available.'}
            </Text>
          </View>

          {/* Pets On Site Card */}
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Feather name="shield" size={20} color={colors.textSecondary} />
              <Text style={styles.iconLabel}>Pets On Site</Text>
            </View>
            <Text style={styles.cardValue}>
              {(request.pets_on_site ?? request.petsOnSite) ? 'Pets on site' : 'No pets'}
            </Text>
          </View>

          {/* Images Section */}
          <View style={styles.mediaSection}>
            <Text style={styles.sectionTitle}>Images</Text>
            {request.photos && request.photos.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaRow}
              >
                {request.photos.map((photo, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.mediaItem}
                    onPress={() => openImageViewer(index)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: photo }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />
                    <View style={styles.mediaOverlay}>
                      <Feather name="maximize-2" size={20} color={colors.white} />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noMediaContainer}>
                <Feather name="image" size={32} color={colors.gray400} />
                <Text style={styles.noMediaText}>No images provided</Text>
              </View>
            )}
          </View>

          {/* Videos Section */}
          <View style={styles.mediaSection}>
            <Text style={styles.sectionTitle}>Videos</Text>
            {request.videos && request.videos.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaRow}
              >
                {request.videos.map((video, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.mediaItem}
                    onPress={() => openVideoViewer(index)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.videoThumbnail}>
                      <Feather name="play-circle" size={40} color={colors.white} />
                      <Text style={styles.videoLabel}>Tap to play</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noMediaContainer}>
                <Feather name="video" size={32} color={colors.gray400} />
                <Text style={styles.noMediaText}>No videos provided</Text>
              </View>
            )}
          </View>

          {/* Send a Message Section */}
          <View style={styles.messageSection}>
            <Text style={styles.sectionTitle}>Send a Message</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Ex. Can you please send more images of the upper..."
              placeholderTextColor={colors.gray400}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Extra space at bottom */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          {viewOnly ? (
            <TouchableOpacity style={styles.backButtonFull} onPress={onClose}>
              <Text style={styles.backButtonFullText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptPress}>
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Media Viewer Modal */}
        <MediaViewerModal
          visible={mediaViewerVisible}
          media={mediaViewerItems}
          initialIndex={mediaViewerInitialIndex}
          onClose={() => setMediaViewerVisible(false)}
        />

        {/* Accept Job Modal - Date/Time Selection */}
        <AcceptJobModal
          visible={showAcceptJobModal}
          availableDates={request.available_dates || []}
          timeWindows={request.time_windows || {}}
          onClose={() => setShowAcceptJobModal(false)}
          onAccept={handleConfirmAccept}
          isSubmitting={isSubmitting}
        />
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
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    opacity: 0.95,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  feeCard: {
    borderColor: colors.primary + '30',
    backgroundColor: colors.primary + '05',
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  feeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  feeLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  feeAmount: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  cardValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  cardSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  imagesSection: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaSection: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  mediaItem: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  mediaImage: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
  },
  mediaOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoThumbnail: {
    width: 120,
    height: 120,
    backgroundColor: colors.gray800,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLabel: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
  },
  noMediaContainer: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
  },
  noMediaText: {
    color: colors.gray500,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
  },
  messageSection: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  messageInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray300,
    padding: spacing.lg,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    minHeight: 80,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonFull: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonFullText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
});
