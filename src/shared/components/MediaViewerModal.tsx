import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type MediaType = 'image' | 'video';

export interface MediaItem {
  uri: string;
  type: MediaType;
}

interface MediaViewerModalProps {
  visible: boolean;
  media: MediaItem[];
  initialIndex?: number;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  visible,
  media,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<Video>(null);
  const flatListRef = useRef<FlatList>(null);

  const currentMedia = media[currentIndex];

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsLoading(true);
    }
  };

  const goToNext = () => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsLoading(true);
    }
  };

  const renderMediaItem = () => {
    if (!currentMedia) return null;

    if (currentMedia.type === 'video') {
      return (
        <View style={styles.mediaContainer}>
          <Video
            ref={videoRef}
            source={{ uri: currentMedia.uri }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onLoadStart={() => setIsLoading(true)}
            onLoad={() => setIsLoading(false)}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.white} />
            </View>
          )}
          {!isLoading && (
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={togglePlayPause}
              activeOpacity={0.8}
            >
              <Feather
                name={isPlaying ? 'pause' : 'play'}
                size={48}
                color={colors.white}
              />
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: currentMedia.uri }}
          style={styles.image}
          resizeMode="contain"
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.white} />
          </View>
        )}
      </View>
    );
  };

  const renderThumbnail = ({ item, index }: { item: MediaItem; index: number }) => {
    const isActive = index === currentIndex;
    
    return (
      <TouchableOpacity
        style={[styles.thumbnail, isActive && styles.thumbnailActive]}
        onPress={() => {
          setCurrentIndex(index);
          setIsLoading(true);
        }}
        activeOpacity={0.7}
      >
        {item.type === 'video' ? (
          <View style={styles.videoThumbnailSmall}>
            <Feather name="play-circle" size={20} color={colors.white} />
          </View>
        ) : (
          <Image
            source={{ uri: item.uri }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
    );
  };

  if (media.length === 0) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={28} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {media.length}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Media Display */}
        <View style={styles.mainContent}>
          {/* Previous Button */}
          {currentIndex > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonLeft]}
              onPress={goToPrevious}
              activeOpacity={0.7}
            >
              <Feather name="chevron-left" size={36} color={colors.white} />
            </TouchableOpacity>
          )}

          {renderMediaItem()}

          {/* Next Button */}
          {currentIndex < media.length - 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonRight]}
              onPress={goToNext}
              activeOpacity={0.7}
            >
              <Feather name="chevron-right" size={36} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Thumbnails */}
        {media.length > 1 && (
          <View style={styles.thumbnailsContainer}>
            <FlatList
              ref={flatListRef}
              data={media}
              renderItem={renderThumbnail}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailsList}
            />
          </View>
        )}

        {/* Media Type Label */}
        <View style={styles.labelContainer}>
          <View style={styles.label}>
            <Feather
              name={currentMedia?.type === 'video' ? 'video' : 'image'}
              size={16}
              color={colors.white}
            />
            <Text style={styles.labelText}>
              {currentMedia?.type === 'video' ? 'Video' : 'Image'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray900 || '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeButton: {
    padding: spacing.sm,
  },
  counterText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  placeholder: {
    width: 44,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH - spacing.lg * 2,
    height: '100%',
  },
  video: {
    width: SCREEN_WIDTH - spacing.lg * 2,
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  playPauseButton: {
    position: 'absolute',
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
  },
  navButton: {
    position: 'absolute',
    zIndex: 10,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 30,
  },
  navButtonLeft: {
    left: spacing.md,
  },
  navButtonRight: {
    right: spacing.md,
  },
  thumbnailsContainer: {
    paddingVertical: spacing.lg,
  },
  thumbnailsList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: spacing.sm,
  },
  thumbnailActive: {
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoThumbnailSmall: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray800 || '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
  },
  labelText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
  },
});
