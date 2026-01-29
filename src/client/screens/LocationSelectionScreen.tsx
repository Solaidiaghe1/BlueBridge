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
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../shared/theme';
import { Header } from '../../shared/components/Header';
import { mockLocations } from '../../services/mockServices';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78;
const CARD_SPACING = spacing.md;

// Icon component for locations
const LocationIcon: React.FC<{ type: string }> = ({ type }) => {
  const renderIcon = () => {
    switch (type) {
      case 'kitchen':
        return <MaterialCommunityIcons name="chef-hat" size={80} color="white" />;
      case 'bathroom':
        return <Ionicons name="water" size={80} color="white" />;
      case 'bedroom':
        return <Ionicons name="bed" size={80} color="white" />;
      case 'living_room':
        return <MaterialCommunityIcons name="sofa" size={80} color="white" />;
      case 'outdoor':
        return <MaterialCommunityIcons name="tree" size={80} color="white" />;
      case 'basement':
        return <MaterialCommunityIcons name="home-floor-b" size={80} color="white" />;
      case 'garage':
        return <MaterialCommunityIcons name="garage" size={80} color="white" />;
      default:
        return <MaterialCommunityIcons name="home" size={80} color="white" />;
    }
  };

  return (
    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
      {renderIcon()}
    </View>
  );
};

interface LocationSelectionScreenProps {
  serviceType: string;
  onLocationSelect: (location: string) => void;
  onSkip: () => void;
  onBack: () => void;
}

export const LocationSelectionScreen: React.FC<LocationSelectionScreenProps> = ({
  serviceType,
  onLocationSelect,
  onSkip,
  onBack,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header 
          title="Select Location" 
          subtitle="Which area of your home needs attention?"
        />

        {/* Location Carousel */}
        <View style={styles.section}>
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
                <LocationIcon type={location.type} />
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationDescription}>{location.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {mockLocations.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>Skip this step</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity style={styles.skipButton} onPress={onBack}>
          <Text style={styles.skipButtonText}>Back</Text>
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
  section: {
    paddingVertical: spacing.xl,
  },
  carousel: {
    marginBottom: spacing.lg,
  },
  carouselContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
    gap: CARD_SPACING,
  },
  locationCard: {
    width: CARD_WIDTH,
    aspectRatio: 1.1,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconEmoji: {
    fontSize: 64,
  },
  locationName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  locationDescription: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    opacity: 0.75,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray300,
  },
  paginationDotActive: {
    width: 32,
    backgroundColor: colors.primary,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  skipButtonText: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});
