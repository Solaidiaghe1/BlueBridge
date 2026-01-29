import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../shared/theme';
import { Header } from '../../shared/components/Header';
import { mockServices } from '../../services/mockServices';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78;
const CARD_SPACING = spacing.md;

interface HomeScreenProps {
  onServiceSelect: (serviceType: string) => void;
}

// Icon component for services
const ServiceIcon: React.FC<{ type: string; color: string }> = ({ type }) => {
  const renderIcon = () => {
    switch (type) {
      case 'plumbing':
        return <MaterialCommunityIcons name="pipe-wrench" size={80} color="white" />;
      case 'hvac':
        return <MaterialCommunityIcons name="air-conditioner" size={80} color="white" />;
      case 'electrical':
        return <Ionicons name="flash" size={80} color="white" />;
      case 'carpentry':
        return <FontAwesome5 name="hammer" size={70} color="white" />;
      case 'landscaping':
        return <MaterialCommunityIcons name="tree" size={80} color="white" />;
      case 'painting':
        return <MaterialCommunityIcons name="format-paint" size={80} color="white" />;
      case 'walling':
        return <MaterialCommunityIcons name="wall" size={80} color="white" />;
      default:
        return <MaterialCommunityIcons name="pipe-wrench" size={80} color="white" />;
    }
  };

  return (
    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
      {renderIcon()}
    </View>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ onServiceSelect }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleNotificationPress = () => {
    // TODO: Navigate to notifications screen
    console.log('Notification pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header
          title="Connect with Skilled Workers"
          subtitle="Need a professional? Choose your service below and get connected with verified blue collar workers in minutes."
          showNotification={true}
          notificationCount={2}
          onNotificationPress={handleNotificationPress}
        />

        {/* Service Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a Service</Text>
          <Text style={styles.sectionSubtitle}>
            Choose the type of professional you need
          </Text>

          {/* Service Carousel */}
          <ScrollView
            ref={scrollViewRef}
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
            {mockServices.map((service, index) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  shadows.lg,
                  { backgroundColor: service.color },
                ]}
                onPress={() => onServiceSelect(service.type)}
                activeOpacity={0.9}
              >
                <ServiceIcon type={service.type} color={service.color} />
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.estimatedWait}>Estimated Wait: {service.estimatedWait}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {mockServices.map((_, index) => (
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

        {/* How It Works Section - Teaser */}
        <View style={styles.howItWorksTeaser}>
          <Text style={styles.sectionTitle}>How It Works</Text>
        </View>

        {/* Full How It Works Content */}
        <View style={styles.stepsSection}>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Select your service type</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Describe your issue</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Pay $19 inspection fee
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Get estimate, then decide
              </Text>
            </View>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  howItWorksTeaser: {
    paddingTop: spacing.ht,
    paddingBottom: spacing.sm,
  },
  stepsSection: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  carousel: {
    marginBottom: spacing.md,
  },
  carouselContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
    gap: CARD_SPACING,
  },
  serviceCard: {
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
  serviceName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  estimatedWait: {
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
  stepsContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
});
