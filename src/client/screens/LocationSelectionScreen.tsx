import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../shared/theme';
import { Header } from '../../shared/components/Header';
import { mockLocations } from '../../services/mockServices';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_SPACING = spacing.lg;

interface LocationSelectionScreenProps {
  serviceType: string;
  onLocationSelect: (location: string) => void;
  onSkip: () => void;
}

export const LocationSelectionScreen: React.FC<LocationSelectionScreenProps> = ({
  serviceType,
  onLocationSelect,
  onSkip,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header title="Select Location" subtitle="Which area of your home needs attention?" />

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {mockLocations.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentIndex && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Location Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          contentContainerStyle={styles.carouselContent}
          style={styles.carousel}
          onScroll={(event) => {
            const x = event.nativeEvent.contentOffset.x;
            const index = Math.round(x / (CARD_WIDTH + CARD_SPACING));
            setCurrentIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {mockLocations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={[
                styles.locationCard,
                shadows.lg,
                { backgroundColor: location.color },
              ]}
              onPress={() => onLocationSelect(location.type)}
              activeOpacity={0.9}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>
                  {location.type === 'kitchen' ? '👨‍🍳' : 
                   location.type === 'bathroom' ? '🚿' :
                   location.type === 'bedroom' ? '🛏️' :
                   location.type === 'living_room' ? '🛋️' :
                   location.type === 'outdoor' ? '🌳' :
                   location.type === 'basement' ? '📦' :
                   location.type === 'garage' ? '🚗' : '🏠'}
                </Text>
              </View>
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationDescription}>{location.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>Skip this step</Text>
        </TouchableOpacity>
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray300,
  },
  progressDotActive: {
    width: 32,
    backgroundColor: colors.primary,
  },
  carousel: {
    marginBottom: spacing.xl,
  },
  carouselContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
    gap: CARD_SPACING,
  },
  locationCard: {
    width: CARD_WIDTH,
    height: 360,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 64,
  },
  locationName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  locationDescription: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  skipButtonText: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});
